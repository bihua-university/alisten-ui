<template>
  <Modal
    v-if="showUpdateModal"
    size="sm"
    theme="primary"
    title="应用更新"
    header-icon="fa-solid fa-sync"
    :z-index="150"
    :show-header="true"
    :allow-backdrop-close="!isUpdating"
    @close="dismissUpdate"
  >
    <div class="space-y-6">
      <!-- 更新内容描述 -->
      <div class="flex items-start">
        <div class="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
          <img src="/icon-32x32.png" alt="logo" class="w-8 h-8 rounded">
        </div>
        <div>
          <h3 class="text-lg font-medium text-white mb-2">
            发现新版本
          </h3>
          <p class="text-gray-300 text-sm leading-relaxed">
            新版本包含功能优化和性能提升，建议立即更新以获得最佳使用体验。
          </p>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex space-x-3">
        <button
          :disabled="isUpdating"
          class="flex-1 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
          @click="updateApp"
        >
          <span v-if="!isUpdating" class="flex items-center">
            <i class="fa-solid fa-download mr-2" />
            立即更新
          </span>
          <span v-else class="flex items-center">
            <i class="fa-solid fa-spinner fa-spin mr-2" />
            更新中...
          </span>
        </button>

        <button
          :disabled="isUpdating"
          class="flex-1 bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-gray-300 disabled:text-gray-500 px-4 py-3 rounded-lg font-medium transition-all duration-200"
          @click="dismissUpdate"
        >
          稍后提醒
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Modal from './common/Modal.vue'

defineProps<{
  showUpdateModal: boolean
}>()

const emit = defineEmits<{
  updateApp: []
  dismissUpdate: []
}>()

const isUpdating = ref(false)

function updateApp() {
  isUpdating.value = true
  emit('updateApp')
}

function dismissUpdate() {
  emit('dismissUpdate')
}
</script>

<style scoped>
/* 触摸目标样式 */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
