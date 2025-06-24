import type {
  ChatMessage,
  ConnectionStatus,
  SearchResult,
  Song,
  User,
  WebSocketConfig,
  WebSocketMessage,
} from '@/types'
import { nextTick, onUnmounted, ref } from 'vue'
import { useLyrics } from '@/composables/useLyrics'
import { useRoomState } from '@/composables/useRoomState'
import { getSavedNickname, processUsers, saveNickname } from '@/utils/user'

// 定义事件处理器类型
type EventHandler = (message: any) => void

const ws = ref<WebSocket | null>(null)
const connectionStatus = ref<ConnectionStatus>('disconnected')
const isConnecting = ref(false)
const reconnectAttempts = ref(0) // 使用共享的房间状态

const { roomState, addChatMessage, updateSearchResults, setCurrentSong, setPushTime, updatePlaylist, updateOnlineUsers } = useRoomState()
const { loadLrcLyrics } = useLyrics()

// WebSocket 配置
const config: WebSocketConfig = {
  url: import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
  reconnectAttempts: 5,
  reconnectInterval: 3000,
  heartbeatInterval: 30000,
}
// 事件监听器
const messageHandlers = new Map<string, EventHandler[]>()

// 定时器
let reconnectTimer: NodeJS.Timeout | null = null

// 添加事件监听器
function on(event: string, handler: EventHandler) {
  if (!messageHandlers.has(event)) {
    messageHandlers.set(event, [])
  }
  messageHandlers.get(event)?.push(handler)
}

// 移除事件监听器
function off(event: string, handler: EventHandler) {
  const handlers = messageHandlers.get(event)
  if (handlers) {
    const index = handlers.indexOf(handler)
    if (index > -1) {
      handlers.splice(index, 1)
    }
  }
}

// 触发事件
function emit(event: string, data: any) {
  const handlers = messageHandlers.get(event)
  if (handlers) {
    handlers.forEach(handler => handler(data))
  }
}

// 发送消息
function send(message: WebSocketMessage) {
  if (ws.value && ws.value.readyState === WebSocket.OPEN) {
    ws.value.send(JSON.stringify({
      ...message,
      timestamp: Date.now(),
    }))
    return true
  }
  else {
    console.warn('WebSocket 未连接，消息发送失败:', message)
    return false
  }
} // 消息处理器类型定义
interface MessageTypeHandler {
  type: string
  handler: (message: any) => void
}

// 自动滚动聊天容器到底部
function scrollChatToBottom() {
  nextTick(() => {
    const chatContainer = document.querySelector('.chat-messages')
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight
    }
  })
}

// 获取默认头像
function getDefaultAvatar(seed?: string | number): string {
  const randomSeed = seed || Date.now()
  return `https://picsum.photos/200/200?random=${randomSeed}`
}

// 消息类型处理器
const messageTypeHandlers: MessageTypeHandler[] = [
  {
    type: 'chat',
    handler: (message: any) => {
      if (!message.content) {
        console.warn('收到空的聊天消息')
        return
      }

      const msg: ChatMessage = {
        content: message.content,
        timestamp: message.sendTime || Date.now(),
        user: {
          name: message.nickName || '未知用户',
          avatar: message.userAvatar || getDefaultAvatar(1),
        },
      }

      addChatMessage(msg)
      scrollChatToBottom()
    },
  },
  {
    type: 'music',
    handler: (message: any) => {
      if (!message.url) {
        console.warn('收到不完整的音乐消息:', message)
        return
      }

      let url = message.url || ''
      if (url.includes('kuwo.cn') && !url.includes('-')) {
        const urls = url.split('.sycdn.')
        const headUrls = urls[0].replace('http://', '').split('.')
        const lastHeadUrl = headUrls[headUrls.length - 1]
        url = `https://${lastHeadUrl}-sycdn.${urls[1]}&timestamp=${Date.now()}`
      }
      url = url.replace('http://', 'https://')

      const music: Song = {
        url,
        title: message.name,
        artist: message.artist || '未知艺术家',
        album: message.album?.name || '未知专辑',
        duration: message.duration || 0,
        cover: message.pictureUrl || getDefaultAvatar(message.id),
      }

      setCurrentSong(music)
      setPushTime(message.pushTime || Date.now())
      loadLrcLyrics(message.lyric || '')
    },
  },
  {
    type: 'search',
    handler: (message: any) => {
      if (!message.data || !Array.isArray(message.data)) {
        console.warn('收到无效的搜索结果:', message)
        return
      }

      const results: SearchResult[] = message.data
        .filter((item: any) => item && item.id && item.name) // 过滤无效数据
        .map((item: any) => ({
          id: item.id,
          title: item.name,
          artist: item.artist || '未知艺术家',
          album: item.album?.name || '未知专辑',
          cover: item.cover || getDefaultAvatar(item.id),
          duration: item.duration || 240,
          requestedBy: {
            name: item.requestedBy?.name || '未知用户',
            avatar: item.requestedBy?.avatar || getDefaultAvatar(),
          },
        }))

      updateSearchResults(results)
    },
  },
  {
    type: 'searchlist',
    handler: (message: any) => {
      if (!message.data || !Array.isArray(message.data)) {
        console.warn('收到无效的搜索结果:', message)
        return
      }

      const results: SearchResult[] = message.data
        .filter((item: any) => item && item.id && item.name) // 过滤无效数据
        .map((item: any) => ({
          id: item.id,
          title: item.name,
          cover: item.pictureUrl || getDefaultAvatar(item.id),
          creator: item.creator,
          songCount: item.songCount,
        }))

      updateSearchResults(results)
    },
  },
  {
    type: 'pick',
    handler: (message: any) => {
      if (!message.data || !Array.isArray(message.data)) {
        console.warn('收到无效的播放列表:', message)
        return
      }

      const playlist: Song[] = message.data
        .filter((item: any) => item && item.name) // 过滤无效数据
        .map((item: any) => ({
          id: item.id,
          url: item.url || '',
          title: item.name,
          artist: item.artist || '未知艺术家',
          album: item.album?.name || '未知专辑',
          duration: item.duration ? (item.duration / 1000) : 240,
          cover: item.pictureUrl || getDefaultAvatar(item.id),
          requestedBy: {
            name: item.nickName || '未知用户',
            avatar: getDefaultAvatar(),
          },
        }))

      updatePlaylist(playlist)
    },
  },
  {
    type: 'house_user',
    handler: (message: any) => {
      if (!message.data || !Array.isArray(message.data)) {
        console.warn('收到无效的用户列表:', message)
        return
      }

      const users: User[] = message.data
        .filter((item: any) => item && typeof item === 'string') // 确保是字符串类型
        .map((item: string) => ({
          name: item,
          avatar: getDefaultAvatar(1),
        }))

      updateOnlineUsers(processUsers(users))
    },
  },
]

// 处理具体消息类型
function handleMessageByType(messageType: string, message: any) {
  messageTypeHandlers.find(h => h.type === messageType)?.handler(message)
}

// 处理接收到的消息
function handleMessage(event: MessageEvent) {
  try {
    // 验证消息格式
    if (!event.data) {
      console.warn('收到空的消息数据')
      return
    }

    const message = JSON.parse(event.data)
    if (!message || typeof message !== 'object' || !message.type) {
      console.warn('收到无效的消息格式:', event.data)
      return
    }

    // 处理消息
    handleMessageByType(message.type, message)
  }
  catch (error) {
    console.error('处理 WebSocket 消息时发生错误:', error, event.data)
    emit('error', { error, message: '处理 WebSocket 消息失败' })
  }
}
// 连接 WebSocket
function connect(roomId?: string) {
  if (isConnecting.value || connectionStatus.value === 'connected') {
    return
  }

  isConnecting.value = true
  connectionStatus.value = 'connecting'

  try {
    // 构建连接URL
    let wsUrl = config.url
    roomId = '733dbb38-31d0-419c-9019-5c12777246c8'
    if (roomId) {
      wsUrl += `/server?houseId=${roomId}`
    }

    console.log('连接 WebSocket:', wsUrl)
    ws.value = new WebSocket(wsUrl)

    ws.value.onopen = () => {
      console.log('WebSocket 连接已建立')
      connectionStatus.value = 'connected'
      isConnecting.value = false
      reconnectAttempts.value = 0
      emit('connected', { url: wsUrl })
      // 连接成功后，发送保存的昵称
      const savedNickname = getSavedNickname()
      if (savedNickname) {
        send({
          action: '/setting/name',
          data: {
            name: savedNickname,
            sendTime: Date.now(),
          },
        })
      }
    }

    ws.value.onmessage = handleMessage

    ws.value.onclose = (event) => {
      console.log('WebSocket 连接已关闭:', event.code, event.reason)
      connectionStatus.value = 'disconnected'
      isConnecting.value = false

      // 非正常关闭时尝试重连
      if (event.code !== 1000 && reconnectAttempts.value < config.reconnectAttempts) {
        scheduleReconnect()
      }

      emit('disconnected', { code: event.code, reason: event.reason })
    }

    ws.value.onerror = (error) => {
      console.error('WebSocket 连接错误:', error)
      connectionStatus.value = 'error'
      isConnecting.value = false
      emit('error', { error, message: 'WebSocket 连接失败' })
    }
  }
  catch (error) {
    console.error('创建 WebSocket 连接失败:', error)
    connectionStatus.value = 'error'
    isConnecting.value = false
    emit('error', { error, message: '创建 WebSocket 连接失败' })
  }
}

// 计划重连
function scheduleReconnect() {
  if (reconnectAttempts.value >= config.reconnectAttempts) {
    console.log('已达到最大重连次数，停止重连')
    return
  }

  connectionStatus.value = 'reconnecting'
  reconnectAttempts.value++

  console.log(`准备第 ${reconnectAttempts.value} 次重连...`)

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

      console.log('发送点歌请求:', args)
      return send({
        action: '/music/pick',
        data: {
          name: args,
          source: 'wy', // 默认使用网易云音乐
        },
      })
    },
  },
  {
    prefix: '设置昵称',
    handler: (args: string) => {
      if (!args) {
        return false
      }
      // 保存昵称到本地存储
      saveNickname(args)
      return send({
        action: '/setting/name',
        data: {
          name: args,
          sendTime: Date.now(),
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
    console.warn('消息长度不能超过500个字符')
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

export function useWebSocket() {
  // 清理资源
  onUnmounted(() => {
    disconnect()
  })

  return {
    // 状态
    connectionStatus,
    isConnecting,
    reconnectAttempts,
    roomState,

    // 方法
    connect,
    disconnect,
    reconnect,
    send,

    // 事件监听
    on,
    off,
    emit, // 业务方法
    sendChatMessage,
    sendSongLike,

    // 配置
    config,
  }
}
