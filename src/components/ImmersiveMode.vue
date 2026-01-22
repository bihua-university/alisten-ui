<template>
  <div class="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden immersive-mode">
    <!-- 背景模糊效果 -->
    <div class="absolute inset-0 from-dark/90 via-dark/80 to-dark/90" />

    <!-- 专辑封面背景 -->
    <div class="absolute inset-0 opacity-30">
      <img
        :src="playerState.currentSong?.cover"
        :alt="playerState.currentSong?.title"
        class="w-full h-full object-cover blur-3xl scale-110 transform"
      >
    </div>

    <!-- 主要内容区域 -->
    <div class="relative z-10 w-full h-full flex flex-col max-w-7xl mx-auto">
      <div class="immersive-grid flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center min-h-0">
        <!-- 左侧：专辑信息区域 -->
        <div class="flex flex-col items-center lg:items-start gap-4 lg:gap-8 h-full justify-center">
          <!-- 专辑封面 - 响应式尺寸 -->
          <div class="relative group album-cover-wrapper">
            <div
              class="album-cover rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-500"
            >
              <img
                :src="playerState.currentSong?.cover"
                :alt="playerState.currentSong?.title"
                class="w-full h-full object-cover"
              >
            </div>
          </div>

          <div class="text-center lg:text-left space-y-2 lg:space-y-4 album-info px-4 lg:px-0">
            <div>
              <h1 class="immersive-title font-bold text-white mb-1 lg:mb-2 leading-tight line-clamp-2">
                {{ playerState.currentSong?.title || '暂无歌曲' }}
              </h1>
              <p class="immersive-artist relative py-1 lg:py-3 text-gray-300 line-clamp-1">
                {{ playerState.currentSong?.artist }}
              </p>
            </div>
          </div>
        </div>

        <!-- 右侧：歌词区域 -->
        <div class="flex flex-col lyrics-section min-h-0">
          <div
            ref="lyricsContainer"
            class="flex-1 overflow-y-auto immersive-lyrics-container mx-auto text-center px-2 sm:px-4 w-full relative"
          >
            <!-- 顶部占位，确保第一行歌词可以滚动到中间 -->
            <div class="lyrics-spacer" />
            
            <div
              v-for="(line, index) in currentLyrics"
              :key="index"
              class="lyric-line transition-all duration-300"
              :class="[{
                'active text-white font-medium': index === currentLyricIndex,
                'text-gray-400': index !== currentLyricIndex,
              }]"
            >
              {{ line.text }}
            </div>

            <!-- 底部占位，确保最后一行歌词可以滚动到中间 -->
            <div class="lyrics-spacer" />

            <!-- 当没有歌词时的占位符 -->
            <div v-if="currentLyrics.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <i class="fa-solid fa-music text-4xl lg:text-6xl mb-4 lg:mb-6 opacity-50" />
              <p class="text-lg lg:text-xl">
                暂无歌词
              </p>
              <p class="text-xs lg:text-sm mt-2 opacity-75">
                享受纯音乐的美好
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="flex-shrink-0 mt-auto pt-4 lg:pt-6">
        <div class="space-y-2 lg:space-y-3 py-2 lg:py-3">
          <div class="w-full h-1.5 lg:h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              class="immersive-progress h-full rounded-full w-full origin-left"
              :style="{
                transform: `scaleX(${progressPercentage / 100})`,
                transition: 'transform 200ms linear',
              }"
            />
          </div>
          <div class="flex justify-between text-xs lg:text-sm text-gray-400">
            <span>{{ formatTime(playerState.currentTime || 0) }}</span>
            <span>{{ formatTime((playerState.currentSong?.duration || 0) / 1000) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 浮动操作面板 -->
    <div class="fixed top-4 right-4 lg:top-6 lg:right-6 z-30 flex flex-col space-y-2 lg:space-y-3">
      <!-- 退出沉浸模式 -->
      <button
        class="w-10 h-10 lg:w-12 lg:h-12 bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-all shadow-xl touch-target group"
        title="退出沉浸模式 (F键或ESC键)"
        @click="$emit('toggleImmersive')"
      >
        <i class="fa-solid fa-compress text-base lg:text-lg group-hover:scale-110 transition-transform" />
      </button>

      <!-- 帮助按钮 -->
      <button
        class="w-10 h-10 lg:w-12 lg:h-12 bg-black/40 backdrop-blur-md border border-white/20 text-green-400 rounded-full flex items-center justify-center hover:bg-green-500/20 transition-all shadow-xl touch-target group"
        title="帮助"
        @click="$emit('showHelp')"
      >
        <i class="fa-solid fa-question-circle text-base lg:text-lg group-hover:scale-110 transition-transform" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useLyrics } from '@/composables/useLyrics'
import { usePlayer } from '@/composables/usePlayer'
import { formatTime } from '@/utils/time'

// 定义 emits
defineEmits<{
  toggleImmersive: []
  showHelp: []
}>()

// 使用播放器组合式函数
const { playerState, progressPercentage } = usePlayer()

// 使用歌词组合式函数
const {
  registerLyricsContainer,
  unregisterLyricsContainer,
  currentLyrics,
  currentLyricIndex,
} = useLyrics()

// 歌词容器引用
const lyricsContainer = ref<HTMLElement>()

// 组件挂载时注册容器
onMounted(() => {
  if (lyricsContainer.value) {
    registerLyricsContainer(lyricsContainer)
  }
})

// 组件卸载时取消注册容器
onUnmounted(() => {
  if (lyricsContainer.value) {
    unregisterLyricsContainer(lyricsContainer)
  }
})
</script>

<style scoped>
/* 沉浸模式容器 */
.immersive-mode {
  height: 100%;
  min-height: 0;
}

/* 专辑封面响应式尺寸 - 基于视口 */
.album-cover-wrapper {
  width: min(80vw, 40vh, 24rem);
  aspect-ratio: 1;
}

@media (min-width: 1024px) {
  .album-cover-wrapper {
    width: min(40vw, 50vh, 28rem);
  }
}

@media (min-width: 1280px) {
  .album-cover-wrapper {
    width: min(35vw, 55vh, 32rem);
  }
}

.album-cover {
  width: 100%;
  height: 100%;
}

/* 专辑信息响应式 */
.album-info {
  width: min(80vw, 24rem);
}

@media (min-width: 1024px) {
  .album-info {
    width: min(40vw, 28rem);
  }
}

/* 歌曲标题响应式字体 */
.immersive-title {
  font-size: clamp(1.25rem, 3vw, 2.5rem);
}

/* 艺术家名响应式字体 */
.immersive-artist {
  font-size: clamp(1rem, 2vw, 1.5rem);
}

/* 歌词区域高度 */
.lyrics-section {
  height: min(50vh, 24rem);
}

@media (min-width: 1024px) {
  .lyrics-section {
    height: min(70vh, 40rem);
  }
}

/* 歌词样式 */
.lyric-line {
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  /* 响应式字体 */
  font-size: clamp(0.75rem, 1.5vw, 1rem);
}

.lyric-line.active {
  font-size: clamp(1.125rem, 3vw, 2.5rem);
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

@media (min-width: 640px) {
  .lyric-line {
    padding: 0.5rem 1rem;
  }
}

/* 沉浸模式歌词容器样式 */
.immersive-lyrics-container {
  scroll-behavior: smooth;
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.immersive-lyrics-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* 歌词占位符 - 高度为容器的一半，确保歌词能滚动到中心 */
.lyrics-spacer {
  height: 50%;
  min-height: 40%;
  pointer-events: none;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
