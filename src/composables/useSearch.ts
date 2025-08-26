import type { SearchResult } from '@/types'
import { computed, reactive } from 'vue'
import { getDefaultAvatar } from '@/utils/user'
import { useWebSocket } from './useWebSocket'

// 搜索状态
const searchState = reactive({
  searchCounts: 0,
  searchResults: [] as SearchResult[],
})

export function useSearch() {
  // 直接使用 useWebSocket
  const { registerMessageHandler } = useWebSocket()

  // 计算属性
  const searchCounts = computed(() => searchState.searchCounts)
  const searchResults = computed(() => searchState.searchResults)

  // 搜索结果相关操作
  const updateSearchResults = (results: SearchResult[], totalNum: number) => {
    searchState.searchResults = [...results]
    searchState.searchCounts = totalNum
  }
  const clearSearchResults = () => {
    searchState.searchCounts = 0
    searchState.searchResults = []
  }

  // 注册搜索消息处理器
  // 搜索消息处理器
  registerMessageHandler('search', (message: any) => {
    if (!message.data || !Array.isArray(message.data)) {
      console.warn('收到无效的搜索结果:', message)
      return
    }

    console.log('📥 收到搜索结果:', message)

    const results: SearchResult[] = message.data
      .filter((item: any) => item && item.id && item.name) // 过滤无效数据
      .map((item: any) => ({
        id: item.id,
        title: item.name,
        artist: item.artist || '未知艺术家',
        album: item.album || '未知专辑',
        cover: item.cover || getDefaultAvatar(item.id),
        duration: item.duration || 240,
        requestedBy: {
          name: item.requestedBy?.name || '未知用户',
          avatar: item.requestedBy?.avatar || getDefaultAvatar(),
        },
      }))

    updateSearchResults(results, message.totalSize || results.length)
  })

  // 搜索列表消息处理器
  registerMessageHandler('searchlist', (message: any) => {
    if (!message.data || !Array.isArray(message.data)) {
      console.warn('收到无效的搜索结果:', message)
      return
    }

    const results: SearchResult[] = message.data
      .filter((item: any) => item && item.id && item.name) // 过滤无效数据
      .map((item: any) => ({
        id: item.id,
        title: item.name,
        cover: item.pictureUrl || getDefaultAvatar(item.id),
        creator: item.creator,
        songCount: item.songCount,
      }))

    updateSearchResults(results, message.totalSize || results.length)
  })

  return {
    // 计算属性
    searchCounts,
    searchResults,

    // 操作方法
    updateSearchResults,
    clearSearchResults,
  }
}
