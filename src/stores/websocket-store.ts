import type { ConnectionStatus, WebSocketConfig, WebSocketMessage } from '@/types'
import { roomStore } from './room-store'
import { Store } from './store-base'

interface WebSocketState {
  ws: WebSocket | null
  connectionStatus: ConnectionStatus
  isConnecting: boolean
  reconnectAttempts: number
}

const config: WebSocketConfig = {
  url: import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
  reconnectAttempts: 5,
  reconnectInterval: 3000,
  heartbeatInterval: 30000,
}

interface MessageHandler {
  type: string
  handler: (message: any) => void
}

const messageHandlers: MessageHandler[] = []
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

class WebSocketStore extends Store<WebSocketState> {
  constructor() {
    super({ ws: null, connectionStatus: 'disconnected', isConnecting: false, reconnectAttempts: 0 })
  }

  registerMessageHandler(type: string, handler: (message: any) => void) {
    if (!type || typeof type !== 'string' || !handler || typeof handler !== 'function') {
      console.warn('无效的消息类型或处理器:', type, handler)
      return
    }
    const existing = messageHandlers.find(h => h.type === type)
    if (existing) {
      existing.handler = handler
    } else {
      messageHandlers.push({ type, handler })
    }
  }

  private handleMessageByType(messageType: string, message: any) {
    messageHandlers.find(h => h.type === messageType)?.handler(message)
  }

  private handleMessage(event: MessageEvent) {
    try {
      if (!event.data)
        return
      const message = JSON.parse(event.data)
      if (!message || typeof message !== 'object' || !message.type) {
        console.warn('收到无效的消息格式:', event.data)
        return
      }
      this.handleMessageByType(message.type, message)
    } catch (error) {
      console.error('处理 WebSocket 消息时发生错误:', error, event.data)
    }
  }

  connect() {
    if (this.state.isConnecting || this.state.connectionStatus === 'connected')
      return

    const password = roomStore.getCurrentPassword()
    if (roomStore.state.needPwd && !password) {
      console.warn('房间需要密码但未提供密码')
      return
    }

    this.setState({ isConnecting: true, connectionStatus: 'connecting' })

    try {
      let wsUrl = config.url
      wsUrl += `/server?houseId=${roomStore.state.id}`
      if (password)
        wsUrl += `&housePwd=${encodeURIComponent(password)}`

      console.log('连接 WebSocket:', wsUrl)
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('WebSocket 连接已建立')
        this.setState({ connectionStatus: 'connected', isConnecting: false, reconnectAttempts: 0 })
      }

      ws.onmessage = this.handleMessage.bind(this)

      ws.onclose = (event) => {
        console.log('WebSocket 连接已关闭:', event.code, event.reason)
        this.setState({ connectionStatus: 'disconnected', isConnecting: false })
        if (event.code !== 1000 && this.state.reconnectAttempts < config.reconnectAttempts) {
          this.scheduleReconnect()
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket 连接错误:', error)
        this.setState({ connectionStatus: 'error', isConnecting: false })
      }

      this.setState({ ws })
    } catch (error) {
      console.error('创建 WebSocket 连接失败:', error)
      this.setState({ connectionStatus: 'error', isConnecting: false })
    }
  }

  private scheduleReconnect() {
    if (this.state.reconnectAttempts >= config.reconnectAttempts) {
      console.log('已达到最大重连次数，停止重连')
      return
    }
    const attempts = this.state.reconnectAttempts + 1
    this.setState({ connectionStatus: 'reconnecting', reconnectAttempts: attempts })
    console.log(`准备第 ${attempts} 次重连...`)
    reconnectTimer = setTimeout(() => this.connect(), config.reconnectInterval)
  }

  disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (this.state.ws) {
      this.state.ws.close(1000, '用户主动断开连接')
      this.setState({ ws: null, connectionStatus: 'disconnected', isConnecting: false, reconnectAttempts: 0 })
    }
    roomStore.clearCurrentPassword()
  }

  reconnect() {
    this.disconnect()
    setTimeout(() => this.connect(), 1000)
  }

  send(message: WebSocketMessage) {
    if (this.state.ws && this.state.ws.readyState === WebSocket.OPEN) {
      this.state.ws.send(JSON.stringify({ ...message, timestamp: Date.now() }))
      return true
    }
    console.warn('WebSocket 未连接，消息发送失败:', message)
    return false
  }

  sendChatMessage(content: string) {
    if (!content || typeof content !== 'string')
      return false
    const trimmed = content.trim()
    if (!trimmed || trimmed.length > 500) {
      console.warn('消息长度不能超过500个字符')
      return false
    }
    // Try command handling
    if (this.handleCommand(trimmed))
      return true
    return this.send({ action: '/chat', data: { content: trimmed, sendTime: Date.now() } })
  }

  private handleCommand(content: string): boolean {
    const trimmed = content.trim()
    if (trimmed.startsWith('点歌')) {
      const args = trimmed.substring(2).trim()
      if (!args || !roomStore.state.ultimate)
        return false
      const isUrl = args.startsWith('http://') || args.startsWith('https://')
      const isBilibili = args.startsWith('BV') || args.startsWith('av')
      const source = isUrl ? 'url_common' : isBilibili ? 'db' : 'wy'
      const id = (isUrl || isBilibili) ? args : undefined
      return this.send({ action: '/music/pick', data: { id, name: args, source } })
    }
    return false
  }

  sendSongLike(index: number, name: string) {
    return this.send({ action: '/music/good', data: { index, name } })
  }

  sendDeleteSong(songName: string) {
    return this.send({ action: '/music/delete', data: { id: songName } })
  }

  getConfig() {
    return config
  }
}

export const websocketStore = new WebSocketStore()
