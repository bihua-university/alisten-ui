<template>
  <div v-if="showInstallBanner" class="fixed bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-40">
    <div class="flex items-start space-x-3">
      <div class="flex-shrink-0">
        <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>

      <div class="flex-1 min-w-0">
        <h4 class="text-sm font-medium text-gray-900">
          安装应用到桌面
        </h4>
        <p class="text-sm text-gray-500 mt-1">
          将壁画音乐厅添加到主屏幕，享受更好的使用体验
        </p>
      </div>

      <div class="flex space-x-2">
        <button
          :disabled="isInstalling"
          class="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200"
          @click="handleInstall"
        >
          <span v-if="!isInstalling">安装</span>
          <span v-else>安装中...</span>
        </button>

        <button
          class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          @click="handleDismiss"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  showInstallBanner: boolean
}>()

const emit = defineEmits<{
  install: []
  dismiss: []
}>()

const isInstalling = ref(false)

function handleInstall() {
  isInstalling.value = true
  emit('install')
  // Reset installing state after a delay
  setTimeout(() => {
    isInstalling.value = false
  }, 2000)
}

function handleDismiss() {
  emit('dismiss')
}
</script>
