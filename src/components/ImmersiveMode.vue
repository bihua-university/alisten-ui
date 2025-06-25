<template>
  <div class="flex-1 flex items-center justify-center p-8 relative overflow-hidden immersive-mode">
    <!-- 背景模糊效果 -->
    <div class="absolute inset-0 bg-gradient-to-br from-dark/90 via-dark/80 to-dark/90 backdrop-blur-3xl" />

    <!-- 专辑封面背景 -->
    <div class="absolute inset-0 opacity-30">
      <img
        :src="currentSong?.cover"
        :alt="currentSong?.title"
        class="w-full h-full object-cover blur-3xl scale-110 transform"
      >
    </div>

    <!-- 主要内容区域 -->
    <div class="relative z-10 w-full max-w-6xl mx-auto">
      <div class="immersive-grid grid lg:grid-cols-2 gap-12 items-center">
        <!-- 左侧：专辑信息区域 -->
        <div class="flex flex-col items-center lg:items-start space-y-8">
          <!-- 专辑封面 -->
          <div class="relative group">
            <div
              class="w-80 h-80 lg:w-96 lg:h-96 rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-500"
            >
              <img
                :src="currentSong?.cover"
                :alt="currentSong?.title"
                class="w-full h-full"
              >
            </div>
          </div>

          <!-- 歌曲信息 -->
          <div class="text-center lg:text-left space-y-4 w-80 lg:w-96">
            <div>
              <h1 class="immersive-title text-2xl lg:text-4xl font-bold text-white mb-2 leading-tight">
                {{ currentSong?.title || '暂无歌曲' }}
              </h1>
              <p class="immersive-artist relative py-3 text-xl lg:text-2xl text-gray-300">
                {{ currentSong?.artist }}
              </p>
            </div>
          </div>
        </div>

        <!-- 右侧：歌词区域 -->
        <div class="flex flex-col h-96 lg:h-[600px]">
          <div
            ref="lyricsContainer"
            class="flex-1 overflow-y-auto immersive-lyrics-container mx-auto text-center space-y-1 sm:px-4 max-w-2xl"
          >
            <div class="pr-4">
              <div
                v-for="(line, index) in lyrics"
                :key="index"
                class="lyric-line transition-all duration-300"
                :class="[{
                  'active space-y-6 text-white font-medium mb-4 mt-4': index === currentLyricIndex,
                  'text-gray-400 space-y-1': index !== currentLyricIndex,
                  'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl': index === currentLyricIndex,
                  'text-sm sm:text-base md:text-lg': index !== currentLyricIndex,
                }]"
              >
                {{ line.text }}
              </div>

              <!-- 当没有歌词时的占位符 -->
              <div v-if="lyrics.length === 0" class="text-center text-gray-400 py-16">
                <i class="fa-solid fa-music text-6xl mb-6 opacity-50" />
                <p class="text-xl">
                  暂无歌词
                </p>
                <p class="text-sm mt-2 opacity-75">
                  享受纯音乐的美好
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="h-3" />
      <div class="space-y-3 py-3">
        <div class="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            class="immersive-progress h-full rounded-full transition-all duration-300"
            :style="{ width: `${progressPercentage}%` }"
          />
        </div>
        <div class="flex justify-between text-sm text-gray-400">
          <span>{{ formatTime(currentTime || 0) }}</span>
          <span>{{ formatTime((currentSong?.duration || 0) / 1000) }}</span>
        </div>
      </div>
    </div>

    <!-- 浮动操作面板 -->

    <div class="fixed top-6 right-6 z-30 flex flex-col space-y-3">
      <!-- 退出沉浸模式 -->
      <button
        class="w-12 h-12 bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-all shadow-xl touch-target group"
        title="退出沉浸模式 (F键或ESC键)"
        @click="$emit('toggleImmersive')"
      >
        <i class="fa-solid fa-compress text-lg group-hover:scale-110 transition-transform" />
      </button>

      <!-- 帮助按钮 -->
      <button
        class="w-12 h-12 bg-black/40 backdrop-blur-md border border-white/20 text-green-400 rounded-full flex items-center justify-center hover:bg-green-500/20 transition-all shadow-xl touch-target group"
        title="帮助"
        @click="$emit('showHelp')"
      >
        <i class="fa-solid fa-question-circle text-lg group-hover:scale-110 transition-transform" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LyricLine, Song } from '@/types'
import { nextTick, ref, watch } from 'vue'
import { formatTime } from '@/utils/time'

// 定义 props
interface Props {
  currentSong?: Song | null
  lyrics: LyricLine[]
  currentLyricIndex: number
  progressPercentage: number
  currentTime?: number
}

// 接收 props
const props = defineProps<Props>()

// 定义 emits
defineEmits<{
  toggleImmersive: []
  showHelp: []
}>()

// 歌词容器引用
const lyricsContainer = ref<HTMLElement>()

// 歌词自动滚动功能
function scrollLyricsToCenter(container: HTMLElement | undefined, index: number, smooth: boolean = true) {
  if (!container)
    return

  const lyricLines = container.querySelectorAll('.lyric-line')
  if (lyricLines[index]) {
    const targetLine = lyricLines[index] as HTMLElement
    const containerHeight = container.clientHeight
    const targetTop = targetLine.offsetTop
    const targetHeight = targetLine.clientHeight

    // 计算目标滚动位置（让当前歌词居中）
    const targetScrollTop = targetTop - (containerHeight / 2) + (targetHeight / 2)

    // 根据参数决定是否平滑滚动
    container.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: smooth ? 'smooth' : 'instant',
    })
  }
}

// 监听当前歌词索引变化，实现自动滚动
watch(() => props.currentLyricIndex, (newIndex) => {
  if (newIndex >= 0 && props.lyrics.length > 0) {
    // 延迟执行滚动，确保DOM更新完成
    nextTick(() => {
      scrollLyricsToCenter(lyricsContainer.value, newIndex)
    })
  }
})

// 暴露方法供父组件使用
defineExpose({
  scrollLyricsToCenter: (index: number, smooth: boolean = true) => {
    scrollLyricsToCenter(lyricsContainer.value, index, smooth)
  },
})
</script>

<style scoped>
/* 歌词样式 */
.lyric-line {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

/* 沉浸模式下的歌词特殊效果 */
.lyric-line.active {
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
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
