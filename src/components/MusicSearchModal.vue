<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div v-show="true" class="search-modal-bg fixed inset-0 z-[60] bg-gray-900/95 backdrop-blur-md text-white flex flex-col">
      <!-- Top Bar -->
      <div class="search-glass relative z-10 flex-shrink-0 px-4 md:px-8 py-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <button
            class="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white active:scale-95"
            @click="$emit('close')"
          >
            <i class="fa-solid fa-arrow-left text-lg" />
          </button>
          <h1 class="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
            点歌台
          </h1>
        </div>

        <div class="flex items-center space-x-2 md:space-x-4">
          <!-- Mode Toggle Pills -->
          <div class="flex items-center bg-white/5 p-1 rounded-2xl border border-white/5">
            <button
              class="mode-tab relative px-4 py-1.5 rounded-xl text-sm font-medium flex items-center gap-2"
              :class="currentMode === 'search' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-white/60 hover:text-white hover:bg-white/5'"
              @click="setCurrentMode('search')"
            >
              <i class="fa-solid fa-search text-xs" />
              <span class="hidden md:inline">搜索</span>
            </button>
            <button
              class="mode-tab relative px-4 py-1.5 rounded-xl text-sm font-medium flex items-center gap-2"
              :class="currentMode === 'ai' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-white/60 hover:text-white hover:bg-white/5'"
              @click="setCurrentMode('ai')"
            >
              <i class="fa-solid fa-robot text-xs" />
              <span class="hidden md:inline">AI推荐</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 relative z-10 flex flex-col w-full max-w-7xl mx-auto">
        <!-- Search View -->
        <div v-if="currentMode === 'search'" class="w-full h-full flex flex-col px-4 md:px-8 pt-6 pb-2">
          <!-- Search Inputs & Filters -->
          <div class="flex-shrink-0 space-y-4 mb-4 max-w-4xl mx-auto w-full">
            <!-- Big Search Input -->
            <div class="relative group w-full">
              <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <i class="fa-solid fa-search text-white/40 group-focus-within:text-purple-400 transition-colors text-lg" />
              </div>
              <input
                ref="searchInputRef"
                v-model="songSearchQuery"
                type="text"
                :placeholder="`在 ${selectedMusicSource.name} 中搜索${selectedSearchMode.name}...`"
                class="search-input w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-14 text-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-white/10 shadow-lg shadow-black/20"
                @keyup.enter="handleSearch"
                @keydown="handleKeyDown"
                @focus="handleInputFocus"
                @blur="handleInputBlur"
              >
              <!-- History Icon -->
              <button
                v-if="currentSearchHistory.length > 0"
                class="search-btn absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center"
                :class="showSearchHistory ? 'text-purple-400 bg-purple-500/20' : 'text-white/50 hover:text-white hover:bg-white/10'"
                @click="toggleSearchHistory"
              >
                <i class="fa-solid fa-clock-rotate-left" />
              </button>

              <!-- History Dropdown (Styled) -->
              <div
                v-if="showSearchHistory"
                class="search-history-dropdown absolute left-0 right-0 top-full mt-2 bg-[#121214] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <div v-if="currentSearchHistory.length === 0" class="p-6 text-center text-white/40">
                  暂无历史
                </div>
                <div v-else>
                  <div class="px-4 py-3 bg-white/5 border-b border-white/10 flex justify-between items-center text-xs text-white/50">
                    <span>历史记录</span>
                    <button class="hover:text-red-400 transition-colors flex items-center gap-1" @click="clearCurrentHistory">
                      <i class="fa-solid fa-trash-can text-xs" /> 清空
                    </button>
                  </div>
                  <div
                    v-for="(item, index) in currentSearchHistory"
                    :key="index"
                    class="px-4 py-3 flex items-center cursor-pointer transition-all duration-150 border-b border-white/5 last:border-0"
                    :class="selectedHistoryIndex === index ? 'bg-purple-500/20 text-white' : 'hover:bg-white/5 text-white/70'"
                    @click="selectFromHistory(item)"
                  >
                    <i class="fa-solid fa-clock-rotate-left mr-3 text-xs opacity-40" />
                    <span class="flex-1 truncate">{{ item.query }}</span>
                    <button class="text-white/30 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-white/5 transition-all" @click.stop="removeHistoryItem(item)">
                      <i class="fa-solid fa-times" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Filters -->
            <div class="flex flex-col gap-2 justify-center items-center w-full">
              <!-- Source Tabs (Row 1) -->
              <div class="flex p-1 bg-white/5 rounded-xl border border-white/5 overflow-x-auto w-full custom-scrollbar">
                <button
                  v-for="source in musicSources"
                  :key="source.id"
                  class="mode-tab flex-1 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap"
                  :class="selectedMusicSource.id === source.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'"
                  @click="selectMusicSource(source)"
                >
                  <i :class="source.icon" /> {{ source.name }}
                </button>
              </div>
              <!-- Mode Tabs (Row 2) -->
              <div v-if="availableSearchModes.length > 1" class="flex p-1 bg-white/5 rounded-xl border border-white/5 w-full">
                <button
                  v-for="mode in availableSearchModes"
                  :key="mode.id"
                  class="mode-tab flex-1 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap"
                  :class="selectedSearchMode.id === mode.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'"
                  @click="selectSearchMode(mode)"
                >
                  <i :class="mode.icon" /> {{ mode.name }}
                </button>
              </div>
            </div>
          </div>

          <!-- Results Grid -->
          <div class="flex-1 relative min-h-0 max-w-4xl mx-auto w-full">
            <div class="h-full bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-sm overflow-hidden scroll-container flex flex-col">
              <!-- Empty State -->
              <div v-if="searchResults.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-white/40 pointer-events-none">
                <div class="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/10">
                  <i :class="selectedSearchMode.icon" class="text-4xl text-purple-400/60" />
                </div>
                <p class="text-xl text-white/80 font-semibold">
                  准备搜索
                </p>
                <p class="text-sm text-white/40 mt-2">
                  支持 {{ selectedMusicSource.name }}
                </p>
              </div>

              <!-- Content List -->
              <div v-else class="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div class="flex flex-col gap-2 touch-pan-y">
                  <template v-if="selectedSearchMode.id === 'song'">
                    <MusicItem
                      v-for="result in searchResults"
                      :key="result.id"
                      :music="result"
                      @add="(music) => pickMusic(music, selectedMusicSource.id)"
                    />
                  </template>
                  <template v-else>
                    <PlaylistItem
                      v-for="result in searchResults"
                      :key="result.id"
                      :playlist="result"
                      @view="viewPlaylist"
                    />
                  </template>
                </div>

                <!-- Pagination -->
                <div v-if="totalPages > 1" class="mt-6 flex justify-center pb-4">
                  <div class="flex items-center gap-1 bg-white/5 p-1.5 rounded-xl border border-white/5">
                    <button
                      :disabled="currentPage === 0"
                      class="pagination-btn w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/70"
                      @click="changePage(currentPage - 1)"
                    >
                      <i class="fa-solid fa-chevron-left text-xs" />
                    </button>
                    <div class="flex gap-1 px-1">
                      <button
                        v-for="page in visiblePages"
                        :key="page"
                        class="pagination-btn min-w-9 h-9 px-2 flex items-center justify-center rounded-lg text-sm font-medium"
                        :class="currentPage === page ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-white/60 hover:bg-white/10 hover:text-white'"
                        @click="page !== -1 && changePage(page)"
                      >
                        {{ page === -1 ? '...' : page + 1 }}
                      </button>
                    </div>
                    <button
                      :disabled="!hasNextPage"
                      class="pagination-btn w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white/70"
                      @click="changePage(currentPage + 1)"
                    >
                      <i class="fa-solid fa-chevron-right text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI View -->
        <div v-else-if="currentMode === 'ai'" class="w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-8 flex flex-col items-center">
          <div class="w-full max-w-4xl min-h-[500px] bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col overflow-hidden backdrop-blur-sm">
            <div class="p-6 border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                  AI 智能推荐
                </h2>
                <p class="text-white/40 text-sm mt-1">
                  猜你喜欢
                </p>
              </div>
              <button class="search-btn px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm text-white shadow-lg shadow-purple-600/20 flex items-center gap-2" @click="handleRefreshRecommendations">
                <i class="fa-solid fa-rotate-right" />换一批
              </button>
            </div>
            <div class="flex-1 overflow-y-auto custom-scrollbar p-4">
              <div v-if="recommendations.length > 0" class="grid grid-cols-1 gap-2">
                <MusicItem
                  v-for="result in recommendations"
                  :key="result.id"
                  :music="result"
                  @add="(music) => pickMusic(music, selectedMusicSource.id)"
                />
              </div>
              <div v-else class="h-full flex flex-col items-center justify-center text-white/30 py-20 min-h-[300px]">
                <div class="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/10">
                  <i class="fa-solid fa-robot text-3xl text-purple-400/60" />
                </div>
                <p class="text-white/50">
                  正在生成推荐...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { MusicSource } from '@/types'
import { useStorage } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { MusicItem, PlaylistItem } from '@/components/common'
import { useHistory } from '@/composables/useHistory'
import { useNotification } from '@/composables/useNotification'
import { usePlayer } from '@/composables/usePlayer'
import { useRoom } from '@/composables/useRoom'
import { useSearch } from '@/composables/useSearch'
import { useWebSocket } from '@/composables/useWebSocket'

// Props
defineEmits(['close'])

const { clearSearchResults, searchResults, searchCounts } = useSearch()
const { send } = useWebSocket()
const {
  isSearchHistoryEnabled,
  addToSearchHistory: addSearchHistoryRecord,
  getSearchHistory,
  removeFromSearchHistory: removeSearchHistoryRecord,
  clearSearchHistory,
} = useHistory()
const { pickMusic, pullRecommendations, recommendations } = usePlayer()
const { showInfo } = useNotification()
const { roomInfo } = useRoom()

// 模式切换状态
const currentMode = useStorage<'search' | 'ai'>('music-modal-mode', 'search')

// 设置当前模式
function setCurrentMode(mode: 'search' | 'ai') {
  currentMode.value = mode

  // 切换到AI推荐模式时，如果没有推荐数据，则获取推荐
  if (mode === 'ai' && recommendations.value.length <= 0) {
    pullRecommendations()
  }
}

// 音乐来源
const allMusicSources: MusicSource[] = [
  {
    id: 'wy',
    name: '网易云音乐',
    icon: 'fa-solid fa-music',
    color: '#d33a31',
    description: '歌曲 · 歌单 · 用户',
  },
  {
    id: 'qq',
    name: 'QQ音乐',
    icon: 'fa-brands fa-qq',
    color: '#31c27c',
    description: '歌曲 · 歌单 · 用户',
  },
  {
    id: 'db',
    name: 'bilibili',
    icon: 'fa-solid fa-tv',
    color: '#00a2d8',
    description: '仅歌曲搜索',
  },
]

const musicSources = computed(() => {
  if (roomInfo.value.ultimate) {
    return allMusicSources
  } else {
    return allMusicSources.filter(source => source.id !== 'db')
  }
})

// 搜索模式配置 - 根据音乐平台动态显示
const allSearchModes = [
  {
    id: 'song',
    name: '歌曲',
    icon: 'fa-solid fa-music',
    description: '搜索单曲',
    supportedSources: ['wy', 'qq', 'db'], // 所有平台都支持歌曲搜索
  },
  {
    id: 'playlist',
    name: '歌单',
    icon: 'fa-solid fa-list-ul',
    description: '搜索歌单',
    supportedSources: ['wy', 'qq'], // 只有网易云和QQ音乐支持歌单搜索
  },
  {
    id: 'user_playlist',
    name: '用户歌单',
    icon: 'fa-solid fa-list-ul',
    description: '搜索用户',
    supportedSources: ['wy', 'qq'], // 只有QQ音乐支持用户搜索
  },
]

const selectedMusicSource = useStorage<MusicSource>('selected-music-source', allMusicSources[0])
const selectedSearchMode = useStorage('selected-search-mode', allSearchModes[0])

// 分页状态
const currentPage = useStorage('search-current-page', 0)
const pageSize = 20

// 为每种搜索模式创建单独的数据绑定
const songQuery = useStorage('song-query', '')
const playlistQuery = useStorage('playlist-query', '')
const userPlaylistQuery = useStorage('user-playlist-query', '')

// 显示搜索历史的状态
const showSearchHistory = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)

// 键盘导航相关状态
const selectedHistoryIndex = ref(-1) // 当前选中的历史记录索引，-1表示没有选中

const currentSearchHistory = computed(() => {
  if (!isSearchHistoryEnabled.value) {
    return []
  }
  // 直接从 useSearchHistory 获取当前平台和搜索模式的历史记录
  return getSearchHistory(selectedMusicSource.value.id, selectedSearchMode.value.id)
})

// 当前搜索查询的计算属性
const songSearchQuery = computed({
  get() {
    switch (selectedSearchMode.value.id) {
      case 'song':
        return songQuery.value
      case 'playlist':
        return playlistQuery.value
      case 'user_playlist':
        return userPlaylistQuery.value
      default:
        return songQuery.value
    }
  },
  set(value: string) {
    switch (selectedSearchMode.value.id) {
      case 'song':
        songQuery.value = value
        break
      case 'playlist':
        playlistQuery.value = value
        break
      case 'user_playlist':
        userPlaylistQuery.value = value
        break
      default:
        songQuery.value = value
    }
  },
})

// 根据当前选择的音乐源过滤可用的搜索模式
const availableSearchModes = computed(() => {
  return allSearchModes.filter(mode =>
    mode.supportedSources.includes(selectedMusicSource.value.id),
  )
})

// 分页相关状态
const totalPages = computed(() => {
  return Math.ceil(searchCounts.value / pageSize)
})
const hasNextPage = computed(() => {
  return currentPage.value < totalPages.value - 1
})
const visiblePages = computed(() => {
  // 计算可见页码
  const pages: (number | -1)[] = []
  const total = totalPages.value
  const current = currentPage.value

  // 检测是否为移动设备（简单的屏幕宽度检测）
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  if (isMobile) {
    // 移动设备：紧凑分页，始终保留首页和尾页的快速跳转
    if (total <= 4) {
      // 总页数少于等于4页，显示所有页码
      for (let i = 0; i < total; i++) {
        pages.push(i)
      }
    } else {
      // 总页数大于4页，智能显示
      if (current <= 1) {
        // 当前在前2页：显示 1 2 3 ... last
        pages.push(0, 1, 2, -1, total - 1)
      } else if (current >= total - 2) {
        // 当前在后2页：显示 1 ... prev-1 prev last
        pages.push(0, -1, total - 3, total - 2, total - 1)
      } else {
        // 当前在中间：显示 1 ... current ... last
        pages.push(0, -1, current, -1, total - 1)
      }
    }
  } else {
    // 桌面设备：保持原有逻辑
    if (total <= 7) {
      // 总页数少于等于7页，显示所有页码
      for (let i = 0; i < total; i++) {
        pages.push(i)
      }
    } else {
      // 总页数大于7页，显示省略号
      if (current <= 3) {
        // 当前页在前面
        for (let i = 0; i <= 4; i++) {
          pages.push(i)
        }
        pages.push(-1) // 省略号
        pages.push(total - 1)
      } else if (current >= total - 4) {
        // 当前页在后面
        pages.push(0)
        pages.push(-1) // 省略号
        for (let i = total - 5; i < total; i++) {
          pages.push(i)
        }
      } else {
        // 当前页在中间
        pages.push(0)
        pages.push(-1) // 省略号
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i)
        }
        pages.push(-1) // 省略号
        pages.push(total - 1)
      }
    }
  }

  return pages
})

// 搜索音乐方法
function handleSearch() {
  if (songSearchQuery.value.trim()) {
    // 隐藏搜索历史菜单
    showSearchHistory.value = false
    selectedHistoryIndex.value = -1

    let action = ''
    let source = selectedMusicSource.value.id
    switch (selectedSearchMode.value.id) {
      case 'song':
        action = '/music/search'
        break
      case 'playlist':
        action = '/music/searchsonglist'
        break
      case 'user_playlist':
        source += '_user'
        action = '/music/searchsonglist'
        break
      default:
        action = '/music/search'
    }

    send({
      action,
      data: {
        name: songSearchQuery.value,
        source,
        pageIndex: currentPage.value + 1,
        pageSize,
      },
    })

    // 添加到搜索历史
    addToSearchHistory(songSearchQuery.value.trim())
  }
}

// 分页切换方法
function changePage(page: number) {
  if (page >= 0 && page < totalPages.value) {
    currentPage.value = page
    // 重新搜索获取指定页面的数据
    clearSearchResults()
    handleSearch()
  }
}

// 切换音乐来源
function selectMusicSource(source: MusicSource) {
  selectedMusicSource.value = source
  currentPage.value = 0 // 重置页码

  // 检查当前选择的搜索模式是否支持新的音乐平台
  const currentModeSupported = availableSearchModes.value.some(
    mode => mode.id === selectedSearchMode.value.id,
  )

  // 如果当前搜索模式不支持新平台，自动切换到第一个可用的搜索模式
  if (!currentModeSupported && availableSearchModes.value.length > 0) {
    selectedSearchMode.value = availableSearchModes.value[0]
  }

  if (songQuery.value.startsWith('*')) {
    // 如果是歌单详情，清空查询
    songQuery.value = ''
  }
  clearSearchResults()
}

// 切换搜索模式
function selectSearchMode(mode: any) {
  selectedSearchMode.value = mode
  currentPage.value = 0 // 重置页码
  if (songQuery.value.startsWith('*')) {
    // 如果是歌单详情，清空查询
    songQuery.value = ''
  }
  clearSearchResults()
}

// 查看歌单详情
function viewPlaylist(playlist: any) {
  selectedSearchMode.value = availableSearchModes.value[0] // 切换到第一个搜索模式（通常是歌曲搜索）
  // 使用计算属性设置值，它会根据当前搜索模式自动分配到对应的变量
  songSearchQuery.value = `*${playlist.id}`
  currentPage.value = 0 // 重置页码
  clearSearchResults()
  handleSearch()
}

// 添加搜索历史
function addToSearchHistory(query: string) {
  if (!query.trim()) {
    return // 如果查询为空字符串，直接返回
  }

  // 使用新的搜索记录系统
  addSearchHistoryRecord(
    query.trim(),
    selectedMusicSource.value.id,
    selectedSearchMode.value.id,
  )
}

// 从搜索历史中选择查询
function selectFromHistory(item: any) {
  const query = typeof item === 'string' ? item : item.query
  songSearchQuery.value = query
  showSearchHistory.value = false
  selectedHistoryIndex.value = -1
  handleSearch()
}

// 清除当前的搜索历史
function clearCurrentHistory() {
  // 清空所有搜索历史记录
  clearSearchHistory()
  showSearchHistory.value = false
  selectedHistoryIndex.value = -1
}

// 删除单个搜索记录项
function removeHistoryItem(item: any) {
  removeSearchHistoryRecord(item.query, item.platform, item.searchMode)
}

// 处理输入框焦点
function handleInputFocus() {
  if (currentSearchHistory.value.length > 0) {
    showSearchHistory.value = true
    selectedHistoryIndex.value = -1
  }
}

// 处理输入框失焦
function handleInputBlur(event: FocusEvent) {
  // 如果失焦是因为点击了搜索历史按钮，不隐藏搜索历史
  const relatedTarget = event.relatedTarget as HTMLElement
  if (relatedTarget && relatedTarget.closest('.search-history-toggle')) {
    return
  }

  // 延迟隐藏以允许点击历史记录
  setTimeout(() => {
    showSearchHistory.value = false
    selectedHistoryIndex.value = -1
  }, 200)
}

// 切换搜索历史显示状态
function toggleSearchHistory() {
  showSearchHistory.value = !showSearchHistory.value
  selectedHistoryIndex.value = -1

  // 如果显示搜索历史，聚焦到输入框
  if (showSearchHistory.value) {
    setTimeout(() => {
      searchInputRef.value?.focus()
    }, 100)
  }
}

// 处理键盘事件
function handleKeyDown(event: KeyboardEvent) {
  // 按ESC键总是隐藏历史记录
  if (event.key === 'Escape') {
    showSearchHistory.value = false
    selectedHistoryIndex.value = -1
    event.preventDefault()
    return
  }

  if (!showSearchHistory.value && currentSearchHistory.value.length > 0 && event.key === 'ArrowDown') {
    // 按下方向键显示历史记录
    showSearchHistory.value = true
    selectedHistoryIndex.value = -1
    event.preventDefault()
  } else if (showSearchHistory.value) {
    // 在历史记录菜单中导航
    if (event.key === 'ArrowDown') {
      // 向下导航
      selectedHistoryIndex.value = Math.min(selectedHistoryIndex.value + 1, currentSearchHistory.value.length - 1)
      event.preventDefault()
    } else if (event.key === 'ArrowUp') {
      // 向上导航
      selectedHistoryIndex.value = Math.max(selectedHistoryIndex.value - 1, -1)
      event.preventDefault()
    } else if (event.key === 'Enter' && selectedHistoryIndex.value >= 0) {
      // 回车选择当前高亮的历史记录
      const selectedItem = currentSearchHistory.value[selectedHistoryIndex.value]
      if (selectedItem) {
        selectFromHistory(selectedItem)
      }
      event.preventDefault()
    }
  }
}

// 监听音乐源或搜索模式变化，隐藏搜索历史
watch([selectedMusicSource, selectedSearchMode], () => {
  showSearchHistory.value = false
  selectedHistoryIndex.value = -1
})

// 处理刷新推荐
function handleRefreshRecommendations() {
  pullRecommendations()
  showInfo('已为你刷新推荐歌曲', { icon: 'fa-solid fa-rotate-right' })
}
</script>

<style lang="css">
.scroll-container {
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
}
</style>
