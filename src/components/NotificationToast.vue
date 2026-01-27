<template>
  <transition name="toast">
    <div
      v-if="show"
      class="notification-card pointer-events-auto"
      :class="[toastTypeClasses]"
    >
      <!-- Icon -->
      <div class="icon-wrapper">
        <CheckCircle v-if="type === 'success'" :size="24" />
        <XCircle v-else-if="type === 'error'" :size="24" />
        <AlertTriangle v-else-if="type === 'warning'" :size="24" />
        <Info v-else :size="24" />
      </div>

      <!-- Content -->
      <div class="content">
        <div class="title">
          {{ titleText }}
        </div>
        <div class="message">
          {{ message }}
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-bar">
        <div class="progress-fill" :class="progressBarClass" />
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-vue-next'
import { computed } from 'vue'

export interface NotificationProps {
  show: boolean
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  icon?: string
}

// 定义 props
const props = withDefaults(defineProps<NotificationProps>(), {
  type: 'info',
})

// 根据类型计算样式类
const toastTypeClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'notification-success'
    case 'error':
      return 'notification-error'
    case 'warning':
      return 'notification-warning'
    case 'info':
    default:
      return 'notification-info'
  }
})

// 进度条颜色类
const progressBarClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-400'
    case 'error':
      return 'bg-red-400'
    case 'warning':
      return 'bg-yellow-400'
    case 'info':
    default:
      return 'bg-blue-400'
  }
})

// 标题文本
const titleText = computed(() => {
  switch (props.type) {
    case 'success':
      return '成功'
    case 'error':
      return '错误'
    case 'warning':
      return '警告'
    case 'info':
    default:
      return '提示'
  }
})
</script>

<style scoped>
.notification-card {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  background: rgba(30, 30, 35, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.02) inset;
  position: relative;
  overflow: hidden;
}

/* Type-specific styles */
.notification-success {
  border-left: 4px solid rgba(34, 197, 94, 0.8);
}

.notification-success .icon-wrapper {
  color: rgba(34, 197, 94, 1);
}

.notification-error {
  border-left: 4px solid rgba(239, 68, 68, 0.8);
}

.notification-error .icon-wrapper {
  color: rgba(239, 68, 68, 1);
}

.notification-warning {
  border-left: 4px solid rgba(234, 179, 8, 0.8);
}

.notification-warning .icon-wrapper {
  color: rgba(234, 179, 8, 1);
}

.notification-info {
  border-left: 4px solid rgba(59, 130, 246, 0.8);
}

.notification-info .icon-wrapper {
  color: rgba(59, 130, 246, 1);
}

.icon-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
}

.content {
  flex: 1;
  min-width: 0;
  padding-right: 0.5rem;
}

.title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 0.25rem;
}

.message {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  word-wrap: break-word;
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  width: 100%;
  animation: progress-shrink 3s linear forwards;
  transform-origin: left;
}

@keyframes progress-shrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Toast animations */
.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-30px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(50px) scale(0.95);
}
</style>
