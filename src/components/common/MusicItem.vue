<template>
  <div
    class="music-item group bg-white/[0.03] hover:bg-white/[0.08] rounded-2xl p-2 md:p-3 flex items-center border border-transparent hover:border-white/5"
  >
    <!-- 封面图片 -->
    <div class="w-14 h-14 md:w-20 md:h-20 rounded-xl overflow-hidden mr-3 md:mr-4 flex-shrink-0 relative shadow-lg group-hover:shadow-purple-500/10">
      <img
        :src="music.cover"
        :alt="music.title"
        class="w-full h-full object-cover group-hover:scale-105"
        @error="handleImageError"
      >
      <!-- 播放图标遮罩 -->
      <div class="play-overlay absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
        <i class="fa-solid fa-play text-white/80 text-lg" />
      </div>
    </div>

    <!-- 歌曲信息 -->
    <div class="flex-1 min-w-0 mr-3">
      <p
        class="text-sm md:text-lg font-medium truncate mb-1 text-white group-hover:text-purple-300"
      >
        {{ music.title }}
      </p>
      <p
        class="text-xs md:text-sm text-white/50 truncate mb-1"
      >
        {{ music.artist }}
      </p>
      <div class="flex items-center gap-2">
        <!-- 专辑信息 -->
        <span
          v-if="music.album"
          class="text-xs text-white/40 truncate hidden md:inline-flex items-center"
        >
          <i class="fa-solid fa-compact-disc mr-1 opacity-50" />
          {{ music.album }}
        </span>
        <!-- 分隔点 -->
        <span v-if="music.album && music.duration" class="text-white/20 hidden md:inline">•</span>
        <!-- 时长 -->
        <span
          v-if="music.duration"
          class="text-xs text-white/40 flex-shrink-0"
        >
          {{ formatTime(music.duration / 1000) }}
        </span>
      </div>
    </div>

    <!-- 操作按钮区域 -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <!-- 自定义操作按钮插槽 -->
      <slot name="actions" :music="music">
        <!-- 默认的添加按钮 -->
        <button
          class="search-btn w-9 h-9 md:w-10 md:h-10 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white flex items-center justify-center"
          @click.stop="$emit('add', music)"
        >
          <i class="fa-solid fa-plus" />
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Song } from '@/types'
import { formatTime } from '@/utils/time'

interface Props {
  music: Song
}

defineProps<Props>()

defineEmits<{
  add: [music: Song]
}>()

// 处理图片加载错误
function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  // 设置默认封面
  img.src = '/icon-192x192.png'
}
</script>
