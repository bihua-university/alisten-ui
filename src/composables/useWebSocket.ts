import type {
  ConnectionStatus,
  WebSocketConfig,
  WebSocketMessage,
} from '@/types'
import { ref } from 'vue'
import { useRoom } from './useRoom'

const ws = ref<WebSocket | null>(null)
const connectionStatus = ref<ConnectionStatus>('disconnected')
const isConnecting = ref(false)
const reconnectAttempts = ref(0)

// WebSocket 配置
const config: WebSocketConfig = {
  url: import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
  reconnectAttempts: 5,
  reconnectInterval: 3000,
  heartbeatInterval: 30000,
}

// 定时器
let reconnectTimer: NodeJS.Timeout | null = null

// 发送消息
function send(message: WebSocketMessage) {
  if (ws.value && ws.value.readyState === WebSocket.OPEN) {
    ws.value.send(JSON.stringify({
      ...message,
      timestamp: Date.now(),
    }))
    return true
  } else {
    console.warn('📤 WebSocket 未连接，消息发送失败:', message)
    return false
  }
} // 消息处理器类型定义
interface MessageHandler {
  type: string
  handler: (message: any) => void
}

// 消息类型处理器
const messageHandlers: MessageHandler[] = []

function registerMessageHandler(type: string, handler: (message: any) => void) {
  if (!type || typeof type !== 'string' || !handler || typeof handler !== 'function') {
    console.warn('⚠️ 无效的消息类型或处理器:', type, handler)
    return
  }

  const existingHandler = messageHandlers.find(h => h.type === type)
  if (existingHandler) {
    existingHandler.handler = handler
  } else {
    messageHandlers.push({ type, handler })
  }
}

// 处理具体消息类型
function handleMessageByType(messageType: string, message: any) {
  messageHandlers.find(h => h.type === messageType)?.handler(message)
}

// 处理接收到的消息
function handleMessage(event: MessageEvent) {
  try {
    // 验证消息格式
    if (!event.data) {
      console.warn('📭 收到空的消息数据')
      return
    }

    const message = JSON.parse(event.data)
    if (!message || typeof message !== 'object' || !message.type) {
      console.warn('📨 收到无效的消息格式:', event.data)
      return
    }

    // 处理消息
    handleMessageByType(message.type, message)
  } catch (error) {
    console.error('💥 处理 WebSocket 消息时发生错误:', error, event.data)
  }
}

// 连接 WebSocket
function connect() {
  if (isConnecting.value || connectionStatus.value === 'connected') {
    return
  }

  const { roomInfo, getCurrentPassword } = useRoom()
  const password = getCurrentPassword()

  // 如果没有密码但房间需要密码，则不连接
  if (roomInfo.value.needPwd && !password) {
    console.warn('⚠️ 房间需要密码但未提供密码')
    return
  }

  isConnecting.value = true
  connectionStatus.value = 'connecting'

  try {
    // 构建连接URL
    let wsUrl = config.url
    const roomId = roomInfo.value.id
    wsUrl += `/server?houseId=${roomId}`

    // 如果有密码，添加到URL中
    if (password) {
      wsUrl += `&housePwd=${encodeURIComponent(password)}`
    }

    console.log('🔗 连接 WebSocket:', wsUrl)
    ws.value = new WebSocket(wsUrl)

    ws.value.onopen = () => {
      console.log('🚀 WebSocket 连接已建立')
      connectionStatus.value = 'connected'
      isConnecting.value = false
      reconnectAttempts.value = 0
    }

    ws.value.onmessage = handleMessage

    ws.value.onclose = (event) => {
      console.log('🔌 WebSocket 连接已关闭:', event.code, event.reason)
      connectionStatus.value = 'disconnected'
      isConnecting.value = false

      // 非正常关闭时尝试重连
      if (event.code !== 1000 && reconnectAttempts.value < config.reconnectAttempts) {
        scheduleReconnect()
      }
    }

    ws.value.onerror = (error) => {
      console.error('❌ WebSocket 连接错误:', error)
      connectionStatus.value = 'error'
      isConnecting.value = false
    }
  } catch (error) {
    console.error('💥 创建 WebSocket 连接失败:', error)
    connectionStatus.value = 'error'
    isConnecting.value = false
  }
}

// 计划重连
function scheduleReconnect() {
  if (reconnectAttempts.value >= config.reconnectAttempts) {
    console.log('🛑 已达到最大重连次数，停止重连')
    return
  }

  connectionStatus.value = 'reconnecting'
  reconnectAttempts.value++

  console.log(`🔄 准备第 ${reconnectAttempts.value} 次重连...`)

  reconnectTimer = setTimeout(() => {
    connect()
  }, config.reconnectInterval)
}

// 断开连接
function disconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  if (ws.value) {
    ws.value.close(1000, '用户主动断开连接')
    ws.value = null
  }

  connectionStatus.value = 'disconnected'
  isConnecting.value = false
  reconnectAttempts.value = 0

  const { clearCurrentPassword } = useRoom()
  clearCurrentPassword()
}

// 手动重连
function reconnect() {
  disconnect()
  setTimeout(() => {
    connect()
  }, 1000)
}

// 命令处理器类型定义
interface CommandHandler {
  prefix: string
  handler: (args: string) => boolean | void
}

// 命令处理器
const commandHandlers: CommandHandler[] = [
  {
    prefix: '点歌',
    handler: (args: string) => {
      if (!args) {
        return false
      }

      console.log('🎵 发送点歌请求:', args)
      return send({
        action: '/music/pick',
        data: {
          name: args,
          source: 'wy', // 默认使用网易云音乐
        },
      })
    },
  },
]

// 处理命令消息
function handleCommand(content: string): boolean {
  const trimmedContent = content.trim()

  for (const commandHandler of commandHandlers) {
    if (trimmedContent.startsWith(commandHandler.prefix)) {
      const args = trimmedContent.substring(commandHandler.prefix.length).trim()
      const result = commandHandler.handler(args)

      // 如果处理器返回 false，表示命令处理失败，继续下一个处理器
      if (result !== false) {
        return true
      }
    }
  }

  return false
}

// 发送聊天消息
function sendChatMessage(content: string) {
  // 验证输入
  if (!content || typeof content !== 'string') {
    return false
  }
  const trimmedContent = content.trim()
  if (!trimmedContent || trimmedContent.length > 500) {
    console.warn('⚠️ 消息长度不能超过500个字符')
    return false
  }

  // 尝试处理命令
  if (handleCommand(trimmedContent)) {
    return true
  }
  return send({
    action: '/chat',
    data: {
      content: trimmedContent,
      sendTime: Date.now(),
    },
  })
}
// 发送歌曲点赞
function sendSongLike(index: number, name: string) {
  return send({
    action: '/music/good',
    data: {
      index,
      name,
    },
  })
}

// 删除播放列表中的歌曲
function sendDeleteSong(songName: string) {
  return send({
    action: '/music/delete',
    data: {
      id: songName,
    },
  })
}

export function useWebSocket() {
  return {
    // 状态
    connectionStatus,
    isConnecting,
    reconnectAttempts,

    // 方法
    connect,
    disconnect,
    reconnect,
    send,

    // 业务方法
    sendChatMessage,
    sendSongLike,
    sendDeleteSong,

    // 命令处理
    registerMessageHandler,

    // 配置
    config,
  }
}
