import type { LyricLine } from '@/types'
import { computed } from 'vue'
import { isValidLrc, parseLyrics } from '@/utils/lrcParser'
import { useRoomState } from './useRoomState'

export function useLyrics() {
  const { roomState, setCurrentLyrics, setCurrentLyricIndex, clearLyrics } = useRoomState()

  // 计算属性：当前歌词行的高亮状态
  const lyricLines = computed(() => {
    return roomState.currentLyrics.map((lyric, index) => ({
      ...lyric,
      isActive: index === roomState.currentLyricIndex,
      isPassed: index < roomState.currentLyricIndex,
      isComing: index > roomState.currentLyricIndex,
    }))
  })

  // 模拟歌词同步
  const syncLyrics = (currentTime: number) => {
    if (roomState.currentLyrics.length > 0) {
      const currentLyric = roomState.currentLyrics.findIndex((lyric: LyricLine) =>
        lyric.time <= currentTime
        && (roomState.currentLyrics[roomState.currentLyrics.indexOf(lyric) + 1]?.time > currentTime
          || roomState.currentLyrics.indexOf(lyric) === roomState.currentLyrics.length - 1),
      )
      if (currentLyric !== -1) {
        setCurrentLyricIndex(currentLyric)
      }
    }
  }

  // 加载LRC格式歌词
  const loadLrcLyrics = (lrcContent: string) => {
    try {
      if (!lrcContent.trim() || !isValidLrc(lrcContent)) {
        clearLyrics()
        return false
      }

      const parsed = parseLyrics(lrcContent)
      setCurrentLyrics(parsed.lyrics)
      setCurrentLyricIndex(0)
      return true
    }
    catch (error) {
      console.error('解析LRC歌词失败:', error)
      return false
    }
  }

  // 跳转到指定歌词行
  const seekToLyric = (index: number) => {
    if (index >= 0 && index < roomState.currentLyrics.length) {
      setCurrentLyricIndex(index)
      return roomState.currentLyrics[index].time
    }
    return 0
  }

  // 获取当前歌词信息
  const getCurrentLyricInfo = () => {
    const current = roomState.currentLyrics[roomState.currentLyricIndex]
    const next = roomState.currentLyrics[roomState.currentLyricIndex + 1]
    const prev = roomState.currentLyrics[roomState.currentLyricIndex - 1]

    return {
      current: current || null,
      next: next || null,
      prev: prev || null,
      progress: roomState.currentLyricIndex / Math.max(1, roomState.currentLyrics.length - 1),
      totalLines: roomState.currentLyrics.length,
    }
  }

  return {
    // 状态 (从 roomState 获取)
    currentLyricIndex: computed(() => roomState.currentLyricIndex),
    currentLyrics: computed(() => roomState.currentLyrics),
    lyricLines,

    // 方法
    syncLyrics,
    loadLrcLyrics,
    clearLyrics,
    seekToLyric,
    getCurrentLyricInfo,
  }
}
