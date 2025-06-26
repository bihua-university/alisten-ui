import type { LyricLine } from '@/types'
import { computed, nextTick, reactive, watch } from 'vue'
import { isValidLrc, parseLyrics } from '@/utils/lrcParser'

// 全局共享的歌词状态
const lyricsState = reactive<{
  currentLyrics: LyricLine[]
  currentLyricIndex: number
}>({
  currentLyrics: [],
  currentLyricIndex: 0,
})

// 全局注册的歌词容器（非响应式）
const registeredContainers = new Set<HTMLElement>()

// 歌词自动滚动功能（全局函数，避免重复定义）
function scrollLyricsToCenter(container: HTMLElement | undefined, index: number, smooth: boolean = true) {
  if (!container) {
    return
  }

  const lyricLines = container.querySelectorAll('.lyric-line')
  if (lyricLines[index]) {
    const targetLine = lyricLines[index] as HTMLElement
    const containerHeight = container.clientHeight
    const targetTop = targetLine.offsetTop
    const targetHeight = targetLine.clientHeight

    // 计算目标滚动位置（让当前歌词居中）
    const targetScrollTop = targetTop - (containerHeight / 2) + (targetHeight / 2)

    // 根据参数决定是否平滑滚动
    container.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: smooth ? 'smooth' : 'instant',
    })
  }
}

// 同步滚动所有已注册的容器（全局函数）
function syncScrollAllContainers(smooth: boolean = true) {
  registeredContainers.forEach((container) => {
    scrollLyricsToCenter(container, lyricsState.currentLyricIndex, smooth)
  })
}

// 全局监听歌词索引变化，确保只创建一次
watch(
  () => lyricsState.currentLyricIndex,
  (newIndex) => {
    if (newIndex >= 0 && lyricsState.currentLyrics.length > 0) {
      // 延迟执行滚动，确保DOM更新完成
      nextTick(() => {
        syncScrollAllContainers()
      })
    }
  },
)

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

  // 注册歌词容器
  const registerLyricsContainer = (container: HTMLElement) => {
    if (container) {
      registeredContainers.add(container)
    }
  }

  // 取消注册歌词容器
  const unregisterLyricsContainer = (container: HTMLElement) => {
    if (container) {
      registeredContainers.delete(container)
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
    registerLyricsContainer,
    unregisterLyricsContainer,
    syncScrollAllContainers,
  }
}
