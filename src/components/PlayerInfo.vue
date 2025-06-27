<template>
  <div>
    <!-- 进度条 -->
    <div class="h-3 md:h-1 bg-white/10 rounded-full overflow-hidden relative hidden md:block">
      <div
        class="h-full immersive-progress rounded-full w-full origin-left"
        :style="{
          transform: `scaleX(${progressPercentage / 100})`,
          transition: 'transform 200ms linear',
        }"
      />
    </div>

    <!-- 播放信息区域 -->
    <div class="glass-effect bg-dark/80 backdrop-blur-xl p-3 sm:p-4">
      <div class="flex items-center">
        <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden mr-3 sm:mr-4 flex-shrink-0">
          <img
            :src="playerState.currentSong?.cover"
            :alt="playerState.currentSong?.title"
            class="w-full h-full object-cover"
          >
        </div>
        <div class="flex-1 mr-2 sm:mr-4 min-w-0">
          <h3 class="font-medium text-sm sm:text-base truncate">
            {{ playerState.currentSong?.title }}
          </h3>
          <p class="text-xs text-gray-400 truncate">
            {{ playerState.currentSong?.artist }}{{
              playerState.currentSong?.album
                ? ` - ${playerState.currentSong?.album}` : '' }}
          </p>
        </div>
        <div class="flex flex-col items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <div class="relative ml-auto">
            <div class="flex justify-between text-xs text-gray-400 mt-1">
              <span>{{ formatTime(playerState.currentTime || 0) }} /
                {{ formatTime((playerState.currentSong?.duration || 0) / 1000) }}</span>
            </div>
          </div>

          <!-- 音量控制 -->
          <div class="hidden md:flex">
            <VolumeSlider />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlayer } from '@/composables/usePlayer'
import { formatTime } from '@/utils/time'
import VolumeSlider from './VolumeSlider.vue'

// 使用播放器状态
const { playerState, progressPercentage } = usePlayer()
</script>

<style scoped>
/* 进度条样式增强 */
.immersive-progress {
  background: linear-gradient(90deg,
    theme('colors.primary'),
    theme('colors.purple.500'),
    theme('colors.blue.500')
  );
  box-shadow: 0 0 8px rgba(79, 70, 229, 0.5);
  will-change: transform;
}
</style>
