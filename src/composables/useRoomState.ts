import type { RoomState, User } from '@/types'
import { reactive } from 'vue'

// 全局共享的房间状态
const roomState = reactive<RoomState>({
  onlineUsers: [],
})

export function useRoomState() {
  const updateOnlineUsers = (users: User[]) => {
    roomState.onlineUsers = [...users]
  }
  // 重置整个房间状态
  const resetRoomState = () => {
    roomState.onlineUsers = []
  }

  return {
    roomState,

    // 用户操作
    updateOnlineUsers,

    // 其他操作
    resetRoomState,
  }
}
