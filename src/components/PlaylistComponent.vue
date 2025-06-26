<template>
  <!-- 桌面端播放列表 - 侧边栏模式 -->
  <aside
    v-if="!isMobile && !isImmersiveMode"
    class="w-72 bg-dark/60 backdrop-blur-xl border-r border-white/10 hidden md:block overflow-y-auto scrollbar-hide"
  >
    <div class="p-4 border-b border-white/10">
      <h2 class="text-lg font-semibold flex items-center">
        <i class="fa-solid fa-list-ul mr-2 text-primary" />播放列表
      </h2>
      <p class="text-xs text-gray-400 mt-1">
        共 {{ playlist.length }} 首歌曲 · {{ formatTime(totalDuration) }}
      </p>
    </div>
    <div class="playlist-container space-y-1">
      <PlaylistItem
        v-for="(song, index) in playlist"
        :key="song.id"
        :song="song"
        :index="index"
        :is-current="index === 0"
        :is-desktop="true"
        @like="$emit('songLike', index, song.title)"
        @delete="$emit('songDelete', song.title)"
      />
    </div>
  </aside>

  <!-- 移动端播放列表 - 模态框模式 -->
  <transition name="modal">
    <div v-if="show && isMobile" class="fixed inset-0 z-50 flex w-full items-end md:items-center justify-center">
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('close')" />
      <div
        class="relative bg-dark border-t border-white/20 md:rounded-xl w-full max-w-4xl h-[85vh] md:max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div class="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 class="text-lg font-semibold flex items-center">
            <i class="fa-solid fa-list-ul mr-2 text-primary" />播放列表
          </h2>
          <button
            class="text-gray-400 hover:text-white transition-colors touch-target"
            @click="$emit('close')"
          >
            <i class="fa-solid fa-times text-lg" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto smooth-scroll modal-scroll">
          <div class="p-3 text-xs text-gray-400 border-b border-white/5">
            共 {{ playlist.length }} 首歌曲 · {{ formatTime(totalDuration) }}
          </div>
          <div class="space-y-1">
            <PlaylistItem
              v-for="(song, index) in playlist"
              :key="song.id"
              :song="song"
              :index="index"
              :is-current="index === 0"
              :is-mobile="true"
              @like="$emit('songLike', index, song.title)"
              @delete="$emit('songDelete', song.title)"
            />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import type { Song } from '@/types'
import { computed } from 'vue'
import { formatTime } from '@/utils/time'
import PlaylistItem from './PlaylistItem.vue'

// 定义 props
interface Props {
  playlist: Song[]
  show?: boolean
  isImmersiveMode?: boolean
  isMobile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  isImmersiveMode: false,
  isMobile: false,
})

// 定义 emits
defineEmits<{
  close: []
  songLike: [index: number, title: string]
  songDelete: [songName: string]
}>()

// 计算播放列表总时长
const totalDuration = computed(() => {
  return props.playlist.reduce((total, song) => total + song.duration, 0)
})
</script>

<style scoped>
/* 模态框动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 滚动条样式 */
.scrollbar-hide {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* 平滑滚动 */
.smooth-scroll {
  scroll-behavior: smooth;
}

/* 模态框滚动样式 */
.modal-scroll::-webkit-scrollbar {
  width: 4px;
}

.modal-scroll::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.modal-scroll::-webkit-scrollbar-thumb {
  background: rgba(79, 70, 229, 0.6);
  border-radius: 2px;
}

.modal-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(79, 70, 229, 0.8);
}
</style>
