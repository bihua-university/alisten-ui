<template>
  <div
    class="bg-white/5 rounded-lg p-3 flex items-center transition-all hover:bg-white/10"
  >
    <!-- 封面图片 -->
    <div class="w-12 h-12 rounded overflow-hidden mr-3 flex-shrink-0 relative">
      <img
        :src="music.cover"
        :alt="music.title"
        class="w-full h-full object-cover"
        @error="handleImageError"
      >
    </div>

    <!-- 歌曲信息 -->
    <div class="flex-1 min-w-0 mr-3">
      <p
        class="text-xs font-medium truncate mb-1 text-gray-400"
      >
        {{ `${music.artist} - ${music.title}` }}
      </p>
      <div class="flex items-center">
        <!-- 专辑信息 -->
        <span
          v-if="music.album"
          class="text-xs text-gray-500 truncate mr-2"
        >
          {{ music.album }}
        </span>
        <!-- 时长 -->
        <span
          v-if="music.duration"
          class="text-xs text-gray-500 flex-shrink-0"
          :class="{ 'ml-2': !music.album }"
        >
          {{ formatTime(music.duration / 1000) }}
        </span>
      </div>
    </div>

    <!-- 操作按钮区域 -->
    <div class="flex items-center space-x-2 flex-shrink-0">
      <!-- 自定义操作按钮插槽 -->
      <slot name="actions" :music="music">
        <!-- 默认的添加按钮 -->
        <button
          class="bg-primary/20 hover:bg-primary/30 active:bg-primary/40 text-primary rounded-full w-10 h-10 flex items-center justify-center transition-all touch-target"
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
