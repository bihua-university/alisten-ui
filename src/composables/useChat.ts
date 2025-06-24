import type { ChatMessage } from '@/types'
import { computed, nextTick, ref } from 'vue'
import { useRoomState } from '@/composables/useRoomState'

export function useChat(websocket?: any) {
  const { roomState, addChatMessage } = useRoomState()
  const newMessage = ref('')

  // 使用共享状态中的聊天消息
  const chatMessages = computed(() => roomState.chatMessages)

  const sendMessage = () => {
    if (newMessage.value.trim()) {
      // 如果有WebSocket连接，通过WebSocket发送
      if (websocket && websocket.sendChatMessage) {
        const success = websocket.sendChatMessage(newMessage.value)
        if (success) {
          // WebSocket发送成功，消息会通过WebSocket事件接收
          newMessage.value = ''
          return
        }
      }

      // 滚动到底部
      nextTick(() => {
        const chatContainer = document.querySelector('.chat-messages')
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight
        }
      })
    }
  }
  const addMessage = (message: ChatMessage) => {
    addChatMessage(message)
    // 滚动到底部
    nextTick(() => {
      const chatContainer = document.querySelector('.chat-messages')
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    })
  }
  return {
    chatMessages,
    newMessage,
    sendMessage,
    addMessage,
  }
}
