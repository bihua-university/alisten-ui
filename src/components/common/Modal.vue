<template>
  <!-- 外层过渡 - 整个模态框容器 -->
  <Transition
    name="modal"
    appear
  >
    <div class="fixed inset-0 flex items-center justify-center" :style="{ zIndex }">
      <!-- 背景层 - 透明遮罩（仅用于捕获点击事件） -->
      <Transition
        v-if="enableBackdropTransition"
        name="modal-backdrop"
        appear
      >
        <div
          class="absolute inset-0 bg-transparent"
          @click="handleBackdropClick"
        />
      </Transition>

      <!-- 模态框内容过渡 -->
      <Transition
        name="modal-content"
        appear
      >
        <div
          class="relative w-full mx-4 overflow-hidden flex flex-col modal-container"
          :class="[
            modalSizeClass,
          ]"
        >
          <!-- 背景层 -->
          <div class="absolute inset-0 modal-bg rounded-3xl" />

          <!-- 装饰性光晕 -->
          <div v-if="shouldShowEffects" class="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />
          <div v-if="shouldShowEffects" class="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />

          <!-- 固定头部 -->
          <div v-if="showHeader" class="flex-shrink-0 px-6 pt-6 pb-4 relative z-10">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-3">
                <div
                  v-if="headerIcon"
                  class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"
                  :class="headerIconBgClass"
                >
                  <i
                    class="text-lg" :class="[
                      headerIcon,
                      headerIconColorClass,
                    ]"
                  />
                </div>
                <div>
                  <h2 class="text-lg font-semibold text-white">
                    {{ title }}
                  </h2>
                  <p v-if="subtitle" class="text-sm text-white/40 mt-0.5">
                    {{ subtitle }}
                  </p>
                </div>
              </div>
              <button
                v-if="allowBackdropClose"
                class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all duration-200"
                @click="$emit('close')"
              >
                <i class="fa-solid fa-times text-sm" />
              </button>
            </div>
          </div>

          <!-- 可滚动内容区域 -->
          <div class="flex-1 overflow-y-auto scrollable-content relative z-10">
            <div class="px-6 pb-6">
              <slot />
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePerformance } from '@/composables/usePerformance'

interface Props {
  title?: string
  subtitle?: string
  headerIcon?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  theme?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  zIndex?: number
  showHeader?: boolean
  allowBackdropClose?: boolean
  decorationVariant?: 'default' | 'create' | 'confirm'
  enableBackdropTransition?: boolean
}

interface Emits {
  close: []
  backdropClick: []
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  theme: 'primary',
  zIndex: 100,
  showHeader: true,
  allowBackdropClose: true,
  decorationVariant: 'default',
  enableBackdropTransition: true,
})

const emit = defineEmits<Emits>()

// 使用性能配置
const { performanceLevel } = usePerformance()

// 性能等级计算
const isMediumPerformance = computed(() => performanceLevel.value === 'medium')
const isHighPerformance = computed(() => performanceLevel.value === 'high')
const shouldShowEffects = computed(() => isHighPerformance.value || isMediumPerformance.value)

const modalSizeClass = computed(() => {
  const sizeMap = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  }
  return sizeMap[props.size]
})

// 主题相关样式
const themeConfig = computed(() => {
  const themes = {
    primary: {
      headerIconBg: 'bg-purple-500/10',
      headerColor: 'text-purple-400',
    },
    success: {
      headerIconBg: 'bg-green-500/10',
      headerColor: 'text-green-400',
    },
    warning: {
      headerIconBg: 'bg-amber-500/10',
      headerColor: 'text-amber-400',
    },
    danger: {
      headerIconBg: 'bg-red-500/10',
      headerColor: 'text-red-400',
    },
    info: {
      headerIconBg: 'bg-blue-500/10',
      headerColor: 'text-blue-400',
    },
  }
  return themes[props.theme]
})

// 装饰配置
const decorationConfig = computed(() => {
  const configs = {
    default: themeConfig.value,
    create: {
      ...themeConfig.value,
      headerIconBg: 'bg-green-500/10',
      headerColor: 'text-green-400',
    },
    confirm: {
      ...themeConfig.value,
      headerIconBg: 'bg-purple-500/10',
      headerColor: 'text-purple-400',
    },
  }
  return configs[props.decorationVariant]
})

// 头部图标样式
const headerIconBgClass = computed(() => decorationConfig.value.headerIconBg)
const headerIconColorClass = computed(() => decorationConfig.value.headerColor)

// 事件处理
function handleBackdropClick() {
  emit('backdropClick')
  if (props.allowBackdropClose) {
    emit('close')
  }
}
</script>

<style scoped>
/* 不透明背景 */
.modal-bg {
  background: #1a1a1f;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
}

/* 模态框容器 */
.modal-container {
  border-radius: 24px;
  max-height: 80vh;
}

/* 模态框整体过渡 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}

/* 背景层过渡 */
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

.modal-backdrop-enter-to,
.modal-backdrop-leave-from {
  opacity: 1;
}

/* 模态框内容过渡 */
.modal-content-enter-active,
.modal-content-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(30px);
}

.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.modal-content-enter-to,
.modal-content-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* 高性能模式下的额外动画效果 */
@media (prefers-reduced-motion: no-preference) {
  .modal-content-enter-active {
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

/* 低性能模式下的简化动画 */
@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active,
  .modal-backdrop-enter-active,
  .modal-backdrop-leave-active,
  .modal-content-enter-active,
  .modal-content-leave-active {
    transition: opacity 0.2s ease;
  }

  .modal-content-enter-from,
  .modal-content-leave-to {
    transform: none;
  }
}

/* 响应式调整 */
@media (max-width: 640px) {
  .modal-container {
    margin-left: 16px;
    margin-right: 16px;
    max-height: 85vh;
  }

  .modal-content-enter-from {
    transform: scale(0.95) translateY(20px);
  }
}

/* 滚动条样式 - 隐藏 */
.scrollable-content {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scrollable-content::-webkit-scrollbar {
  display: none;
}
</style>
