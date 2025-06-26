import type { ChatMessage, User } from '@/types'
import { computed, reactive } from 'vue'
import { getDefaultAvatar, processUser, processUsers } from '@/utils/user'
import { useWebSocket } from './useWebSocket'

// 全局共享的聊天状态
const chatState = reactive<{
  chatMessages: ChatMessage[]
  onlineUsers: User[]
}>({
  chatMessages: [],
  onlineUsers: [],
})

// 在模块加载时就注册消息处理器（只执行一次）
const { registerMessageHandler } = useWebSocket()

// 注册聊天消息处理器
registerMessageHandler('chat', (message: any) => {
  if (!message.content) {
    console.warn('收到空的聊天消息')
    return
  }

  const msg: ChatMessage = {
    content: message.content,
    timestamp: message.sendTime || Date.now(),
    user: {
      name: message.nickName || '未知用户',
      avatar: message.userAvatar || getDefaultAvatar(),
    },
  }

  // 直接操作全局状态
  chatState.chatMessages.push(msg)
})

// 注册在线用户处理器
registerMessageHandler('house_user', (message: any) => {
  if (!message.data || !Array.isArray(message.data)) {
    console.warn('📧 收到无效的用户列表:', message)
    return
  }

  const users: User[] = message.data
    .filter((item: any) => item && typeof item === 'string') // 确保是字符串类型
    .map((item: string) => ({
      name: item,
      avatar: getDefaultAvatar(1),
    }))

  // 直接操作全局状态
  chatState.onlineUsers = [...processUsers(users)]
})

export function useChat() {
  const { sendChatMessage, send } = useWebSocket()

  // 聊天消息相关操作
  const addChatMessage = (message: ChatMessage) => {
    chatState.chatMessages.push(message)
  }

  const clearChatMessages = () => {
    chatState.chatMessages = []
  }

  // 在线用户相关操作
  const updateOnlineUsers = (users: User[]) => {
    chatState.onlineUsers = [...users]
  }

  const resetChatState = () => {
    chatState.chatMessages = []
    chatState.onlineUsers = []
  }

  // 使用独立的聊天状态
  const chatMessages = computed(() => {
    return chatState.chatMessages.map((message: ChatMessage) => ({
      ...message,
      user: processUser(message.user),
    }))
  })

  // 在线用户计算属性
  const onlineUsers = computed(() => chatState.onlineUsers)

  const sendMessage = (newMessage: string) => {
    if (newMessage.trim()) {
      // 通过 useWebSocket 发送聊天消息
      sendChatMessage(newMessage)
    }
  }

  // 刷新在线用户列表
  const refreshOnlineUsers = () => {
    send({
      action: '/house/houseuser',
      data: {},
    })
  }

  return {
    chatMessages,
    onlineUsers,
    sendMessage,
    addChatMessage,
    clearChatMessages,
    updateOnlineUsers,
    resetChatState,
    refreshOnlineUsers,
  }
}
