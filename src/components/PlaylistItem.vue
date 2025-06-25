<template>
  <div
    class="playlist-item transition-all cursor-pointer"
    :class="[
      {
        'bg-primary/20 hover:bg-primary/25 border-l-4 border-primary': isCurrent,
        'hover:bg-white/5': !isCurrent,
      },
      isDesktop ? 'p-3 flex items-center' : 'p-4 flex items-center active:bg-white/10 border-b border-white/5',
    ]"
  >
    <!-- 专辑封面 -->
    <div
      class="rounded bg-gray-700 overflow-hidden mr-3 flex-shrink-0"
      :class="[isDesktop ? 'w-10 h-10' : 'w-12 h-12']"
    >
      <img :src="song.cover" :alt="song.title" class="w-full h-full object-cover">
    </div>

    <!-- 歌曲信息 -->
    <div class="flex-1 min-w-0">
      <h3
        class="font-medium truncate"
        :class="[isDesktop ? 'text-sm' : 'text-sm mb-1']"
      >
        {{ song.title }}
      </h3>
      <p class="text-xs text-gray-400 truncate">
        {{ song.artist }}
      </p>

      <!-- 桌面端显示点歌人信息 -->
      <div v-if="isDesktop && song.requestedBy" class="flex items-center mt-1 space-x-2">
        <div class="requester-info">
          <img :src="song.requestedBy.avatar" :alt="song.requestedBy.name" class="requester-avatar">
          <span>{{ song.requestedBy.name }}</span>
        </div>
        <span class="text-gray-400">·</span>
        <span class="text-xs text-gray-400">{{ formatTime(song.duration) }}</span>
      </div>
    </div>

    <!-- 移动端显示时长 -->
    <div v-if="!isDesktop" class="text-gray-400 text-xs ml-2">
      {{ formatTime(song.duration) }}
    </div>

    <!-- 点赞按钮 - 非当前播放歌曲才显示 -->
    <div v-if="!isCurrent" class="flex items-center space-x-2 ml-2">
      <button
        class="like-button flex items-center justify-center rounded-full text-xs transition-all bg-red-500/20 text-red-400 hover:bg-red-500/30 active:bg-red-500/40 touch-target"
        :class="[
          isDesktop ? 'space-x-1 px-2 py-1' : 'w-8 h-8',
        ]"
        @click.stop="$emit('like')"
      >
        <i class="fa-solid fa-heart" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Song } from '@/types'
import { formatTime } from '@/utils/time'

// 定义 props
interface Props {
  song: Song
  index: number
  isCurrent?: boolean
  isDesktop?: boolean
  isMobile?: boolean
}

withDefaults(defineProps<Props>(), {
  isCurrent: false,
  isDesktop: false,
  isMobile: false,
})

// 定义 emits
defineEmits<{
  like: []
}>()
</script>

<style scoped>
/* 点歌人信息样式 */
.requester-info {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: rgb(156 163 175);
}

.requester-avatar {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  margin-right: 0.25rem;
  object-fit: cover;
}

/* 点赞按钮样式 */
.like-button:hover {
  transform: scale(1.05);
}

.like-button:active {
  transform: scale(0.95);
}
</style>
