import type { ChatMessage, User } from '@/types'
import { processUser, processUsers } from '@/utils/user'
import { Store } from './store-base'
import { websocketStore } from './websocket-store'

interface ChatState {
  chatMessages: ChatMessage[]
  onlineUsers: User[]
}

class ChatStore extends Store<ChatState> {
  constructor() {
    super({ chatMessages: [], onlineUsers: [] })

    websocketStore.registerMessageHandler('chat', (message: any) => {
      if (!message.content)
        return
      const msg: ChatMessage = {
        content: message.content,
        timestamp: message.sendTime || Date.now(),
        user: message.user,
      }
      this.setState({ chatMessages: [...this.state.chatMessages, msg] })
    })

    websocketStore.registerMessageHandler('house_user', (message: any) => {
      if (!message.data || !Array.isArray(message.data)) {
        console.warn('收到无效的用户列表:', message)
        return
      }
      this.setState({ onlineUsers: [...processUsers(message.data)] })
    })
  }

  get chatMessages(): ChatMessage[] {
    return this.state.chatMessages.map(message => ({
      ...message,
      user: processUser(message.user),
    }))
  }

  get onlineUsers(): User[] {
    return this.state.onlineUsers
  }

  addMessage(message: ChatMessage) {
    this.setState({ chatMessages: [...this.state.chatMessages, message] })
  }

  clearMessages() {
    this.setState({ chatMessages: [] })
  }

  updateOnlineUsers(users: User[]) {
    this.setState({ onlineUsers: [...users] })
  }

  reset() {
    this.setState({ chatMessages: [], onlineUsers: [] })
  }

  sendMessage(content: string) {
    if (content.trim()) {
      websocketStore.sendChatMessage(content)
    }
  }

  refreshOnlineUsers() {
    websocketStore.send({ action: '/house/houseuser', data: {} })
  }
}

export const chatStore = new ChatStore()
