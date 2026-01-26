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
          class="mobile-panels flex w-[300vw] flex-1 min-h-0 transition-transform duration-300 ease-out md:hidden"
          :class="activeTab === 'lyrics' ? 'translate-x-0' : activeTab === 'playlist' ? '-translate-x-[100vw]' : '-translate-x-[200vw]'"
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
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
import { usePlayer } from '@/composables/usePlayer'
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

// Local state
const activeTab = ref<'lyrics' | 'playlist' | 'room'>('lyrics')
const desktopRightTab = ref<'playlist' | 'chat'>('playlist')

// Touch swipe state
const touchStartX = ref(0)

// Computed
const currentSong = computed(() => playerState.currentSong)

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

// 触摸滑动处理
function handleTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0].clientX
}

function handleTouchEnd(e: TouchEvent) {
  const touchEndX = e.changedTouches[0].clientX
  const swipeDistance = touchStartX.value - touchEndX
  const minSwipeDistance = 50

  if (Math.abs(swipeDistance) > minSwipeDistance) {
    switchTab(swipeDistance > 0 ? 'next' : 'prev')
  }
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
}

@media (min-width: 768px) {
  .mobile-panels {
    transform: none !important;
    transition: none !important;
  }
}
</style>
