<template>
  <div
    class="bg-white/5 rounded-lg p-3 flex items-center transition-all hover:bg-white/10"
  >
    <!-- 封面图片 -->
    <div class="w-12 h-12 rounded overflow-hidden mr-3 flex-shrink-0 relative">
      <img
        :src="playlist.cover"
        :alt="playlist.title"
        class="w-full h-full object-cover"
        @error="handleImageError"
      >
      <!-- 歌单类型指示器 -->
      <div class="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 rounded-tl">
        <i class="fa-solid fa-list-ul" />
      </div>
    </div>

    <!-- 歌单信息 -->
    <div class="flex-1 min-w-0 mr-3">
      <p class="text-sm font-medium truncate mb-1">
        {{ playlist.title }}
      </p>
      <p class="text-xs text-gray-400 truncate">
        {{ playlist.creator || '未知创建者' }}
      </p>
      <div class="flex items-center mt-1">
        <span class="text-xs text-gray-500">
          {{ playlist.songCount || 0 }} 首歌曲
        </span>
        <span
          v-if="playlist.playCount"
          class="text-xs text-gray-500 ml-2"
        >
          播放 {{ formatPlayCount(playlist.playCount) }}
        </span>
      </div>
    </div>

    <!-- 操作按钮区域 -->
    <div class="flex items-center space-x-2 flex-shrink-0">
      <!-- 自定义操作按钮插槽 -->
      <slot name="actions" :playlist="playlist">
        <!-- 默认的查看按钮 -->
        <button
          class="bg-green-500/20 hover:bg-green-500/30 active:bg-green-500/40 text-green-400 rounded-full w-10 h-10 flex items-center justify-center transition-all touch-target"
          @click.stop="$emit('view', playlist)"
        >
          <i class="fa-solid fa-eye" />
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PlaylistData {
  id?: string
  originalId?: string
  title: string
  cover: string
  creator?: string
  songCount?: number
  playCount?: number
  description?: string
}

interface Props {
  playlist: PlaylistData
}

defineProps<Props>()

defineEmits<{
  view: [playlist: PlaylistData]
  click: [playlist: PlaylistData]
}>()

// 处理图片加载错误
function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  // 设置默认封面
  img.src = '/icon-192x192.png'
}

// 格式化播放数量
function formatPlayCount(count: number): string {
  if (count >= 100000000) {
    return `${(count / 100000000).toFixed(1)}亿`
  }
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`
  }
  return count.toString()
}
</script>
