import type { Song } from '@/types'
import { useStorage } from '@vueuse/core'
import { computed, ref } from 'vue'

// 播放历史记录项接口
interface PlayHistoryItem {
  song: Song
  playedAt: number
}

// 搜索历史记录项接口
interface SearchHistoryItem {
  query: string
  platform: string
  searchMode: string
  timestamp: number
}

// 播放历史设置
const MAX_PLAY_HISTORY_SIZE = 500
const playHistory = useStorage<PlayHistoryItem[]>('music-play-history', [])

// 搜索历史设置
const enableSearchHistory = useStorage('alisten_enable_search_history', true)
const maxSearchHistoryCount = useStorage('alisten_max_search_history_count', 10)
const searchHistory = useStorage<SearchHistoryItem[]>('alisten_search_history', [])

export function useHistory() {
  const isRecording = ref(true)

  // ========== 播放历史功能 ==========

  // 添加播放记录
  function addToPlayHistory(song: Song) {
    if (!isRecording.value) {
      return
    }

    // 检查是否已存在相同的歌曲记录
    const now = Date.now()
    const existingIndex = playHistory.value.findIndex(item => item.song.id === song.id)

    if (existingIndex !== -1) {
      // 如果已存在，移除旧记录
      playHistory.value.splice(existingIndex, 1)
    }

    // 添加新记录到开头
    const historyItem: PlayHistoryItem = {
      song: { ...song },
      playedAt: now,
    }

    playHistory.value.unshift(historyItem)

    // 限制历史记录大小
    if (playHistory.value.length > MAX_PLAY_HISTORY_SIZE) {
      playHistory.value = playHistory.value.slice(0, MAX_PLAY_HISTORY_SIZE)
    }
  }

  // 获取播放历史
  const playHistoryList = computed(() => playHistory.value)

  // 按日期分组的播放历史记录
  const playHistoryByDate = computed(() => {
    const groups: { [key: string]: PlayHistoryItem[] } = {}

    playHistory.value.forEach((item) => {
      const date = new Date(item.playedAt)
      const dateKey = date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(item)
    })

    return Object.entries(groups).map(([date, items]) => ({
      date,
      items,
    }))
  })

  // 播放统计信息
  const playStats = computed(() => {
    const totalPlays = playHistory.value.length
    const totalDuration = playHistory.value.reduce((sum, item) => sum + item.song.duration / 1000, 0)

    return {
      totalPlays,
      totalDuration,
    }
  })

  // 清空播放历史记录
  function clearPlayHistory() {
    playHistory.value = []
  }

  // 删除单条播放记录
  function removeFromPlayHistory(index: number) {
    if (index >= 0 && index < playHistory.value.length) {
      playHistory.value.splice(index, 1)
    }
  }

  // 搜索播放历史记录
  function searchPlayHistory(query: string) {
    if (!query.trim()) {
      return playHistoryList.value
    }

    const lowerQuery = query.toLowerCase()
    return playHistory.value.filter(item =>
      item.song.title.toLowerCase().includes(lowerQuery)
      || item.song.artist.toLowerCase().includes(lowerQuery)
      || (item.song.album && item.song.album.toLowerCase().includes(lowerQuery)),
    )
  }

  // 切换播放历史记录状态
  function togglePlayHistoryRecording() {
    isRecording.value = !isRecording.value
  }

  // 导出播放历史记录
  function exportPlayHistory() {
    const data = {
      exportedAt: new Date().toISOString(),
      history: playHistory.value,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `music-history-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // ========== 搜索历史功能 ==========

  // 获取有效的搜索记录（过滤和验证）
  function getValidSearchHistory(): SearchHistoryItem[] {
    if (!enableSearchHistory.value) {
      return []
    }

    try {
      // 验证数据格式并过滤无效项
      return searchHistory.value
        .filter((item: any) =>
          item
          && typeof item.query === 'string'
          && typeof item.platform === 'string'
          && typeof item.searchMode === 'string'
          && typeof item.timestamp === 'number',
        )
        .slice(0, maxSearchHistoryCount.value)
    } catch (error) {
      console.warn('搜索记录验证失败:', error)
      return []
    }
  }

  // 添加搜索记录
  function addToSearchHistory(query: string, platform: string, searchMode: string) {
    if (!enableSearchHistory.value || !query.trim()) {
      return
    }

    const newItem: SearchHistoryItem = {
      query: query.trim(),
      platform,
      searchMode,
      timestamp: Date.now(),
    }

    // 获取当前记录
    let history = getValidSearchHistory()

    // 检查是否已存在相同的搜索记录
    const existingIndex = history.findIndex((item: SearchHistoryItem) =>
      item.query === newItem.query
      && item.platform === newItem.platform
      && item.searchMode === newItem.searchMode,
    )

    // 如果存在，移除旧记录
    if (existingIndex !== -1) {
      history.splice(existingIndex, 1)
    }

    // 将新记录添加到开头
    history.unshift(newItem)

    // 限制记录数量
    if (history.length > maxSearchHistoryCount.value) {
      history = history.slice(0, maxSearchHistoryCount.value)
    }

    searchHistory.value = history
  }

  // 获取搜索记录
  function getSearchHistory(platform?: string, searchMode?: string): SearchHistoryItem[] {
    if (!enableSearchHistory.value) {
      return []
    }

    let history = getValidSearchHistory()

    // 按平台和搜索模式过滤
    if (platform || searchMode) {
      history = history.filter((item: SearchHistoryItem) => {
        if (platform && item.platform !== platform) {
          return false
        }
        if (searchMode && item.searchMode !== searchMode) {
          return false
        }
        return true
      })
    }

    return history
  }

  // 删除搜索记录
  function removeFromSearchHistory(query: string, platform: string, searchMode: string) {
    if (!enableSearchHistory.value) {
      return
    }

    const history = getValidSearchHistory()
    const filtered = history.filter((item: SearchHistoryItem) =>
      !(item.query === query && item.platform === platform && item.searchMode === searchMode),
    )

    searchHistory.value = filtered
  }

  // 清空搜索记录
  function clearSearchHistory() {
    searchHistory.value = []
  }

  // 更新搜索记录设置
  function updateSearchHistorySettings(enabled: boolean, maxCount?: number) {
    enableSearchHistory.value = enabled
    if (maxCount !== undefined && maxCount > 0 && maxCount <= 50) {
      maxSearchHistoryCount.value = maxCount
    }
  }

  // ========== 计算属性 ==========

  // 当前搜索记录
  const currentSearchHistory = computed(() => getValidSearchHistory())

  // 是否启用搜索记录
  const isSearchHistoryEnabled = computed(() => enableSearchHistory.value)

  // ========== 导出接口 ==========

  return {
    // 播放历史相关
    playHistoryList,
    playHistoryByDate,
    playStats,
    isRecording,
    addToPlayHistory,
    clearPlayHistory,
    removeFromPlayHistory,
    searchPlayHistory,
    togglePlayHistoryRecording,
    exportPlayHistory,

    // 搜索历史相关
    currentSearchHistory,
    isSearchHistoryEnabled,
    enableSearchHistory,
    maxSearchHistoryCount,
    searchHistory,
    addToSearchHistory,
    getSearchHistory,
    removeFromSearchHistory,
    clearSearchHistory,
    updateSearchHistorySettings,
  }
}

// 导出类型定义
export type { PlayHistoryItem, SearchHistoryItem }
