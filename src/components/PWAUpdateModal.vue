<template>
  <transition name="modal">
    <div v-if="showUpdateModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="dismissUpdate" />
      <div
        class="relative bg-dark border border-white/20 rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-2xl"
      >
        <!-- 弹窗头部 -->
        <div class="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 class="text-xl font-semibold flex items-center text-white">
            <i class="fa-solid fa-sync text-primary mr-3" />
            应用更新
          </h2>
          <button
            v-if="!isUpdating"
            class="text-gray-400 hover:text-white transition-colors touch-target"
            @click="dismissUpdate"
          >
            <i class="fa-solid fa-times text-lg" />
          </button>
        </div>

        <!-- 弹窗内容 -->
        <div class="p-6">
          <div class="flex items-start mb-6">
            <div class="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
              <img src="/favicon.ico" alt="logo" class="w-8 h-8 rounded">
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
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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
/* 模态框过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95) translateY(-20px);
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: all 0.3s ease;
}

/* 触摸目标样式 */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
