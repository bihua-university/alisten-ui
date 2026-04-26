import type { LyricLine } from '@/types'
import { isValidLrc, parseLyrics } from '@/utils/lrcParser'
import { Store } from './store-base'

interface LyricsState {
  currentLyrics: LyricLine[]
  currentLyricIndex: number
}

const registeredContainers = new Set<HTMLElement>()
let scrollRafId: number | null = null

class LyricsStore extends Store<LyricsState> {
  constructor() {
    super({ currentLyrics: [], currentLyricIndex: 0 })
  }

  private scrollToCenter(container: HTMLElement, index: number, smooth = true) {
    const lyricLines = container.querySelectorAll('.lyric-line')
    if (lyricLines[index]) {
      const targetLine = lyricLines[index] as HTMLElement
      const containerHeight = container.clientHeight
      const targetTop = targetLine.offsetTop
      const targetHeight = targetLine.clientHeight
      const targetScrollTop = targetTop - (containerHeight / 2) + (targetHeight / 2)
      container.scrollTo({ top: Math.max(0, targetScrollTop), behavior: smooth ? 'smooth' : 'instant' })
    }
  }

  syncScrollAllContainers(smooth = true) {
    registeredContainers.forEach((container) => {
      this.scrollToCenter(container, this.state.currentLyricIndex, smooth)
    })
  }

  setCurrentLyrics(lyrics: LyricLine[]) {
    const emptyLyricsStart: LyricLine[] = Array.from({ length: 10 }, (_, index) => ({
      time: -666666 + index,
      text: '',
    }))
    const emptyLyricsEnd: LyricLine[] = Array.from({ length: 10 }, (_, index) => ({
      time: 666666 + index,
      text: '',
    }))
    this.setState({ currentLyrics: [...emptyLyricsStart, ...lyrics, ...emptyLyricsEnd] })
  }

  setCurrentLyricIndex(index: number) {
    if (index !== this.state.currentLyricIndex) {
      this.setState({ currentLyricIndex: index })
      if (scrollRafId === null) {
        scrollRafId = requestAnimationFrame(() => {
          this.syncScrollAllContainers()
          scrollRafId = null
        })
      }
    }
  }

  clearLyrics() {
    this.setState({ currentLyrics: [], currentLyricIndex: 0 })
  }

  get lyricLines(): Array<LyricLine & { isActive: boolean, isPassed: boolean, isComing: boolean }> {
    return this.state.currentLyrics.map((lyric, index) => ({
      ...lyric,
      isActive: index === this.state.currentLyricIndex,
      isPassed: index < this.state.currentLyricIndex,
      isComing: index > this.state.currentLyricIndex,
    }))
  }

  syncLyrics(currentTime: number) {
    const lyrics = this.state.currentLyrics
    if (lyrics.length === 0)
      return
    let left = 0
    let right = lyrics.length - 1
    let result = 0
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      if (lyrics[mid].time <= currentTime) {
        result = mid
        left = mid + 1
      } else {
        right = mid - 1
      }
    }
    if (result !== this.state.currentLyricIndex) {
      this.setCurrentLyricIndex(result)
    }
  }

  loadLrcLyrics(lrcContent: string) {
    try {
      if (!lrcContent.trim() || !isValidLrc(lrcContent)) {
        this.clearLyrics()
        return false
      }
      const parsed = parseLyrics(lrcContent)
      this.setCurrentLyrics(parsed.lyrics)
      this.setState({ currentLyricIndex: 0 })
      return true
    } catch (error) {
      console.error('解析LRC歌词失败:', error)
      return false
    }
  }

  seekToLyric(index: number): number {
    if (index >= 0 && index < this.state.currentLyrics.length) {
      this.setCurrentLyricIndex(index)
      return this.state.currentLyrics[index].time
    }
    return 0
  }

  getCurrentLyricInfo() {
    const current = this.state.currentLyrics[this.state.currentLyricIndex]
    const next = this.state.currentLyrics[this.state.currentLyricIndex + 1]
    const prev = this.state.currentLyrics[this.state.currentLyricIndex - 1]
    return {
      current: current || null,
      next: next || null,
      prev: prev || null,
      progress: this.state.currentLyricIndex / Math.max(1, this.state.currentLyrics.length - 1),
      totalLines: this.state.currentLyrics.length,
    }
  }

  registerContainer(el: HTMLElement) {
    registeredContainers.add(el)
  }

  unregisterContainer(el: HTMLElement) {
    registeredContainers.delete(el)
  }
}

export const lyricsStore = new LyricsStore()
