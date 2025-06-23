<template>
  <transition name="toast">
    <div v-if="show" class="relative pointer-events-auto">
      <div :class="[
        'px-4 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm flex items-center',
        toastTypeClasses
      ]">
        <i v-if="icon" :class="icon" class="mr-2"></i>
        {{ message }}
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface NotificationProps {
  show: boolean
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  icon?: string
}

// 定义 props
const props = withDefaults(defineProps<NotificationProps>(), {
  type: 'info'
})

// 根据类型计算样式类
const toastTypeClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-500/90 text-white'
    case 'error':
      return 'bg-red-500/90 text-white'
    case 'warning':
      return 'bg-yellow-500/90 text-white'
    case 'info':
    default:
      return 'bg-blue-500/90 text-white'
  }
})
</script>

<style scoped>
/* 吐司动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
