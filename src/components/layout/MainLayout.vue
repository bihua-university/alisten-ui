<template>
  <div class="root-container overflow-x-hidden">
    <div class="app-viewport flex flex-col items-center relative bg-gradient-to-br from-gray-900 to-black overflow-hidden font-sans text-white">
      <!-- Background Abstract Shapes -->
      <div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div class="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

      <!-- Dynamic Song Background -->
      <div v-if="currentSong?.cover && !isImmersiveMode" class="absolute inset-0 z-0">
        <img
          :key="currentSong.id"
          :src="currentSong.cover"
          :alt="currentSong.title"
          class="w-full h-full object-cover blur-3xl scale-110 opacity-30 transition-all duration-1000"
        >
        <div class="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/90" />
      </div>

      <!-- Main Layout Container -->
      <div class="z-10 w-full md:max-w-[95%] h-full flex flex-col gap-6 pt-4 px-0 md:p-6 md:mt-0 md:pb-6 overflow-hidden" style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));">
        <!-- Desktop Layout -->
        <div class="hidden md:flex md:flex-row gap-6 h-full">
          <!-- Left Panel: Player & Lyrics (Desktop) -->
          <div class="flex-[3] flex flex-col min-h-0 min-w-0 relative">
            <!-- Lyrics Panel Component -->
            <LyricsPanel class="mb-4" />

            <!-- Player Controls Component -->
            <PlayerControls :is-desktop="true" />
          </div>

          <!-- Right Panel: Tabbed Interface (Desktop) -->
          <div class="flex-[1] flex flex-col gap-4 md:gap-6 min-h-0 md:h-auto overflow-hidden min-w-[280px] relative">
            <!-- Tab Navigation -->
            <div class="glass rounded-2xl p-1.5 flex gap-1 shrink-0">
              <button
                class="flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all"
                :class="desktopRightTab === 'playlist' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'"
                @click="desktopRightTab = 'playlist'"
              >
                <div class="flex items-center justify-center gap-2">
                  <ListMusic :size="16" />
                  <span>播放列表</span>
                </div>
              </button>
              <button
                class="flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all"
                :class="desktopRightTab === 'chat' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'"
                @click="desktopRightTab = 'chat'"
              >
                <div class="flex items-center justify-center gap-2">
                  <MessageSquare :size="16" />
                  <span>聊天</span>
                </div>
              </button>
            </div>

            <!-- Tab Content Container with Slide Animation -->
            <div
              class="flex-1 flex transition-transform duration-300 ease-out overflow-hidden"
              :style="{ transform: desktopRightTab === 'playlist' ? 'translateX(0)' : 'translateX(-50%)' }"
              style="width: 200%;"
            >
              <!-- Playlist Tab -->
              <div class="w-1/2 shrink-0 px-2">
                <PlaylistPanel
                  :is-desktop="true"
                  @show-music-search="emit('showMusicSearch')"
                  @song-like="(index, title) => emit('songLike', index, title)"
                  @song-delete="(title) => emit('songDelete', title)"
                />
              </div>

              <!-- Chat Tab -->
              <div class="w-1/2 shrink-0 px-2">
                <ChatPanel
                  :is-desktop="true"
                  @show-help="emit('showHelp')"
                  @show-settings="emit('showSettings')"
                  @show-play-history="emit('showPlayHistory')"
                  @share-room="emit('shareRoom')"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Swipe Container (Player / Playlist / Chat) -->
        <div
          class="mobile-panels flex w-[300vw] flex-1 min-h-0 md:hidden"
          :class="{ 'transition-transform': isTransitioning }"
          :style="panelsStyle"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          @touchcancel="handleTouchCancel"
        >
          <!-- Mobile Panel: Player & Lyrics -->
          <div class="w-screen shrink-0 flex flex-col min-h-0 h-full relative px-4 pb-2">
            <!-- Lyrics Panel Component -->
            <LyricsPanel class="mb-4" />

            <!-- Player Controls Component -->
            <PlayerControls />
          </div>

          <!-- Mobile Panel: Playlist -->
          <div class="w-screen shrink-0 flex flex-col gap-4 min-h-0 h-full px-4 pb-2">
            <PlaylistPanel
              @show-music-search="emit('showMusicSearch')"
              @song-like="(index, title) => emit('songLike', index, title)"
              @song-delete="(title) => emit('songDelete', title)"
            />
          </div>

          <!-- Mobile Panel: Chat -->
          <div class="w-screen shrink-0 flex flex-col gap-4 min-h-0 h-full px-4 pb-2">
            <ChatPanel
              @show-help="emit('showHelp')"
              @show-settings="emit('showSettings')"
              @show-play-history="emit('showPlayHistory')"
              @share-room="emit('shareRoom')"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ListMusic, MessageSquare } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { usePerformance } from '@/composables/usePerformance'
import { usePlayer } from '@/composables/usePlayer'
import { isScrollableElement } from '@/utils/mobile'
import ChatPanel from '../ChatPanel.vue'
import LyricsPanel from '../LyricsPanel.vue'
import PlayerControls from '../PlayerControls.vue'
import PlaylistPanel from '../PlaylistPanel.vue'

// Props
interface Props {
  isImmersiveMode?: boolean
}
withDefaults(defineProps<Props>(), {
  isImmersiveMode: false,
})

// Emits
const emit = defineEmits<{
  showMusicSearch: []
  showHelp: []
  showSettings: []
  showPlayHistory: []
  shareRoom: []
  songLike: [index: number, title: string]
  songDelete: [songName: string]
}>()

// Composables
const { playerState } = usePlayer()
const { performanceLevel } = usePerformance()

// Local state
const activeTab = ref<'lyrics' | 'playlist' | 'room'>('lyrics')
const desktopRightTab = ref<'playlist' | 'chat'>('playlist')

// Touch swipe state with follow gesture
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchCurrentX = ref(0)
const isDragging = ref(false)
const isTransitioning = ref(false)
const dragOffset = ref(0)
const startTime = ref(0)

// Scroll detection during drag
const isScrolling = ref(false)

// Computed
const currentSong = computed(() => playerState.currentSong)

// Calculate base transform based on active tab
const baseTransform = computed(() => {
  const tabIndex = activeTab.value === 'lyrics' ? 0 : activeTab.value === 'playlist' ? 1 : 2
  return -tabIndex * 100 // vw
})

// Dynamic panels style for follow gesture
const panelsStyle = computed(() => {
  if (isDragging.value) {
    const totalOffset = baseTransform.value + (dragOffset.value / window.innerWidth) * 100
    return {
      transform: `translateX(${totalOffset}vw)`,
    }
  }
  return {
    transform: `translateX(${baseTransform.value}vw)`,
  }
})

// 统一的tab切换函数
function switchTab(direction: 'next' | 'prev') {
  const tabs: Array<'lyrics' | 'playlist' | 'room'> = ['lyrics', 'playlist', 'room']
  const currentIndex = tabs.indexOf(activeTab.value)

  if (direction === 'next' && currentIndex < tabs.length - 1) {
    activeTab.value = tabs[currentIndex + 1]
  } else if (direction === 'prev' && currentIndex > 0) {
    activeTab.value = tabs[currentIndex - 1]
  }
}

// Check if touch is on scrollable element
function isTouchOnScrollable(e: TouchEvent): boolean {
  const target = e.target as Element
  return !!isScrollableElement(target)
}

const isMinimalMode = computed(() => performanceLevel.value === 'off')

// 触摸滑动处理 - 支持跟随手势
function handleTouchStart(e: TouchEvent) {
  const touch = e.touches[0]
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
  touchCurrentX.value = touch.clientX
  startTime.value = Date.now()
  isScrolling.value = false

  // 极简模式：仅记录位置用于基础切换，不启用拖拽跟随
  if (isMinimalMode.value) {
    return
  }

  // 检查是否在可滚动区域
  if (isTouchOnScrollable(e)) {
    // 延迟标记为拖动，给滚动留出机会
    return
  }

  isDragging.value = true
  isTransitioning.value = false
  dragOffset.value = 0
}

function handleTouchMove(e: TouchEvent) {
  // 极简模式：禁用拖拽跟随
  if (isMinimalMode.value) {
    return
  }

  if (!isDragging.value && !isScrolling.value) {
    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartX.value
    const deltaY = touch.clientY - touchStartY.value

    // 判断是水平滑动还是垂直滚动
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
      // 垂直滚动，不处理
      isScrolling.value = true
      return
    }

    // 水平滑动，开始拖动
    if (Math.abs(deltaX) > 10) {
      isDragging.value = true
      isTransitioning.value = false
    }
  }

  if (isDragging.value) {
    e.preventDefault()
    const touch = e.touches[0]
    touchCurrentX.value = touch.clientX
    dragOffset.value = touchCurrentX.value - touchStartX.value

    // 边界限制
    const tabIndex = activeTab.value === 'lyrics' ? 0 : activeTab.value === 'playlist' ? 1 : 2
    const screenWidth = window.innerWidth

    if (tabIndex === 0) {
      // 第一页：限制向右滑动，限制向左滑动不超过第二页
      if (dragOffset.value > 0) {
        dragOffset.value = Math.min(dragOffset.value * 0.05, 20)
      } else {
        // 向左滑动限制在 -screenWidth 以内（最多看到第二页）
        dragOffset.value = Math.max(dragOffset.value, -screenWidth)
      }
    } else if (tabIndex === 1) {
      // 第二页：左右滑动限制在相邻页面内
      dragOffset.value = Math.max(Math.min(dragOffset.value, screenWidth), -screenWidth)
    } else if (tabIndex === 2) {
      // 第三页：限制向左滑动，限制向右滑动不超过第二页
      if (dragOffset.value < 0) {
        dragOffset.value = Math.max(dragOffset.value * 0.05, -20)
      } else {
        // 向右滑动限制在 screenWidth 以内（最多看到第二页）
        dragOffset.value = Math.min(dragOffset.value, screenWidth)
      }
    }
  }
}

function handleTouchEnd(e: TouchEvent) {
  const touch = e.changedTouches[0]
  const endX = touch.clientX
  const endTime = Date.now()

  const deltaX = endX - touchStartX.value
  const deltaTime = endTime - startTime.value
  const velocity = Math.abs(deltaX) / deltaTime // 滑动速度 px/ms

  // 阈值判断
  const screenWidth = window.innerWidth
  const distanceThreshold = screenWidth * 0.25 // 25% 屏幕宽度
  const velocityThreshold = 0.5 // 速度阈值 px/ms

  const isQuickSwipe = velocity > velocityThreshold && Math.abs(deltaX) > 30
  const isLongSwipe = Math.abs(deltaX) > distanceThreshold

  // 极简模式：仅基础切换，无拖拽跟随
  if (isMinimalMode.value) {
    if (isQuickSwipe || isLongSwipe) {
      const direction = deltaX < 0 ? 'next' : 'prev'
      switchTab(direction)
    }
    return
  }

  // 开启过渡动画
  isTransitioning.value = true
  isDragging.value = false

  if (isQuickSwipe || isLongSwipe) {
    // 满足切换条件
    const direction = deltaX < 0 ? 'next' : 'prev'
    switchTab(direction)
  }
  // 否则回弹到当前tab（通过isTransitioning和计算属性自动处理）

  dragOffset.value = 0
}

function handleTouchCancel() {
  // 极简模式：无需处理
  if (isMinimalMode.value) {
    return
  }

  // 取消触摸，回弹到当前位置
  isTransitioning.value = true
  isDragging.value = false
  dragOffset.value = 0
  isScrolling.value = false
}

// 键盘方向键处理
function handleKeydown(e: KeyboardEvent) {
  if (window.innerWidth >= 768)
    return

  if (e.key === 'ArrowLeft') {
    switchTab('prev')
  } else if (e.key === 'ArrowRight') {
    switchTab('next')
  }
}

// 注册键盘事件
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.36);
}

.app-viewport {
  height: 100vh;
  height: 100dvh;
  min-height: 100svh;
}

/* Mobile Panel Swipe */
.mobile-panels {
  will-change: transform;
  touch-action: pan-y; /* 允许垂直滚动，由JS处理水平滑动 */
}

.mobile-panels.transition-transform {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

@media (min-width: 768px) {
  .mobile-panels {
    transform: none !important;
    transition: none !important;
  }
}
</style>
