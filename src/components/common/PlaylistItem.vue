<template>
  <div
    class="playlist-item group bg-white/[0.03] hover:bg-white/[0.08] rounded-2xl p-3 flex items-center border border-transparent hover:border-white/5"
  >
    <!-- 封面图片 -->
    <div class="w-14 h-14 rounded-xl overflow-hidden mr-4 flex-shrink-0 relative shadow-lg group-hover:shadow-indigo-500/10">
      <img
        :src="playlist.cover"
        :alt="playlist.title"
        class="w-full h-full object-cover group-hover:scale-105"
        @error="handleImageError"
      >
      <!-- 歌单类型指示器 -->
      <div class="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-tl-lg backdrop-blur-sm">
        <i class="fa-solid fa-list-ul" />
      </div>
    </div>

    <!-- 歌单信息 -->
    <div class="flex-1 min-w-0 mr-3">
      <p class="text-sm font-medium truncate mb-1 text-white group-hover:text-indigo-300">
        {{ playlist.title }}
      </p>
      <p class="text-xs text-white/50 truncate">
        {{ playlist.creator || '未知创建者' }}
      </p>
      <div class="flex items-center mt-1.5 gap-2">
        <span class="text-xs text-white/40 flex items-center gap-1">
          <i class="fa-solid fa-music text-[10px]" />
          {{ playlist.songCount || 0 }} 首
        </span>
        <span v-if="playlist.playCount" class="text-white/20">•</span>
        <span
          v-if="playlist.playCount"
          class="text-xs text-white/40 flex items-center gap-1"
        >
          <i class="fa-solid fa-play text-[10px]" />
          {{ formatPlayCount(playlist.playCount) }}
        </span>
      </div>
    </div>

    <!-- 操作按钮区域 -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <!-- 自定义操作按钮插槽 -->
      <slot name="actions" :playlist="playlist">
        <!-- 默认的查看按钮 -->
        <button
          class="search-btn w-9 h-9 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white flex items-center justify-center"
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
