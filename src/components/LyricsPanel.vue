<template>
  <div class="glass flex-1 rounded-3xl p-4 md:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
    <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 z-0 pointer-events-none" />

    <!-- Floating Mic Icon -->
    <div class="absolute top-6 right-6 text-white/20">
      <Mic2 :size="24" />
    </div>

    <!-- Lyrics Content -->
    <div
      ref="lyricsContainer"
      class="z-10 w-full max-w-2xl md:max-w-4xl overflow-y-auto max-h-full py-8 px-4 lyrics-scroll flex flex-col items-center"
    >
      <template v-if="currentLyrics.length > 0">
        <p
          v-for="(line, index) in currentLyrics"
          :key="index"
          class="lyric-line text-center transition-all duration-500 ease-out cursor-default"
          :class="[
            index === currentLyricIndex
              ? 'active-lyric text-white text-2xl md:text-4xl font-bold tracking-wide scale-105'
              : index === currentLyricIndex - 1 || index === currentLyricIndex + 1
                ? 'near-lyric text-white/50 text-xl md:text-2xl font-medium scale-100'
                : 'far-lyric text-white/25 text-lg md:text-xl font-normal scale-95 blur-[0.5px]',
          ]"
        >
          {{ line.text || ' ' }}
        </p>
      </template>
      <template v-else>
        <p class="text-white/40 text-xl">
          暂无歌词
        </p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Mic2 } from 'lucide-vue-next'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useLyrics } from '@/composables/useLyrics'

const { currentLyrics, currentLyricIndex, registerLyricsContainer, unregisterLyricsContainer } = useLyrics()

const lyricsContainer = ref<HTMLElement>()

// 注册歌词容器
watch(lyricsContainer, (newVal, oldVal) => {
  if (oldVal)
    unregisterLyricsContainer(ref(oldVal))
  if (newVal)
    registerLyricsContainer(ref(newVal))
})

onMounted(() => {
  if (lyricsContainer.value) {
    registerLyricsContainer(ref(lyricsContainer.value))
  }
})

onBeforeUnmount(() => {
  if (lyricsContainer.value) {
    unregisterLyricsContainer(ref(lyricsContainer.value))
  }
})
</script>

<style scoped>
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.36);
}

/* Hide scrollbar - 强制隐藏所有滚动条 */
.lyrics-scroll::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.lyrics-scroll {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
  overflow: -moz-scrollbars-none !important;
}

/* 兼容性增强 - 隐藏所有可能的滚动条 */
.lyrics-scroll::-webkit-scrollbar-track,
.lyrics-scroll::-webkit-scrollbar-thumb {
  display: none !important;
}
</style>
