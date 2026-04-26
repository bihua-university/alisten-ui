import type { SearchResult } from '@/types'
import { getDefaultAvatar } from '@/utils/user'
import { Store } from './store-base'
import { websocketStore } from './websocket-store'

interface SearchState {
  searchCounts: number
  searchResults: SearchResult[]
  currentPage: number
  pageSize: number
  totalPages: number
}

class SearchStore extends Store<SearchState> {
  constructor() {
    super({ searchCounts: 0, searchResults: [], currentPage: 1, pageSize: 20, totalPages: 0 })

    websocketStore.registerMessageHandler('search', (message: any) => {
      if (!message.data || !Array.isArray(message.data)) {
        console.warn('收到无效的搜索结果:', message)
        return
      }
      const results: SearchResult[] = message.data
        .filter((item: any) => item && item.id && item.name)
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
      this.updateSearchResults(results, message.totalSize || results.length)
    })

    websocketStore.registerMessageHandler('searchlist', (message: any) => {
      if (!message.data || !Array.isArray(message.data)) {
        console.warn('收到无效的搜索结果:', message)
        return
      }
      const results: SearchResult[] = message.data
        .filter((item: any) => item && item.id && item.name)
        .map((item: any) => ({
          id: item.id,
          title: item.name,
          cover: item.pictureUrl || getDefaultAvatar(item.id),
          creator: item.creator,
          songCount: item.songCount,
        }))
      this.updateSearchResults(results, message.totalSize || results.length)
    })
  }

  updateSearchResults(results: SearchResult[], totalNum: number) {
    const totalPages = Math.ceil(totalNum / this.state.pageSize)
    this.setState({ searchResults: [...results], searchCounts: totalNum, totalPages })
  }

  setPage(page: number) {
    this.setState({ currentPage: page })
  }

  clearSearchResults() {
    this.setState({ searchCounts: 0, searchResults: [], currentPage: 1, totalPages: 0 })
  }
}

export const searchStore = new SearchStore()
