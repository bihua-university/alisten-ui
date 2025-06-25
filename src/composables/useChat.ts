import type { ChatMessage } from '@/types'
import { computed, nextTick, reactive } from 'vue'
import { getDefaultAvatar, processUser } from '@/utils/user'

// 全局共享的聊天状态
const chatState = reactive<{
  chatMessages: ChatMessage[]
}>({
  chatMessages: [],
})

export function useChat(websocket: any) {
  const { registerMessageHandler } = websocket

  // 聊天消息相关操作
  const addChatMessage = (message: ChatMessage) => {
    chatState.chatMessages.push(message)
  }

  const clearChatMessages = () => {
    chatState.chatMessages = []
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
  // 使用独立的聊天状态
  const chatMessages = computed(() => {
    return chatState.chatMessages.map((message: ChatMessage) => ({
      ...message,
      user: processUser(message.user),
    }))
  })

  const sendMessage = (newMessage: string) => {
    if (newMessage.trim()) {
      // 如果有WebSocket连接，通过WebSocket发送
      if (websocket && websocket.sendChatMessage) {
        websocket.sendChatMessage(newMessage)
      }

      scrollChatToBottom()
    }
  }
  return {
    chatMessages,
    sendMessage,
    addChatMessage,
    clearChatMessages,
  }
}
