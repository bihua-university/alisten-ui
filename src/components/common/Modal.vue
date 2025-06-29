<template>
  <!-- 外层过渡 - 整个模态框容器 -->
  <Transition
    name="modal"
    appear
  >
    <div class="fixed inset-0 flex items-center justify-center" :style="{ zIndex }">
      <!-- 背景层过渡 -->
      <Transition
        v-if="enableBackdropTransition"
        name="modal-backdrop"
        appear
      >
        <div
          class="absolute inset-0 bg-black/60"
          @click="handleBackdropClick"
        />
      </Transition>

      <!-- 模态框内容过渡 -->
      <Transition
        name="modal-content"
        appear
      >
        <div
          class="relative bg-dark border border-white/20 rounded-2xl w-full mx-4 overflow-hidden"
          :class="[
            modalSizeClass,
            shadowClass,
          ]"
        >
          <!-- 内容区域 -->
          <div class="p-6 relative">
            <div class="relative z-10">
              <!-- 头部图标和标题 -->
              <div v-if="showHeader" class="text-center mb-6">
                <div
                  v-if="headerIcon"
                  class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  :class="[
                    headerIconBgClass,
                    headerIconShadowClass,
                  ]"
                >
                  <i
                    class="text-2xl"
                    :class="[
                      headerIcon,
                      headerIconColorClass,
                      shouldShowHeaderAnimation ? 'animate-pulse' : '',
                    ]"
                  />
                </div>
                <h2 v-if="title" class="text-xl font-semibold mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  {{ title }}
                </h2>
                <p v-if="subtitle" class="text-sm text-gray-400">
                  {{ subtitle }}
                </p>
              </div>

              <!-- 插槽内容 -->
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

// 动画和效果控制
const shouldShowHeaderAnimation = computed(() => isHighPerformance.value)

const modalSizeClass = computed(() => {
  const sizeMap = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  }
  return sizeMap[props.size]
})

const shadowClass = computed(() => {
  if (isHighPerformance.value) {
    return 'shadow-2xl backdrop-blur-xl'
  }
  if (isMediumPerformance.value) {
    return 'shadow-xl backdrop-blur-md'
  }
  return ''
})

// 主题相关样式
const themeConfig = computed(() => {
  const themes = {
    primary: {
      gradient: 'bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/10',
      headerBg: 'bg-gradient-to-br from-primary/30 to-primary/10',
      headerColor: 'text-primary',
      circles: [
        { class: 'w-40 h-40 bg-primary/20', position: { top: '-5rem', left: '-5rem' }, delay: '0s' },
        { class: 'w-64 h-64 bg-purple-500/15', position: { top: '33%', right: '-8rem' }, delay: '1s' },
        { class: 'w-32 h-32 bg-pink-500/20', position: { bottom: '-4rem', left: '25%' }, delay: '2s' },
      ],
      icons: [
        { iconClass: 'fa-solid fa-music', class: 'text-primary/10 text-6xl', position: { top: '5rem', left: '25%' }, delay: '0s' },
        { iconClass: 'fa-solid fa-headphones', class: 'text-purple-400/10 text-4xl', position: { bottom: '8rem', right: '25%' }, delay: '1.5s' },
        { iconClass: 'fa-solid fa-heart', class: 'text-pink-400/10 text-5xl', position: { top: '50%', left: '2.5rem' }, delay: '0.8s' },
      ],
    },
    success: {
      gradient: 'bg-gradient-to-br from-green-500/15 via-blue-500/8 to-purple-500/15',
      headerBg: 'bg-gradient-to-br from-green-500/40 to-green-500/15',
      headerColor: 'text-green-400',
      circles: [
        { class: 'w-32 h-32 bg-green-500/25', position: { top: '-2.5rem', left: '-2.5rem' }, delay: '0s' },
        { class: 'w-48 h-48 bg-blue-500/20', position: { top: '25%', right: '-4rem' }, delay: '1s' },
        { class: 'w-24 h-24 bg-purple-500/25', position: { bottom: '-2rem', left: '33%' }, delay: '2s' },
      ],
      icons: [],
    },
    warning: {
      gradient: 'bg-gradient-to-br from-yellow-500/15 via-orange-500/8 to-red-500/15',
      headerBg: 'bg-gradient-to-br from-yellow-500/40 to-yellow-500/15',
      headerColor: 'text-yellow-400',
      circles: [
        { class: 'w-32 h-32 bg-yellow-500/25', position: { top: '-2.5rem', left: '-2.5rem' }, delay: '0s' },
        { class: 'w-48 h-48 bg-orange-500/20', position: { top: '25%', right: '-4rem' }, delay: '1s' },
        { class: 'w-24 h-24 bg-red-500/25', position: { bottom: '-2rem', left: '33%' }, delay: '2s' },
      ],
      icons: [],
    },
    danger: {
      gradient: 'bg-gradient-to-br from-red-500/15 via-pink-500/8 to-purple-500/15',
      headerBg: 'bg-gradient-to-br from-red-500/40 to-red-500/15',
      headerColor: 'text-red-400',
      circles: [
        { class: 'w-32 h-32 bg-red-500/25', position: { top: '-2.5rem', left: '-2.5rem' }, delay: '0s' },
        { class: 'w-48 h-48 bg-pink-500/20', position: { top: '25%', right: '-4rem' }, delay: '1s' },
        { class: 'w-24 h-24 bg-purple-500/25', position: { bottom: '-2rem', left: '33%' }, delay: '2s' },
      ],
      icons: [],
    },
    info: {
      gradient: 'bg-gradient-to-br from-blue-500/15 via-cyan-500/8 to-teal-500/15',
      headerBg: 'bg-gradient-to-br from-blue-500/40 to-blue-500/15',
      headerColor: 'text-blue-400',
      circles: [
        { class: 'w-32 h-32 bg-blue-500/25', position: { top: '-2.5rem', left: '-2.5rem' }, delay: '0s' },
        { class: 'w-48 h-48 bg-cyan-500/20', position: { top: '25%', right: '-4rem' }, delay: '1s' },
        { class: 'w-24 h-24 bg-teal-500/25', position: { bottom: '-2rem', left: '33%' }, delay: '2s' },
      ],
      icons: [],
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
      gradient: 'bg-gradient-to-br from-green-500/15 via-blue-500/8 to-purple-500/15',
    },
    confirm: {
      ...themeConfig.value,
      gradient: 'bg-gradient-to-br from-primary/15 via-purple-500/8 to-pink-500/15',
    },
  }
  return configs[props.decorationVariant]
})

// 头部图标样式
const headerIconBgClass = computed(() => {
  return decorationConfig.value.headerBg
})

const headerIconShadowClass = computed(() => {
  return ''
})

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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
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
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .modal-content-enter-from {
    transform: scale(0.8) translateY(-30px) rotateX(10deg);
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
  .modal-content-enter-from {
    transform: scale(0.95) translateY(-10px);
  }

  .modal-content-leave-to {
    transform: scale(0.98) translateY(5px);
  }
}
</style>
