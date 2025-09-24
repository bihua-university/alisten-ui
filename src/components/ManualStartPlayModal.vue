<template>
  <Modal
    v-if="show"
    title="需要手动开始播放"
    subtitle="由于浏览器的自动播放政策限制，请点击播放按钮开始音频播放"
    size="sm"
    theme="primary"
    :allow-backdrop-close="false"
    @close="$emit('close')"
  >
    <!-- 播放按钮 -->
    <div class="flex flex-col items-center space-y-6">
      <!-- 圆形播放按钮 -->
      <button
        class="w-20 h-20 bg-primary hover:bg-blue-600 active:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
        @click="handleStartPlay"
      >
        <i class="fa-solid fa-play text-white text-2xl ml-1" />
      </button>

      <!-- 政策链接 -->
      <div class="flex flex-col space-y-2 text-center">
        <a
          href="https://developer.chrome.com/blog/web-audio-autoplay?hl=zh-cn"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-gray-400 hover:text-gray-300 transition-colors underline decoration-dotted underline-offset-2"
        >
          Chrome 自动播放政策
        </a>
        <a
          href="https://support.mozilla.org/zh-CN/kb/Firefox%E7%9A%84%E5%AA%92%E4%BD%93%E8%87%AA%E5%8A%A8%E6%92%AD%E6%94%BE%E8%AE%BE%E7%BD%AE"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-gray-400 hover:text-gray-300 transition-colors underline decoration-dotted underline-offset-2"
        >
          Firefox 自动播放政策
        </a>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/common/Modal.vue'

interface Props {
  show: boolean
}

interface Emits {
  close: []
  startPlay: []
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function handleStartPlay() {
  emit('startPlay')
}
</script>
