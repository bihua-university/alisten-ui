<template>
  <!-- 点歌台模态框 -->
  <transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('close')" />
      <div
        ref="searchResultsContainer"
        class="relative bg-dark border-t border-white/20 md:border md:rounded-xl w-full max-w-4xl h-[85vh] md:max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div class="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 class="text-lg md:text-xl font-semibold">
            点歌台
          </h2>
          <button class="text-gray-400 hover:text-white transition-colors touch-target" @click="$emit('close')">
            <i class="fa-solid fa-times text-lg" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 smooth-scroll scrollbar-hide">
          <!-- 音乐来源选择 -->
          <div class="mb-6">
            <h3 class="text-base md:text-lg font-medium mb-3">
              选择音乐平台
            </h3>
            <div class="grid grid-cols-3 gap-3 max-h-32 overflow-y-auto custom-scrollbar">
              <button
                v-for="source in musicSources" :key="source.id"
                class="p-3 rounded-lg border-2 transition-all text-center" :class="[selectedMusicSource.id === source.id
                  ? 'border-primary bg-primary/20 text-white'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300']" @click="selectMusicSource(source)"
              >
                <i
                  :class="source.icon" :style="{ color: selectedMusicSource.id === source.id ? source.color : '' }"
                  class="text-lg mb-2 block"
                />
                <div class="text-xs font-medium truncate">
                  {{ source.name }}
                </div>
                <div class="text-xs text-gray-400 truncate mt-1">
                  {{ source.description }}
                </div>
              </button>
            </div>
          </div>
          <div class="mb-6">
            <h3 class="text-base md:text-lg font-medium mb-3">
              搜索类型
            </h3>
            <div class="mb-3">
              <p class="text-xs text-gray-400">
                {{ platformSearchTip }}
              </p>
            </div>
            <div
              class="grid gap-3 mb-4" :class="[
                availableSearchModes.length === 1 ? 'grid-cols-1'
                : availableSearchModes.length === 2 ? 'grid-cols-2'
                  : 'grid-cols-3',
              ]"
            >
              <button
                v-for="mode in availableSearchModes" :key="mode.id"
                class="p-3 rounded-lg border-2 transition-all text-center" :class="[selectedSearchMode.id === mode.id
                  ? 'border-primary bg-primary/20 text-white'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300']" @click="selectSearchMode(mode)"
              >
                <i :class="mode.icon" class="text-lg mb-2 block" />
                <div class="text-xs font-medium truncate">
                  {{ mode.name }}
                </div>
                <div class="text-xs text-gray-400 truncate mt-1">
                  {{ mode.description }}
                </div>
              </button>
            </div>
          </div>

          <!-- 搜索框 -->
          <div class="relative mb-6">
            <input
              v-model="songSearchQuery" type="text"
              :placeholder="`在 ${selectedMusicSource.name} 中搜索${selectedSearchMode.name}...`"
              class="w-full bg-white/10 rounded-full py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400"
              @keyup.enter="handleSearch"
            >
            <button
              :disabled="!songSearchQuery.trim()"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all touch-target"
              :class="[songSearchQuery.trim() ? 'text-primary hover:bg-primary/20 active:bg-primary/30' : 'text-gray-500 cursor-not-allowed']"
              @click="handleSearch"
            >
              <i class="fa-solid fa-search" />
            </button>
          </div>

          <!-- 搜索结果 -->
          <div v-if="searchResults.length > 0" class="mb-6">
            <h3 class="text-base md:text-lg font-medium mb-3">
              搜索结果 - {{ selectedSearchMode.name }}
              <span class="text-xs text-gray-400 ml-2">(来自 {{ selectedMusicSource.name }})</span>
            </h3> <transition-group name="search-result" tag="div">
              <!-- 歌曲搜索结果 -->
              <div
                v-if="selectedSearchMode.id === 'song'"
                class="space-y-2 overflow-y-auto custom-scrollbar pr-2 relative"
              >
                <div v-for="result in searchResults" class="bg-white/5 rounded-lg p-3 flex items-center transition-all">
                  <div class="w-12 h-12 rounded overflow-hidden mr-3 flex-shrink-0 relative">
                    <img :src="result.cover" :alt="result.title" class="w-full h-full object-cover">
                  </div>
                  <div class="flex-1 min-w-0 mr-3">
                    <p class="text-xs text-gray-400 truncate">
                      {{ `${result.artist} - ${result.title}` }}
                    </p>
                    <div class="flex items-center mt-1">
                      <span class="text-xs text-gray-500 ml-2">{{ formatTime(result.duration
                        / 1000) }}</span>
                    </div>
                  </div>
                  <button
                    class="bg-primary/20 hover:bg-primary/30 active:bg-primary/40 text-primary rounded-full w-10 h-10 flex items-center justify-center transition-all touch-target flex-shrink-0"
                    @click.stop="pickMusic(result)"
                  >
                    <i class="fa-solid fa-plus" />
                  </button>
                </div>
              </div>

              <!-- 歌单搜索结果 -->
              <div
                v-if="selectedSearchMode.id === 'playlist' || selectedSearchMode.id === 'user_playlist'"
                class="space-y-2 overflow-y-auto custom-scrollbar pr-2 relative"
              >
                <div v-for="result in searchResults" class="bg-white/5 rounded-lg p-3 flex items-center transition-all">
                  <div class="w-12 h-12 rounded overflow-hidden mr-3 flex-shrink-0 relative">
                    <img :src="result.cover" :alt="result.title" class="w-full h-full object-cover">
                    <div class="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 rounded-tl">
                      <i class="fa-solid fa-list-ul" />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0 mr-3">
                    <p class="text-sm font-medium truncate mb-1">
                      {{ result.title }}
                    </p>
                    <p class="text-xs text-gray-400 truncate">
                      {{ (result as any).creator || '未知创建者' }}
                    </p>
                    <div class="flex items-center mt-1">
                      <span class="text-xs text-gray-500">{{ (result as any).songCount || 0 }}
                        首歌曲</span>
                    </div>
                  </div>
                  <button
                    class="bg-green-500/20 hover:bg-green-500/30 active:bg-green-500/40 text-green-400 rounded-full w-10 h-10 flex items-center justify-center transition-all touch-target flex-shrink-0"
                    @click.stop="viewPlaylist(result)"
                  >
                    <i class="fa-solid fa-eye" />
                  </button>
                </div>
              </div>
            </transition-group>
          </div>

          <!-- 分页控制 -->
          <div v-if="searchResults.length > 0" class="mb-6">
            <div class="flex items-center justify-between bg-white/5 rounded-lg p-4">
              <div class="text-xs text-gray-400">
                第 {{ currentPage + 1 }} 页，共 {{ totalPages }} 页
              </div>
              <div class="flex items-center space-x-2">
                <button
                  :disabled="currentPage === 0"
                  class="w-8 h-8 rounded-full flex items-center justify-center transition-all touch-target" :class="[
                    currentPage === 0
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-white hover:bg-white/10 active:bg-white/20',
                  ]" @click="changePage(currentPage - 1)"
                >
                  <i class="fa-solid fa-chevron-left text-sm" />
                </button>

                <div class="flex items-center space-x-1">
                  <template v-for="page in visiblePages" :key="page">
                    <button
                      v-if="page !== -1"
                      class="w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all touch-target"
                      :class="[
                        currentPage === page
                          ? 'bg-primary text-white'
                          : 'text-gray-300 hover:bg-white/10 active:bg-white/20',
                      ]" @click="changePage(page)"
                    >
                      {{ page + 1 }}
                    </button>
                    <span v-else class="text-gray-500 px-1">...</span>
                  </template>
                </div>

                <button
                  :disabled="!hasNextPage"
                  class="w-8 h-8 rounded-full flex items-center justify-center transition-all touch-target" :class="[
                    !hasNextPage
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-white hover:bg-white/10 active:bg-white/20',
                  ]" @click="changePage(currentPage + 1)"
                >
                  <i class="fa-solid fa-chevron-right text-sm" />
                </button>
              </div>
            </div>
          </div>

          <!-- 搜索提示 -->
          <div v-else-if="songSearchQuery.trim()" class="mb-6 text-center py-8 text-gray-400">
            <i class="fa-solid fa-search text-3xl mb-3 opacity-50" />
            <p class="text-sm">
              在 {{ selectedMusicSource.name }} 中未找到相关{{ selectedSearchMode.name }}
            </p>
            <p class="text-xs mt-1">
              试试搜索其他关键词或切换音乐平台
            </p>
          </div>

          <!-- 初始状态提示 -->
          <div
            v-else-if="!songSearchQuery.trim() && searchResults.length === 0"
            class="mb-6 text-center py-12 text-gray-400"
          >
            <i :class="selectedSearchMode.icon" class="text-4xl mb-4 opacity-50" />
            <p class="text-base mb-2">
              搜索你喜欢的{{ selectedSearchMode.name }}
            </p>
            <p class="text-sm">
              在上方输入{{ selectedSearchMode.name === '歌曲' ? '歌曲名称、歌手或专辑' : selectedSearchMode.name === '歌单'
                ? '歌单名称'
                : '用户名称' }}，然后点击搜索按钮
            </p>
            <p class="text-xs mt-2 opacity-75">
              当前平台：{{ selectedMusicSource.name }} | 搜索类型：{{ selectedSearchMode.name }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import type { MusicSource } from '@/types'
import { useStorage } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { useNotification } from '@/composables/useNotification'
import { useSearch } from '@/composables/useSearch'
import { useWebSocket } from '@/composables/useWebSocket'
import { formatTime } from '@/utils/time'

// Props
interface Props {
  show: boolean
  searchResults: any[]
  searchCounts: number
}

const props = defineProps<Props>()
defineEmits(['close'])

const { clearSearchResults } = useSearch()
const { showSuccess } = useNotification()
const { send } = useWebSocket()

// 搜索结果容器引用
const searchResultsContainer = ref<HTMLElement | null>(null)

// 音乐来源
const musicSources: MusicSource[] = [
  {
    id: 'wy',
    name: '网易云音乐',
    icon: 'fa-solid fa-music',
    color: '#d33a31',
    description: '歌曲 · 歌单',
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
    supportedSources: ['qq'], // 只有QQ音乐支持用户搜索
  },
]

const selectedMusicSource = useStorage<MusicSource>('selected-music-source', musicSources[0])
const selectedSearchMode = useStorage('selected-search-mode', allSearchModes[0])

// 分页状态
const currentPage = useStorage('search-current-page', 0)
const pageSize = 50

// 为每种搜索模式创建单独的数据绑定
const songQuery = useStorage('song-query', '')
const playlistQuery = useStorage('playlist-query', '')
const userPlaylistQuery = useStorage('user-playlist-query', '')

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

// 获取当前平台支持的搜索类型提示
const platformSearchTip = computed(() => {
  const source = selectedMusicSource.value
  switch (source.id) {
    case 'wy':
      return '网易云音乐支持歌曲和歌单搜索'
    case 'qq':
      return 'QQ音乐支持歌曲、歌单和用户搜索'
    case 'db':
      return 'bilibili 仅支持歌曲搜索'
    default:
      return ''
  }
})

// 分页相关状态
const totalPages = computed(() => {
  return Math.ceil(props.searchCounts / pageSize)
})
const hasNextPage = computed(() => {
  return currentPage.value < totalPages.value - 1
})
const visiblePages = computed(() => {
  // 计算可见页码
  const pages: (number | -1)[] = []
  const total = totalPages.value
  const current = currentPage.value

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

  return pages
})

// 搜索音乐方法
function handleSearch() {
  if (songSearchQuery.value.trim()) {
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
        source = 'qq_user'
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

  clearSearchResults()
}

// 切换搜索模式
function selectSearchMode(mode: any) {
  selectedSearchMode.value = mode
  currentPage.value = 0 // 重置页码
  clearSearchResults()
}

// 从搜索结果添加到播放列表
function pickMusic(result: any) {
  send({
    action: '/music/pick',
    data: {
      id: result.id,
      name: result.title,
      source: selectedMusicSource.value.id,
    },
  })
  showSuccess(`已发送点歌请求: ${result.title}`)
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

// 监听点歌台显示状态
watch(() => props.show, (isVisible) => {
  if (isVisible) {
    // 当点歌台打开时，如果是用户歌单模式且有内容，则自动搜索
    if (selectedSearchMode.value.id === 'user_playlist' && userPlaylistQuery.value.trim()) {
      handleSearch()
    }
  } else {
    // 关闭时清空搜索结果
    clearSearchResults()
  }
})

// 监听搜索模式变化，当切换到user_playlist且有值时自动搜索
watch(
  () => selectedSearchMode.value.id,
  (newMode) => {
    if (newMode === 'user_playlist' && userPlaylistQuery.value.trim()) {
      // 如果切换到"用户歌单"模式且已有搜索值，自动执行搜索
      handleSearch()
    }
  },
)
</script>
