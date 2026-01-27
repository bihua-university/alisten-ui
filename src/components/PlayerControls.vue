<template>
  <div class="glass rounded-3xl p-4 flex items-center gap-4 shrink-0 hover:bg-white/[0.05] transition-all duration-300">
    <!-- Album Art Small -->
    <div
      class="rounded-xl bg-white/10 shrink-0 overflow-hidden flex items-center justify-center album-art-container"
      :class="isDesktop ? 'w-14 h-14 md:w-16 md:h-16' : 'w-14 h-14'"
    >
      <img
        v-if="currentSong?.cover"
        :src="currentSong.cover"
        :alt="currentSong.title"
        class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
      >
      <span v-else class="text-2xl">🎵</span>
    </div>

    <!-- Info & Progress -->
    <div class="flex-1 min-w-0 flex flex-col justify-center gap-2">
      <div class="flex justify-between items-end">
        <div class="min-w-0">
          <h2
            class="font-bold text-white truncate"
            :class="isDesktop ? 'text-base md:text-lg' : 'text-base'"
          >
            {{ currentSong?.title || '暂无歌曲' }}
          </h2>
          <p
            class="text-white/60 truncate"
            :class="isDesktop ? 'text-xs md:text-sm' : 'text-xs'"
          >
            {{ currentSong?.artist || '未知艺术家' }}
          </p>
        </div>
        <div
          class="text-white/40 font-mono mb-0.5"
          :class="isDesktop ? 'text-[10px] md:text-xs' : 'text-[10px]'"
        >
          {{ formatTime(playerState.currentTime || 0) }} / {{ formatTime((currentSong?.duration || 0) / 1000) }}
        </div>
      </div>
      <!-- Progress Bar -->
      <div class="h-1.5 bg-white/10 rounded-full overflow-hidden relative cursor-pointer group/progress">
        <div
          class="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full transition-all duration-300"
          :style="{ width: `${progress}%` }"
        >
          <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center gap-2 pl-2 border-l border-white/10 ml-2">
      <!-- Skip Button with Animation -->
      <button
        :disabled="isSkipping"
        class="p-2 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 skip-btn"
        :class="isSkipping ? 'opacity-50 cursor-not-allowed animate-pulse' : ''"
        title="切歌"
        @click="handleSkipSong"
      >
        <SkipForward :size="18" class="text-white/70 transition-transform" :class="isSkipping ? 'animate-spin-once' : ''" />
      </button>

      <!-- Volume Button (Desktop Only) -->
      <div v-if="isDesktop" class="relative">
        <button
          class="p-2 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 volume-btn"
          :class="showVolumePopup ? 'bg-white/10 scale-110' : ''"
          @click="toggleVolumePopup"
        >
          <Volume2 :size="18" class="text-white/70 transition-transform hover:rotate-12" />
        </button>
        <!-- Volume Popup -->
        <Transition name="volume-popup">
          <div
            v-if="showVolumePopup"
            class="absolute bottom-full right-0 mb-2 bg-[#121214]/95 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl border border-white/10 z-50"
          >
            <VolumeSlider />
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SkipForward, Volume2 } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { usePlayer } from '@/composables/usePlayer'
import { formatTime } from '@/utils/time'
import VolumeSlider from './VolumeSlider.vue'

interface Props {
  isDesktop?: boolean
}

withDefaults(defineProps<Props>(), {
  isDesktop: false,
})

const { playerState, progressPercentage, skipSong } = usePlayer()

const showVolumePopup = ref(false)
const isSkipping = ref(false)

const currentSong = computed(() => playerState.currentSong)
const progress = computed(() => progressPercentage.value)

function toggleVolumePopup() {
  showVolumePopup.value = !showVolumePopup.value
}

async function handleSkipSong() {
  if (isSkipping.value)
    return
  isSkipping.value = true
  try {
    skipSong()
  } finally {
    setTimeout(() => {
      isSkipping.value = false
    }, 2000)
  }
}
</script>

<style scoped>
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.36);
}

/* Volume Popup Transition */
.volume-popup-enter-active,
.volume-popup-leave-active {
  transition: all 0.2s ease;
}

.volume-popup-enter-from,
.volume-popup-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

/* Button Hover Effects */
.skip-btn:hover,
.volume-btn:hover {
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
}

.album-art-container {
  transition: all 0.3s ease;
}

.album-art-container:hover {
  transform: scale(1.05);
}
</style>
