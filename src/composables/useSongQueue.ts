import { computed } from 'vue'
import { useRoomState } from '@/composables/useRoomState'

export const useSongQueue = () => {
  const { 
    roomState, 
    clearPlaylist, 
  } = useRoomState()

  // 计算属性
  const queue = computed(() => roomState.playlist)
  const queueLength = computed(() => roomState.playlist.length)
  const isEmpty = computed(() => roomState.playlist.length === 0)

  // 清空队列
  const clearQueue = () => {
    clearPlaylist()
  }

  return {
    // 状态
    queue,
    queueLength,
    isEmpty,
    
    // 队列管理
    clearQueue,
  }
}
