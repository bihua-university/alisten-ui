import type { ChatMessage, User } from '@/types'
import { computed, nextTick, reactive } from 'vue'
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

export function useChat() {
  const { registerMessageHandler, sendChatMessage } = useWebSocket()

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

  // 自动滚动聊天容器到底部
  function scrollChatToBottom() {
    nextTick(() => {
      const chatContainer = document.querySelector('.chat-messages')
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    })
  }

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

    addChatMessage(msg)
    scrollChatToBottom()
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

    updateOnlineUsers(processUsers(users))
  })
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
      scrollChatToBottom()
    }
  }
  return {
    chatMessages,
    onlineUsers,
    sendMessage,
    addChatMessage,
    clearChatMessages,
    updateOnlineUsers,
    resetChatState,
  }
}
