<template>
  <div
    class="p-3 sm:p-4 border-b border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-center glass-effect bg-dark/70 backdrop-blur-xl space-y-2 sm:space-y-0"
  >
    <!-- 左侧房间信息 -->
    <div class="flex-1 min-w-0">
      <h2 class="text-base sm:text-lg font-semibold truncate flex items-center">
        {{ roomInfo.name }}
        <!-- 连接状态指示器 -->
        <div class="ml-2 flex items-center">
          <div
            class="w-2 h-2 rounded-full transition-all duration-300"
            :class="[
              connectionStatus === 'connected' ? 'bg-green-500'
              : connectionStatus === 'connecting' || connectionStatus === 'reconnecting' ? 'bg-yellow-500 animate-pulse'
                : connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-500',
            ]"
            :title="getConnectionStatusText()"
          />
        </div>
      </h2>
      <p class="text-xs text-gray-400 truncate">
        {{ onlineUsers.length }}人在线
      </p>
    </div>

    <!-- 右侧按钮组 -->
    <div class="flex items-center space-x-2 sm:space-x-2 flex-shrink-0">
      <!-- 切歌 -->
      <button
        :disabled="isSkipping"
        class="bg-orange-500/20 hover:bg-orange-500/30 active:bg-orange-500/40 text-orange-400 rounded-full py-2 px-3 sm:px-4 flex items-center text-xs sm:text-sm transition-all touch-target"
        :class="[{ 'opacity-50 cursor-not-allowed': isSkipping }]"
        @click="handleSkipSong"
      >
        <i class="fa-solid fa-forward mr-1 sm:mr-2" />
        <span class="hidden sm:inline">切歌</span>
        <span class="sm:hidden">切歌</span>
      </button>

      <!-- 点歌台 -->
      <button
        class="bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-full py-2 px-3 sm:px-4 flex items-center text-xs sm:text-sm transition-all touch-target"
        @click="$emit('showMusicSearch')"
      >
        <i class="fa-solid fa-music mr-1 sm:mr-2" />
        <span class="hidden sm:inline">点歌台</span>
        <span class="sm:hidden">点歌</span>
      </button>

      <!-- 分享 -->
      <button
        class="bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 text-blue-400 rounded-full py-2 px-3 sm:px-4 flex items-center text-xs sm:text-sm transition-all touch-target"
        @click="$emit('shareRoom')"
      >
        <i class="fa-solid fa-share mr-1 sm:mr-2" />
        <span class="hidden sm:inline">分享</span>
        <span class="sm:hidden">分享</span>
      </button>

      <!-- 帮助 -->
      <button
        class="bg-green-500/20 hover:bg-green-500/30 active:bg-green-500/40 text-green-400 rounded-full py-2 px-3 sm:px-4 flex items-center text-xs sm:text-sm transition-all touch-target"
        @click="$emit('showHelp')"
      >
        <i class="fa-solid fa-question-circle mr-1 sm:mr-2" />
        <span class="hidden sm:inline">帮助</span>
        <span class="sm:hidden">帮助</span>
      </button>

      <!-- 沉浸模式, 移动端隐藏 -->
      <div class="hidden md:block">
        <button
          class="bg-purple-500/20 hover:bg-purple-500/30 active:bg-purple-500/40 text-purple-400 rounded-full py-2 px-3 sm:px-4 flex items-center text-xs sm:text-sm transition-all touch-target"
          @click="$emit('toggleImmersive')"
        >
          <i
            class="fa-solid fa-eye mr-1 sm:mr-2 hidden md:block"
          />
          <span class="hidden md:block">沉浸模式</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RoomInfo } from '@/types'
import { ref } from 'vue'
import { useChat } from '@/composables/useChat'
import { usePlayer } from '@/composables/usePlayer'

// 定义 props
interface Props {
  roomInfo: RoomInfo
  connectionStatus: string
}

const props = defineProps<Props>()

// 定义 emits
defineEmits<{
  showMusicSearch: []
  shareRoom: []
  showHelp: []
  toggleImmersive: []
}>()

// 使用 useChat 获取在线用户信息
const { onlineUsers } = useChat()

// 使用 usePlayer 获取切歌功能
const { skipSong } = usePlayer()

// 本地切歌状态
const isSkipping = ref(false)

// 处理切歌点击
function handleSkipSong() {
  if (isSkipping.value) {
    return
  }

  isSkipping.value = true
  skipSong()

  // 1秒避免多次点击
  setTimeout(() => {
    isSkipping.value = false
  }, 1000)
}

// 获取连接状态文本描述
function getConnectionStatusText() {
  switch (props.connectionStatus) {
    case 'connected':
      return '已连接到服务器'
    case 'connecting':
      return '正在连接服务器...'
    case 'reconnecting':
      return '正在重新连接...'
    case 'error':
      return '连接错误'
    case 'disconnected':
      return '未连接'
    default:
      return '未知状态'
  }
}
</script>
