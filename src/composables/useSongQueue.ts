import { computed } from 'vue'
import type { Song } from '@/types'
import { useRoomState } from '@/composables/useRoomState'

export const useSongQueue = () => {
  const { 
    roomState, 
    updatePlaylist, 
    clearPlaylist, 
  } = useRoomState()

  // 计算属性
  const queue = computed(() => roomState.playlist)
  const queueLength = computed(() => roomState.playlist.length)
  const isEmpty = computed(() => roomState.playlist.length === 0)


  // 移动歌曲位置
  const moveSong = (fromIndex: number, toIndex: number) => {
    const newPlaylist = [...roomState.playlist]
    const song = newPlaylist.splice(fromIndex, 1)[0]
    newPlaylist.splice(toIndex, 0, song)
    updatePlaylist(newPlaylist)
  }

  // 清空队列
  const clearQueue = () => {
    clearPlaylist()
  }

  // 替换整个队列
  const replaceQueue = (songs: Song[]) => {
    updatePlaylist(songs)
  }


  return {
    // 状态
    queue,
    queueLength,
    isEmpty,
    
    // 队列管理
    moveSong,
    clearQueue,
    replaceQueue,
  }
}
