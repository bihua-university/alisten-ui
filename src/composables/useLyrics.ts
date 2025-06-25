import type { LyricLine } from '@/types'
import { computed, reactive } from 'vue'
import { isValidLrc, parseLyrics } from '@/utils/lrcParser'

// 全局共享的歌词状态
const lyricsState = reactive<{
  currentLyrics: LyricLine[]
  currentLyricIndex: number
}>({
  currentLyrics: [],
  currentLyricIndex: 0,
})

export function useLyrics() {
  // 歌词相关操作
  const setCurrentLyrics = (lyrics: LyricLine[]) => {
    lyricsState.currentLyrics = [...lyrics]
  }

  const setCurrentLyricIndex = (index: number) => {
    lyricsState.currentLyricIndex = index
  }

  const clearLyrics = () => {
    lyricsState.currentLyrics = []
    lyricsState.currentLyricIndex = 0
  }
  // 计算属性：当前歌词行的高亮状态
  const lyricLines = computed(() => {
    return lyricsState.currentLyrics.map((lyric: LyricLine, index: number) => ({
      ...lyric,
      isActive: index === lyricsState.currentLyricIndex,
      isPassed: index < lyricsState.currentLyricIndex,
      isComing: index > lyricsState.currentLyricIndex,
    }))
  })
  // 模拟歌词同步
  const syncLyrics = (currentTime: number) => {
    if (lyricsState.currentLyrics.length > 0) {
      const currentLyric = lyricsState.currentLyrics.findIndex((lyric: LyricLine) =>
        lyric.time <= currentTime
        && (lyricsState.currentLyrics[lyricsState.currentLyrics.indexOf(lyric) + 1]?.time > currentTime
          || lyricsState.currentLyrics.indexOf(lyric) === lyricsState.currentLyrics.length - 1),
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
    } catch (error) {
      console.error('解析LRC歌词失败:', error)
      return false
    }
  }
  // 跳转到指定歌词行
  const seekToLyric = (index: number) => {
    if (index >= 0 && index < lyricsState.currentLyrics.length) {
      setCurrentLyricIndex(index)
      return lyricsState.currentLyrics[index].time
    }
    return 0
  }
  // 获取当前歌词信息
  const getCurrentLyricInfo = () => {
    const current = lyricsState.currentLyrics[lyricsState.currentLyricIndex]
    const next = lyricsState.currentLyrics[lyricsState.currentLyricIndex + 1]
    const prev = lyricsState.currentLyrics[lyricsState.currentLyricIndex - 1]

    return {
      current: current || null,
      next: next || null,
      prev: prev || null,
      progress: lyricsState.currentLyricIndex / Math.max(1, lyricsState.currentLyrics.length - 1),
      totalLines: lyricsState.currentLyrics.length,
    }
  }
  return {
    // 状态 (从 lyricsState 获取)
    currentLyricIndex: computed(() => lyricsState.currentLyricIndex),
    currentLyrics: computed(() => lyricsState.currentLyrics),
    lyricLines,

    // 方法
    syncLyrics,
    loadLrcLyrics,
    clearLyrics,
    seekToLyric,
    getCurrentLyricInfo,
    setCurrentLyrics,
    setCurrentLyricIndex,
  }
}
