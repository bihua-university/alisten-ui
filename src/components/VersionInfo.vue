<template>
  <div class="version-info">
    <div class="text-xs text-gray-400 space-y-1">
      <div class="flex items-center justify-between">
        <span>版本:</span>
        <span class="font-mono">{{ versionInfo.shortHash }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span>构建时间:</span>
        <span class="font-mono">{{ formatDate(versionInfo.buildTime) }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span>提交时间:</span>
        <span class="font-mono">{{ formatDate(versionInfo.commitDate) }}</span>
      </div>
      <div class="mt-2 pt-2 border-t border-white/10">
        <button
          class="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          @click="copyCommitHash"
        >
          <i class="fa-solid fa-copy mr-1" />
          复制完整提交ID
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 获取版本信息
const versionInfo = computed(() => {
  return __APP_VERSION__
})

// 格式化日期
function formatDate(dateString: string) {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

// 复制提交ID
async function copyCommitHash() {
  try {
    await navigator.clipboard.writeText(versionInfo.value.commitHash)
    // 这里可以添加提示消息
    console.log('提交ID已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
  }
}
</script>

<style scoped>
.version-info {
  @apply text-sm;
}
</style>
