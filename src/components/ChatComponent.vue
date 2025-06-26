<template>
  <div class="chat-component flex flex-col h-full">
    <!-- 聊天标题 -->
    <div class="p-4 border-b border-white/10 flex justify-between items-center">
      <h2 class="text-lg font-semibold flex items-center">
        <i class="fa-solid fa-comments mr-2 text-primary" />聊天
      </h2>
      <button
        v-if="showCloseButton"
        class="text-gray-400 hover:text-white transition-colors touch-target"
        @click="$emit('close')"
      >
        <i class="fa-solid fa-times text-lg" />
      </button>
    </div>

    <!-- 聊天消息区域 -->
    <div
      ref="chatContainer"
      class="flex-1 overflow-y-auto p-3 space-y-3 smooth-scroll scrollbar-hide"
      :class="[isDesktop ? 'space-y-4' : 'mobile-chat-scroll']"
    >
      <div
        v-for="message in chatMessages"
        :key="message.timestamp"
        class="flex items-start"
        :class="[isDesktop ? '' : 'space-x-3']"
      >
        <div class="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
          <img :src="message.user.avatar" :alt="message.user.name" class="w-full h-full object-cover">
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2 mb-1">
            <span class="font-medium text-sm truncate">{{ message.user.name }}</span>
            <span class="text-xs text-gray-400 flex-shrink-0">{{ formatTimeHH_MM(message.timestamp) }}</span>
          </div>
          <p class="text-sm break-words leading-relaxed" :class="[isDesktop ? 'mt-1' : '']">
            {{ message.content }}
          </p>
        </div>
      </div>
    </div>

    <!-- 消息输入区域 -->
    <div class="p-3 border-t border-white/10 mt-auto">
      <div class="relative">
        <input
          v-model="messageInput"
          type="text"
          placeholder="发送消息..."
          class="w-full bg-white/10 rounded-full py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400"
          :class="[isDesktop ? 'py-2' : '']"
          maxlength="200"
          @keyup.enter="handleSendMessage"
        >
        <button
          :disabled="!messageInput.trim()"
          class="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all touch-target"
          :class="[messageInput.trim() ? 'text-primary hover:bg-primary/20 active:bg-primary/30' : 'text-gray-500']"
          @click="handleSendMessage"
        >
          <i class="fa-solid fa-paper-plane" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useChat } from '@/composables/useChat'
import { formatTimeHH_MM } from '@/utils/time'

interface Props {
  isDesktop?: boolean
  showCloseButton?: boolean
}

withDefaults(defineProps<Props>(), {
  isDesktop: false,
  showCloseButton: false,
})

defineEmits<{
  close: []
}>()

// 直接使用 useChat 获取聊天数据和方法
const { chatMessages, sendMessage } = useChat()

const messageInput = ref('')
const chatContainer = ref<HTMLElement>()

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

// 监听消息数量变化，自动滚动到底部
watch(
  () => chatMessages.value.length,
  () => {
    scrollToBottom()
  },
)

// 组件挂载后滚动到底部
onMounted(() => {
  scrollToBottom()
})

// 发送消息
function handleSendMessage() {
  if (messageInput.value.trim()) {
    sendMessage(messageInput.value.trim())
    messageInput.value = ''
  }
}
</script>

<style scoped>
.chat-component {
  height: 100%;
}

.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.smooth-scroll {
  scroll-behavior: smooth;
}

.mobile-chat-scroll {
  /* 移动端特殊滚动样式，具体样式可根据需要添加 */
  overscroll-behavior: contain;
}

.touch-target {
  min-height: 44px;
  min-width: 44px;
}
</style>
