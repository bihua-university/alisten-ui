import { ref, onUnmounted, nextTick } from 'vue'
import type {
    WebSocketMessage,
    WebSocketConfig,
    ConnectionStatus,
    ChatMessage,
    SearchResult,
    Song
} from '@/types'
import { useRoomState } from '@/composables/useRoomState'
import { useLyrics } from '@/composables/useLyrics'
import { saveNickname, getSavedNickname } from '@/utils/user'

export const useWebSocket = () => {
    const ws = ref<WebSocket | null>(null)
    const connectionStatus = ref<ConnectionStatus>('disconnected')
    const isConnecting = ref(false)
    const reconnectAttempts = ref(0)    // 使用共享的房间状态
    const { roomState, addChatMessage, updateSearchResults, setCurrentSong, setPushTime, updatePlaylist } = useRoomState()
    const { loadLrcLyrics } = useLyrics()

    // WebSocket 配置
    const config: WebSocketConfig = {
        url: import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
        reconnectAttempts: 5,
        reconnectInterval: 3000,
        heartbeatInterval: 30000
    }
    // 事件监听器
    const messageHandlers = new Map<string, Function[]>()

    // 定时器
    let reconnectTimer: NodeJS.Timeout | null = null

    // 添加事件监听器
    const on = (event: string, handler: Function) => {
        if (!messageHandlers.has(event)) {
            messageHandlers.set(event, [])
        }
        messageHandlers.get(event)?.push(handler)
    }

    // 移除事件监听器
    const off = (event: string, handler: Function) => {
        const handlers = messageHandlers.get(event)
        if (handlers) {
            const index = handlers.indexOf(handler)
            if (index > -1) {
                handlers.splice(index, 1)
            }
        }
    }

    // 触发事件
    const emit = (event: string, data: any) => {
        const handlers = messageHandlers.get(event)
        if (handlers) {
            handlers.forEach(handler => handler(data))
        }
    }

    // 发送消息
    const send = (message: WebSocketMessage) => {
        if (ws.value && ws.value.readyState === WebSocket.OPEN) {
            ws.value.send(JSON.stringify({
                ...message,
                timestamp: Date.now()
            }))
            return true
        } else {
            console.warn('WebSocket 未连接，消息发送失败:', message)
            return false
        }
    }

    // 处理接收到的消息
    const handleMessage = (event: MessageEvent) => {
        try {
            const message = JSON.parse(event.data)

            // 根据消息类型处理
            switch (message.type) {
                case 'chat':
                    if (message.content) {
                        console.log('接收到聊天消息:', message.content)
                        const msg: ChatMessage = {
                            id: Date.now(), // 使用时间戳作为唯一ID
                            content: message.content,
                            timestamp: message.sendTime,
                            user: {
                                id: message.userId || 0,
                                name: message.nickName || '未知用户',
                                avatar: message.userAvatar || 'https://picsum.photos/200/200?random=1'
                            }
                        }
                        addChatMessage(msg)
                        // 自动滚动到底部
                        nextTick(() => {
                            const chatContainer = document.querySelector('.chat-messages')
                            if (chatContainer) {
                                chatContainer.scrollTop = chatContainer.scrollHeight
                            }
                        })
                    }
                    break

                case 'music':
                    console.log('接收到音乐消息:', message)
                    const music: Song = {
                        id: message.id,
                        url: message.url,
                        title: message.name,
                        artist: message.artist || '未知艺术家',
                        album: message.album?.name || '未知专辑',
                        duration: message.duration,
                        cover: message.pictureUrl,
                    }
                    setCurrentSong(music)                    // 设置服务器下发音乐的时间
                    setPushTime(message.pushTime || Date.now())
                    loadLrcLyrics(message.lyric || '')
                    break

                case 'search':
                    if (message.data && Array.isArray(message.data)) {
                        console.log('接收到搜索结果:', message.data)
                        const results: SearchResult[] = message.data.map((item: any) => ({
                            id: item.id,
                            title: item.name,
                            artist: item.artist || '未知艺术家',
                            album: item.album.name || '未知专辑',
                            cover: item.cover || `https://picsum.photos/200/200?random=${Date.now()}`,
                            duration: item.duration || 240,
                            requestedBy: {
                                id: 0,
                                name: '未知用户',
                                avatar: ''
                            },
                        }))
                        updateSearchResults(results)
                    }
                    break

                case 'pick': // playlist
                    if (message.data && Array.isArray(message.data)) {
                        console.log('接收到播放列表:', message.data)
                        const playlist: Song[] = message.data.map((item: any) => ({
                            url: '',
                            title: item.name,
                            artist: item.artist || '未知艺术家',
                            album: item.album.name || '未知专辑',
                            duration: (item.duration / 1000) || 240,
                            cover: item.pictureUrl || `https://picsum.photos/200/200?random=${Date.now()}`,
                            requestedBy: {
                                id: 0,
                                name: item.nickName,
                                avatar: ''
                            },
                        }))
                        updatePlaylist(playlist)
                    }
                    break

                default:
                    console.log('未处理的消息类型:', message.type, message.data)
            }
        } catch (error) {
            console.error('解析 WebSocket 消息失败:', error, event.data)
        }
    }
    // 连接 WebSocket
    const connect = (roomId?: string) => {
        if (isConnecting.value || connectionStatus.value === 'connected') {
            return
        }

        isConnecting.value = true
        connectionStatus.value = 'connecting'

        try {
            // 构建连接URL
            let wsUrl = config.url
            roomId = "733dbb38-31d0-419c-9019-5c12777246c8"
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
                    console.log('发送保存的昵称:', savedNickname)
                      send({
                          action: '/setting/name',
                          data: {
                              name: savedNickname,
                              sendTime: Date.now(),
                          }
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

        } catch (error) {
            console.error('创建 WebSocket 连接失败:', error)
            connectionStatus.value = 'error'
            isConnecting.value = false
            emit('error', { error, message: '创建 WebSocket 连接失败' })
        }
    }

    // 计划重连
    const scheduleReconnect = () => {
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
    const disconnect = () => {
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
    const reconnect = () => {
        disconnect()
        setTimeout(() => {
            connect()
        }, 1000)
    }
    // 发送聊天消息
    const sendChatMessage = (content: string) => {
        // 检查是否为点歌指令
        if (content.trim().startsWith('点歌')) {
            const songName = content.trim().substring(2).trim()
            if (songName) {
                // 发送搜索指令
                return send({
                    action: '/music/pick',
                    data: {
                        name: songName,
                        source: 'wy', // 默认使用网易云音乐
                    }
                })
            }
        } else if (content.trim().startsWith('设置昵称')) {
            const name = content.trim().substring(4).trim()
            if (name) {
                // 保存昵称到本地存储
                saveNickname(name)
                console.log('昵称已保存到本地存储:', name)
                
                return send({
                    action: '/setting/name',
                    data: {
                        name,
                        sendTime: Date.now(),
                    }
                })
            }
        }else {
            // 普通聊天消息
            return send({
                action: '/chat',
                data: {
                    content,
                    sendTime: Date.now(),
                }
            })
        }
    }
    // 发送歌曲点赞
    const sendSongLike = (index: number, name: string) => {
        return send({
            action: '/music/good',
            data: {
                index,
                name
            }
        })
    }
    // 发送播放状态变化
    const sendPlayStateChange = (isPlaying: boolean, currentTime: number) => {
        return send({
            action: 'play_state_change',
            data: {
                isPlaying,
                currentTime
            }
        })
    }

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
        emit,

        // 业务方法
        sendChatMessage,
        sendSongLike,
        sendPlayStateChange,

        // 配置
        config
    }
}
