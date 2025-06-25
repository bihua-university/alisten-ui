import type { ChatMessage } from '@/types'
import { computed, nextTick } from 'vue'
import { useRoomState } from '@/composables/useRoomState'
import { getDefaultAvatar, processUser } from '@/utils/user'

export function useChat(websocket: any) {
  const { roomState, addChatMessage } = useRoomState()
  const { registerMessageHandler } = websocket

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

  // 使用共享状态中的聊天消息
  const chatMessages = computed(() => {
    return roomState.chatMessages.map(message => ({
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
  }
}
