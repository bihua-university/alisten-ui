<template>
  <div class="glass rounded-3xl h-full flex flex-col overflow-hidden min-h-[200px]">
    <div class="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
      <h3 class="font-bold flex items-center gap-2 text-sm">
        <ListMusic :size="18" class="text-indigo-400" />
        待播列表
      </h3>
      <span class="text-xs bg-white/10 px-2 py-0.5 rounded-full">{{ playlist.length }} 首</span>
    </div>
    <div class="flex-1 overflow-y-auto space-y-1">
      <PlaylistItem
        v-for="(song, index) in playlist"
        :key="song.id"
        :song="song"
        :index="index"
        :is-current="index === 0"
        :is-desktop="isDesktop"
        :is-mobile="!isDesktop"
        @like="emit('songLike', index, song.title)"
        @delete="emit('songDelete', song.title)"
      />
    </div>
    <div class="p-3 border-t border-white/5 shrink-0">
      <button
        class="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-medium transition-colors shadow-lg shadow-purple-600/20 active:scale-95 transform"
        @click="emit('showMusicSearch')"
      >
        点歌
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Song } from '@/types'
import { ListMusic } from 'lucide-vue-next'
import { computed } from 'vue'
import { usePlayer } from '@/composables/usePlayer'
import { processUser } from '@/utils/user'
import PlaylistItem from './PlaylistItem.vue'

interface Props {
  isDesktop?: boolean
}

withDefaults(defineProps<Props>(), {
  isDesktop: false,
})

const emit = defineEmits<{
  showMusicSearch: []
  songLike: [index: number, title: string]
  songDelete: [songName: string]
}>()

const { playerState } = usePlayer()

const playlist = computed(() => playerState.playlist.map((song: Song) => ({
  ...song,
  requestedBy: song.requestedBy ? processUser(song.requestedBy) : undefined,
})))
</script>

<style scoped>
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.36);
}

/* Hide scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  display: none;
}

.overflow-y-auto {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
