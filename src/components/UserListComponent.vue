<template>
  <!-- 桌面端用户列表 -->
  <div v-if="isDesktop" class="mt-auto">
    <div class="flex flex-col">
      <div class="p-3 border-b border-white/10">
        <h2 class="text-lg font-semibold flex items-center justify-between">
          <div class="flex items-center">
            <i class="fa-solid fa-users mr-2 text-primary" />在线用户
            <span class="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              {{ onlineUsers.length }}
            </span>
          </div>
          <button
            class="text-gray-400 hover:text-white transition-all duration-200 p-1 rounded"
            title="刷新用户列表"
            @click="refreshOnlineUsers"
          >
            <i class="fa-solid fa-refresh text-sm" />
          </button>
        </h2>
      </div>
      <div class="users-list overflow-y-auto p-2 scrollbar-hide space-y-2 h-48">
        <div
          v-for="user in onlineUsers"
          :key="user.name"
          class="flex items-center p-2 hover:bg-white/5 rounded-lg"
        >
          <div class="w-8 h-8 overflow-hidden relative mr-3">
            <img :src="user.avatar" :alt="user.name" class="w-full h-full rounded-full object-cover">
            <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark" />
          </div>
          <span class="text-sm">{{ user.name }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- 移动端用户列表模态框 -->
  <transition v-else name="modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('close')" />
      <div
        class="relative bg-dark border-t border-white/20 md:rounded-xl w-full max-w-4xl h-[85vh] md:max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div class="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 class="text-lg font-semibold flex items-center">
            <i class="fa-solid fa-users mr-2 text-primary" />在线用户
            <span class="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
              {{ onlineUsers.length }}
            </span>
          </h2>

          <div class="flex items-center space-x-2">
            <button
              class="text-gray-400 hover:text-white transition-all duration-200 p-2 rounded-full touch-target"
              title="刷新用户列表"
              @click="refreshOnlineUsers"
            >
              <i class="fa-solid fa-refresh text-base" />
            </button>
            <button
              class="text-gray-400 hover:text-white transition-colors touch-target"
              @click="$emit('close')"
            >
              <i class="fa-solid fa-times text-lg" />
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-3 smooth-scroll modal-scroll">
          <div class="space-y-2">
            <div
              v-for="user in onlineUsers"
              :key="user.name"
              class="flex items-center p-3 hover:bg-white/5 rounded-lg active:bg-white/10 transition-all cursor-pointer touch-feedback"
            >
              <div class="w-10 h-10 overflow-hidden relative mr-3 flex-shrink-0">
                <img :src="user.avatar" :alt="user.name" class="w-full h-full rounded-full object-cover">
                <div class="absolute bottom-0 right-0 w-3 h-3 z-100 bg-green-500 rounded-full border-2 border-dark" />
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-sm font-medium truncate block">{{ user.name }}</span>
                <span class="text-xs text-gray-400">在线</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useChat } from '@/composables/useChat'

interface Props {
  isDesktop?: boolean
  show?: boolean
}

withDefaults(defineProps<Props>(), {
  isDesktop: false,
  show: false,
})

defineEmits<{
  close: []
}>()

// 直接使用 useChat 获取在线用户数据和刷新方法
const { onlineUsers, refreshOnlineUsers } = useChat()
</script>

<style scoped>
/* 滚动条样式 */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* 触摸反馈 */
.touch-feedback:active {
  transform: scale(0.98);
}

.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* 平滑滚动 */
.smooth-scroll {
  scroll-behavior: smooth;
}

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
