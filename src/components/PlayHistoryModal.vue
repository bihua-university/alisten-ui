<template>
  <transition name="modal">
    <div
      v-if="true"
      class="fixed inset-0 z-[60] bg-gray-900/95 backdrop-blur-md flex flex-col"
    >
      <!-- 顶部导航栏 -->
      <div class="flex-none px-6 py-6 md:px-12 md:py-8 flex justify-between items-start md:items-center max-w-7xl w-full mx-auto relative">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-3">
            <i class="fa-solid fa-history text-purple-400" />
            播放历史
          </h1>
          <p class="text-gray-400 mt-2 text-sm md:text-base">
            记录您的每一个心动时刻
          </p>
        </div>
        
        <button
          class="group p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors z-10"
          title="关闭"
          @click="$emit('close')"
        >
          <div class="relative w-8 h-8 flex items-center justify-center">
            <span class="absolute w-full h-0.5 bg-gray-400 rotate-45 group-hover:bg-white transition-colors" />
            <span class="absolute w-full h-0.5 bg-gray-400 -rotate-45 group-hover:bg-white transition-colors" />
          </div>
        </button>
      </div>

      <!-- 内容滚动区 -->
      <div class="flex-1 overflow-y-auto w-full custom-scrollbar">
        <div class="max-w-7xl mx-auto px-6 pb-12 md:px-12">
          
          <!-- 统计与操作栏 -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
            <!-- 统计数据 -->
            <div class="col-span-1 md:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-center">
               <div class="text-gray-400 text-sm mb-1 flex items-center gap-2">
                 <i class="fa-solid fa-music text-purple-400"></i> 总播放
               </div>
               <div class="text-2xl font-bold text-white">{{ playStats.totalPlays }} <span class="text-xs text-gray-500 font-normal">首</span></div>
            </div>
            
            <div class="col-span-1 md:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-center">
               <div class="text-gray-400 text-sm mb-1 flex items-center gap-2">
                 <i class="fa-solid fa-clock text-blue-400"></i> 总时长
               </div>
               <div class="text-2xl font-bold text-white">{{ formatDuration(playStats.totalDuration) }}</div>
            </div>

            <!-- 搜索与操作 -->
            <div class="col-span-1 md:col-span-6 flex gap-3">
              <div class="flex-1 relative group">
                <i class="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                <input
                  v-model="searchQuery"
                  type="text"
                  class="w-full h-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                  placeholder="搜索历史记录..."
                >
              </div>
              
              <button
                class="aspect-square h-full bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-green-400 transition-colors flex items-center justify-center"
                title="导出记录"
                @click="exportHistory"
              >
                <i class="fa-solid fa-download text-lg" />
              </button>
              
              <button
                class="aspect-square h-full bg-white/5 border border-white/10 rounded-2xl hover:bg-red-500/20 text-red-400 border-red-500/20 hover:border-red-500/50 transition-colors flex items-center justify-center"
                title="清空历史"
                @click="showClearConfirm = true"
              >
                <i class="fa-solid fa-trash text-lg" />
              </button>
            </div>
          </div>

          <!-- 历史记录列表 -->
          <transition-group name="list" tag="div" class="space-y-8">
             <div v-if="filteredHistoryByDate.length === 0" class="text-center text-gray-400 py-16 bg-white/5 border border-white/10 rounded-3xl" key="empty">
              <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                 <i class="fa-solid fa-history text-3xl opacity-30" />
              </div>
              <p class="text-lg">{{ searchQuery ? '没有找到匹配的歌曲' : '暂无播放历史' }}</p>
              <p class="text-sm text-gray-500 mt-2">快去听首歌吧 ~</p>
            </div>

            <div v-for="group in filteredHistoryByDate" :key="group.date" class="relative">
               <!-- 日期标记 -->
              <div class="sticky top-0 z-10 py-3 mb-2">
                 <div class="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-md border border-purple-500/30 text-purple-200 px-4 py-1.5 rounded-full text-sm font-medium shadow-lg shadow-purple-900/20">
                    <i class="fa-regular fa-calendar" />
                    {{ group.date }}
                 </div>
              </div>

              <!-- 歌曲卡片列表 -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                 <div
                  v-for="(item, index) in group.items"
                  :key="`${item.playedAt}-${index}`"
                  class="group bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 rounded-xl p-3 transition-all duration-300"
                >
                  <MusicItem
                    :music="item.song"
                    @add="pickMusic(item.song, item.song.source || 'netease')"
                  >
                     <template #actions="{ music }">
                        <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span class="text-xs text-gray-500 mr-2 font-mono">
                               {{ formatTime(new Date(item.playedAt)) }}
                            </span>
                            <button
                              class="w-8 h-8 rounded-lg bg-white/10 hover:bg-purple-500 hover:text-white text-gray-300 flex items-center justify-center transition-colors"
                              title="添加到列表"
                              @click.stop="pickMusic(music, music.source || 'netease')"
                            >
                              <i class="fa-solid fa-plus text-xs" />
                            </button>
                            <button
                              class="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500 hover:text-white text-gray-300 flex items-center justify-center transition-colors"
                              title="删除记录"
                              @click.stop="removeFromPlayHistory(getHistoryIndex(item))"
                            >
                              <i class="fa-solid fa-trash text-xs" />
                            </button>
                        </div>
                     </template>
                  </MusicItem>
                 </div>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </div>
  </transition>

  <!-- 清空确认对话框 -->
  <transition name="modal">
    <div v-if="showClearConfirm" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="showClearConfirm = false" />
      <div class="relative bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl transform transition-all">
        <div class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-500 text-xl">
           <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">
          清空确认
        </h3>
        <p class="text-gray-400 mb-6 leading-relaxed">
          确定要清空所有播放历史吗？<br>此操作<span class="text-red-400">不可撤销</span>，所有记录将永久丢失。
        </p>
        <div class="flex gap-3">
          <button
            class="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors font-medium border border-white/5"
            @click="showClearConfirm = false"
          >
            取消
          </button>
          <button
            class="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors font-medium shadow-lg shadow-red-500/20"
            @click="handleClearHistory"
          >
            确认清空
          </button>
        </div>
      </div>
    </div>
  </transition>
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
const showClearConfirm = ref(false)

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

function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
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

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 列表过渡动画 */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.list-leave-active {
  position: absolute;
}
</style>
