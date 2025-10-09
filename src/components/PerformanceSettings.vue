<template>
  <div
    class="performance-settings"
    :class="performanceClasses"
  >
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-white mb-2">
        动画性能设置
      </h3>
      <p class="text-sm text-gray-400 mb-4">
        调整动画质量以优化GPU占用和电量消耗
      </p>
    </div>

    <!-- 性能级别选择 -->
    <div class="space-y-3 mb-4">
      <label class="block text-sm font-medium text-gray-300">性能级别</label>
      <div class="space-y-2">
        <div
          v-for="level in performanceLevels"
          :key="level.value"
          class="performance-option"
          :class="{ active: performanceLevel === level.value }"
          @click="performanceLevel = level.value"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-white">
                {{ level.name }}
              </div>
              <div class="text-sm text-gray-400">
                {{ level.description }}
              </div>
            </div>
            <div class="radio-indicator" :class="{ active: performanceLevel === level.value }">
              <div v-if="performanceLevel === level.value" class="radio-dot" />
            </div>
          </div>
          <div class="performance-impact">
            <div class="impact-bar">
              <div
                class="impact-fill"
                :style="{ width: `${level.gpuUsage}%` }"
                :class="level.impactClass"
              />
            </div>
            <span class="text-xs text-gray-500">GPU占用: {{ level.gpuUsage }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 减少动效选项 -->
    <div class="mb-4">
      <label class="flex items-center space-x-3 cursor-pointer">
        <div class="relative">
          <input
            v-model="reducedMotion"
            type="checkbox"
            class="sr-only"
          >
          <div
            class="custom-checkbox"
            :class="{ checked: reducedMotion }"
          >
            <svg
              v-if="reducedMotion"
              class="check-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
        <div>
          <span class="text-sm font-medium text-gray-300">减少动效</span>
          <p class="text-xs text-gray-500">适合晕动症用户或节能需求</p>
        </div>
      </label>
    </div>

    <!-- 性能信息 -->
    <div class="bg-white/5 border border-white/10 rounded-lg p-3">
      <div class="text-sm text-gray-400 space-y-1">
        <div>当前设置: <span class="text-white">{{ getCurrentDescription() }}</span></div>
        <div v-if="showAdvanced">
          <details class="mt-2">
            <summary class="cursor-pointer text-blue-400 hover:text-blue-300">
              高级信息
            </summary>
            <div class="mt-2 text-xs space-y-1">
              <div>设备内存: {{ getDeviceMemory() }}</div>
              <div>屏幕尺寸: {{ getScreenSize() }}</div>
              <div>减少动效偏好: {{ getPrefersReducedMotion() }}</div>
            </div>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PerformanceLevel } from '@/composables/usePerformance'
import { usePerformance } from '@/composables/usePerformance'

// 显示高级信息的prop
defineProps<{
  showAdvanced?: boolean
}>()

// 使用性能设置
const {
  performanceLevel,
  reducedMotion,
  performanceClasses,
  getPerformanceDescription,
} = usePerformance()

// 性能级别选项
const performanceLevels = [
  {
    value: 'high' as PerformanceLevel,
    name: '高质量',
    description: '所有动画效果，适合高性能设备',
    gpuUsage: 90,
    impactClass: 'bg-red-500',
  },
  {
    value: 'medium' as PerformanceLevel,
    name: '平衡',
    description: '优化过的动画效果，推荐设置',
    gpuUsage: 60,
    impactClass: 'bg-yellow-500',
  },
  {
    value: 'low' as PerformanceLevel,
    name: '省电',
    description: '简化动画效果，适合移动设备',
    gpuUsage: 30,
    impactClass: 'bg-green-500',
  },
  {
    value: 'off' as PerformanceLevel,
    name: '极简',
    description: '禁用所有动画，最低GPU占用',
    gpuUsage: 5,
    impactClass: 'bg-blue-500',
  },
]

// 获取当前设置描述
function getCurrentDescription() {
  return getPerformanceDescription(performanceLevel.value)
}

// 获取设备内存信息
function getDeviceMemory() {
  const memory = (navigator as any).deviceMemory
  return memory ? `${memory}GB` : '未知'
}

// 获取屏幕尺寸
function getScreenSize() {
  return `${window.innerWidth} × ${window.innerHeight}`
}

// 获取用户动效偏好
function getPrefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? '是' : '否'
}
</script>

<style scoped>
.performance-option {
  padding: 0.75rem;
  border: 1px solid var(--color-performance-option-border);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.performance-option:hover {
  border-color: var(--color-performance-option-border-hover);
  background: var(--color-performance-option-bg-hover);
}

.performance-option.active {
  border-color: var(--color-accent-border);
  background: var(--color-gradient-end);
}

.radio-indicator {
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--color-radio-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease;
}

.radio-indicator.active {
  border-color: var(--color-radio-checked);
}

.radio-dot {
  width: 0.5rem;
  height: 0.5rem;
  background: var(--color-radio-checked);
  border-radius: 50%;
}

.performance-impact {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.impact-bar {
  width: 100%;
  height: 0.25rem;
  background: var(--color-performance-impact-bar);
  border-radius: 9999px;
  overflow: hidden;
}

.impact-fill {
  height: 100%;
  transition: width 0.3s ease;
}

/* 自定义checkbox样式 */
.custom-checkbox {
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--color-checkbox-border);
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: transparent;
}

.custom-checkbox:hover {
  border-color: var(--color-checkbox-border-hover);
}

.custom-checkbox.checked {
  background: var(--color-checkbox-checked);
  border-color: var(--color-checkbox-checked);
}

.check-icon {
  width: 0.75rem;
  height: 0.75rem;
  color: white;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.15s ease;
}

.custom-checkbox.checked .check-icon {
  opacity: 1;
  transform: scale(1);
}

/* 隐藏原生checkbox但保持可访问性 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
