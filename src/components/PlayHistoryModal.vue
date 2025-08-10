<template>
  <div class="fixed inset-0 z-50 flex items-end md:items-center justify-center">
    <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('close')" />
    <div
      class="relative bg-dark border-t border-white/20 md:border md:rounded-xl w-full max-w-4xl h-[85vh] md:h-[90vh] flex flex-col overflow-hidden"
    >
      <!-- 头部 -->
      <div class="p-3 md:p-4 border-b border-white/10 flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <h2 class="text-lg md:text-xl font-semibold flex items-center">
            <i class="fa-solid fa-history mr-2 text-purple-400" />
            播放历史
          </h2>
        </div>
        <div class="flex items-center space-x-1 md:space-x-2">
          <!-- 搜索框 -->
          <div class="relative hidden sm:block">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索歌曲..."
              class="bg-white/10 text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm w-32 md:w-48 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
            <i class="fa-solid fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <!-- 移动端搜索按钮 -->
          <button
            class="sm:hidden bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg p-2 transition-all touch-target"
            @click="showMobileSearch = !showMobileSearch"
          >
            <i class="fa-solid fa-search" />
          </button>

          <!-- 功能按钮 -->
          <button
            class="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg px-2 py-2 md:px-3 text-xs md:text-sm transition-all touch-target"
            @click="showStats = !showStats"
          >
            <i class="fa-solid fa-chart-bar mr-0 md:mr-1" />
            <span class="hidden md:inline">统计</span>
          </button>

          <div class="hidden md:inline">
            <button
              class="bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg px-2 py-2 md:px-3 text-xs md:text-sm transition-all touch-target"
              @click="exportHistory"
            >
              <i class="fa-solid fa-download mr-0 md:mr-1" />
              <span>导出</span>
            </button>
          </div>

          <button
            class="bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg px-2 py-2 md:px-3 text-xs md:text-sm transition-all touch-target"
            @click="showClearConfirm = true"
          >
            <i class="fa-solid fa-trash mr-0 md:mr-1" />
            <span class="hidden md:inline">清空</span>
          </button>

          <button
            class="text-gray-400 hover:text-white transition-colors rounded-lg p-2 touch-target"
            @click="$emit('close')"
          >
            <i class="fa-solid fa-times text-lg" />
          </button>
        </div>
      </div>

      <!-- 移动端搜索框 -->
      <div v-if="showMobileSearch" class="sm:hidden p-3 border-b border-white/10">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索歌曲..."
            class="bg-white/10 text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
          <i class="fa-solid fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <!-- 统计面板 -->
      <div v-if="showStats" class="p-4 bg-white/5 border-b border-white/10">
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-400">
              {{ playStats.totalPlays }}
            </div>
            <div class="text-sm text-gray-400">
              总播放
            </div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-400">
              {{ formatDuration(playStats.totalDuration) }}
            </div>
            <div class="text-sm text-gray-400">
              总时长
            </div>
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- 时间线视图 -->
        <div class="flex-1 overflow-y-auto smooth-scroll scrollbar-hide">
          <div class="px-3">
            <div v-if="filteredHistoryByDate.length === 0" class="text-center text-gray-400 py-8">
              <i class="fa-solid fa-music text-4xl mb-4 opacity-50" />
              <p>{{ searchQuery ? '没有找到匹配的歌曲' : '暂无播放历史' }}</p>
            </div>

            <div v-for="group in filteredHistoryByDate" :key="group.date" class="space-y-3">
              <!-- 日期标题 -->
              <div class="sticky top-0 z-10 bg-dark/90 backdrop-blur-sm border-b border-white/10 -mx-3 md:-mx-4 px-3 md:px-4 py-2">
                <h3 class="text-sm font-medium text-gray-300">
                  {{ group.date }}
                </h3>
              </div>

              <!-- 歌曲列表 -->
              <div class="space-y-2">
                <div
                  v-for="(item, index) in group.items"
                  :key="`${item.playedAt}-${index}`"
                  class="relative"
                >
                  <MusicItem
                    :music="item.song"
                    @add="pickMusic(item.song, item.song.source || 'netease')"
                  >
                    <template #actions="{ music }">
                      <!-- 操作按钮 -->
                      <div class="flex items-center space-x-1">
                        <button
                          class="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all touch-target"
                          @click="pickMusic(music, music.source || 'netease')"
                        >
                          <i class="fa-solid fa-plus text-xs" />
                        </button>
                        <button
                          class="bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all touch-target"
                          @click="removeFromPlayHistory(getHistoryIndex(item))"
                        >
                          <i class="fa-solid fa-trash text-xs" />
                        </button>
                      </div>
                    </template>
                  </MusicItem>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 清空确认对话框 -->
    <div v-if="showClearConfirm" class="fixed inset-0 z-60 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="showClearConfirm = false" />
      <div class="relative bg-dark border border-white/20 rounded-xl p-6 max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">
          清空播放历史
        </h3>
        <p class="text-gray-400 mb-6">
          确定要清空所有播放历史吗？此操作不可撤销。
        </p>
        <div class="flex justify-end space-x-3">
          <button
            class="bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded-lg px-4 py-2 transition-all touch-target"
            @click="showClearConfirm = false"
          >
            取消
          </button>
          <button
            class="bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg px-4 py-2 transition-all touch-target"
            @click="handleClearHistory"
          >
            清空
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MusicItem from '@/components/common/MusicItem.vue'
import { useHistory } from '@/composables/useHistory'
import { usePlayer } from '@/composables/usePlayer'

defineEmits<{
  close: []
}>()

const {
  playHistoryByDate,
  playStats,
  clearPlayHistory,
  removeFromPlayHistory,
  searchPlayHistory,
  exportPlayHistory: exportHistoryData,
} = useHistory()

const { pickMusic } = usePlayer()

const searchQuery = ref('')
const showStats = ref(false)
const showClearConfirm = ref(false)
const showMobileSearch = ref(false)

// 过滤后的历史记录
const filteredHistoryByDate = computed(() => {
  if (!searchQuery.value.trim()) {
    return playHistoryByDate.value
  }

  const filteredHistory = searchPlayHistory(searchQuery.value)
  const groups: { [key: string]: typeof filteredHistory } = {}

  filteredHistory.forEach((item) => {
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

// 格式化时长
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// 获取历史记录索引（用于删除）
function getHistoryIndex(item: any): number {
  return playHistoryByDate.value.findIndex((group) => {
    return group.items.some(historyItem =>
      historyItem.playedAt === item.playedAt && historyItem.song.id === item.song.id,
    )
  })
}

// 清空历史记录
function handleClearHistory() {
  clearPlayHistory()
  showClearConfirm.value = false
}

// 导出历史记录
function exportHistory() {
  exportHistoryData()
}
</script>
