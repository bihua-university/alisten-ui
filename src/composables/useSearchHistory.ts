import { useStorage } from '@vueuse/core'
import { computed } from 'vue'

// 搜索记录项接口
export interface SearchHistoryItem {
  query: string
  platform: string
  searchMode: string
  timestamp: number
}

// 搜索记录设置
const enableSearchHistory = useStorage('alisten_enable_search_history', true)
const maxSearchHistoryCount = useStorage('alisten_max_search_history_count', 10)

// 搜索记录状态 - 使用 useStorage 自动持久化
const searchHistory = useStorage<SearchHistoryItem[]>('alisten_search_history', [])

export function useSearchHistory() {
  // 获取有效的搜索记录（过滤和验证）
  function getValidHistory(): SearchHistoryItem[] {
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
  function addSearchHistory(query: string, platform: string, searchMode: string) {
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
    let history = getValidHistory()

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

    let history = getValidHistory()

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
  function removeSearchHistoryItem(query: string, platform: string, searchMode: string) {
    if (!enableSearchHistory.value) {
      return
    }

    const history = getValidHistory()
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

  // 计算属性：当前搜索记录
  const currentSearchHistory = computed(() => getValidHistory())

  // 计算属性：是否启用搜索记录
  const isSearchHistoryEnabled = computed(() => enableSearchHistory.value)

  return {
    // 状态
    currentSearchHistory,
    isSearchHistoryEnabled,
    enableSearchHistory,
    maxSearchHistoryCount,
    searchHistory, // 直接暴露 searchHistory 以供其他组件使用

    // 方法
    addSearchHistory,
    getSearchHistory,
    removeSearchHistoryItem,
    clearSearchHistory,
    updateSearchHistorySettings,
  }
}
