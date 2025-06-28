<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center">
    <!-- 背景层 -->
    <div class="absolute inset-0 bg-black/80 backdrop-blur-md" @click="$emit('close')" />

    <!-- 设置面板 -->
    <div class="relative bg-dark/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-white/10">
      <!-- 头部 -->
      <div class="flex items-center justify-between p-6 border-b border-white/10">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <i class="fa-solid fa-bolt text-green-400 text-lg" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-white">
              性能设置
            </h2>
            <p class="text-sm text-gray-400">
              优化GPU使用和性能
            </p>
          </div>
        </div>
        <button
          class="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
          @click="$emit('close')"
        >
          <i class="fa-solid fa-times text-gray-400" />
        </button>
      </div>

      <!-- 设备信息 -->
      <div v-if="deviceInfo.isLowEndDevice" class="p-6 bg-amber-500/10 border-b border-white/10">
        <div class="flex items-start space-x-3">
          <i class="fa-solid fa-exclamation-triangle text-amber-400 mt-1" />
          <div>
            <h3 class="text-amber-200 font-medium mb-1">
              检测到低性能设备
            </h3>
            <p class="text-sm text-amber-300/80">
              建议启用低功耗模式以获得更好的体验
            </p>
          </div>
        </div>
      </div>

      <!-- 设置选项 -->
      <div class="p-6 space-y-6">
        <!-- 低功耗模式总开关 -->
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h3 class="text-white font-medium mb-1">
              低功耗模式
            </h3>
            <p class="text-sm text-gray-400">
              一键优化所有性能设置
            </p>
          </div>
          <button
            class="relative w-12 h-6 rounded-full transition-colors duration-200"
            :class="performanceConfig.lowPowerMode ? 'bg-green-500' : 'bg-gray-600'"
            @click="toggleLowPowerMode"
          >
            <div
              class="w-5 h-5 bg-white rounded-full transition-transform duration-200 absolute top-0.5"
              :class="performanceConfig.lowPowerMode ? 'translate-x-6' : 'translate-x-0.5'"
            />
          </button>
        </div>

        <!-- 详细设置 -->
        <div class="space-y-4 border-t border-white/10 pt-6">
          <h4 class="text-sm font-medium text-gray-300 uppercase tracking-wider">
            详细设置
          </h4>

          <!-- 减少动画 -->
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h4 class="text-white text-sm font-medium">
                减少动画
              </h4>
              <p class="text-xs text-gray-400">
                降低动画复杂度和持续时间
              </p>
            </div>
            <button
              class="relative w-10 h-5 rounded-full transition-colors duration-200"
              :class="performanceConfig.reduceAnimations ? 'bg-green-500' : 'bg-gray-600'"
              @click="performanceConfig.reduceAnimations = !performanceConfig.reduceAnimations"
            >
              <div
                class="w-4 h-4 bg-white rounded-full transition-transform duration-200 absolute top-0.5"
                :class="performanceConfig.reduceAnimations ? 'translate-x-5' : 'translate-x-0.5'"
              />
            </button>
          </div>

          <!-- 禁用背景模糊 -->
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h4 class="text-white text-sm font-medium">
                禁用背景模糊
              </h4>
              <p class="text-xs text-gray-400">
                关闭消耗GPU的模糊效果
              </p>
            </div>
            <button
              class="relative w-10 h-5 rounded-full transition-colors duration-200"
              :class="performanceConfig.disableBackgroundBlur ? 'bg-green-500' : 'bg-gray-600'"
              @click="performanceConfig.disableBackgroundBlur = !performanceConfig.disableBackgroundBlur"
            >
              <div
                class="w-4 h-4 bg-white rounded-full transition-transform duration-200 absolute top-0.5"
                :class="performanceConfig.disableBackgroundBlur ? 'translate-x-5' : 'translate-x-0.5'"
              />
            </button>
          </div>

          <!-- 简化特效 -->
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h4 class="text-white text-sm font-medium">
                简化特效
              </h4>
              <p class="text-xs text-gray-400">
                减少阴影和渐变效果
              </p>
            </div>
            <button
              class="relative w-10 h-5 rounded-full transition-colors duration-200"
              :class="performanceConfig.simplifyEffects ? 'bg-green-500' : 'bg-gray-600'"
              @click="performanceConfig.simplifyEffects = !performanceConfig.simplifyEffects"
            >
              <div
                class="w-4 h-4 bg-white rounded-full transition-transform duration-200 absolute top-0.5"
                :class="performanceConfig.simplifyEffects ? 'translate-x-5' : 'translate-x-0.5'"
              />
            </button>
          </div>

          <!-- 降低刷新率 -->
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h4 class="text-white text-sm font-medium">
                降低刷新率
              </h4>
              <p class="text-xs text-gray-400">
                限制动画刷新率到30fps
              </p>
            </div>
            <button
              class="relative w-10 h-5 rounded-full transition-colors duration-200"
              :class="performanceConfig.reducedRefreshRate ? 'bg-green-500' : 'bg-gray-600'"
              @click="performanceConfig.reducedRefreshRate = !performanceConfig.reducedRefreshRate"
            >
              <div
                class="w-4 h-4 bg-white rounded-full transition-transform duration-200 absolute top-0.5"
                :class="performanceConfig.reducedRefreshRate ? 'translate-x-5' : 'translate-x-0.5'"
              />
            </button>
          </div>

          <!-- 禁用粒子效果 -->
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h4 class="text-white text-sm font-medium">
                禁用粒子效果
              </h4>
              <p class="text-xs text-gray-400">
                关闭装饰性动画效果
              </p>
            </div>
            <button
              class="relative w-10 h-5 rounded-full transition-colors duration-200"
              :class="performanceConfig.disableParticles ? 'bg-green-500' : 'bg-gray-600'"
              @click="performanceConfig.disableParticles = !performanceConfig.disableParticles"
            >
              <div
                class="w-4 h-4 bg-white rounded-full transition-transform duration-200 absolute top-0.5"
                :class="performanceConfig.disableParticles ? 'translate-x-5' : 'translate-x-0.5'"
              />
            </button>
          </div>
        </div>

        <!-- 预设按钮 -->
        <div class="flex space-x-3 pt-4 border-t border-white/10">
          <button
            class="flex-1 py-2 px-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg transition-colors text-sm"
            @click="applyPreset('balanced')"
          >
            均衡模式
          </button>
          <button
            class="flex-1 py-2 px-4 bg-green-500/20 hover:bg-green-500/30 text-green-200 rounded-lg transition-colors text-sm"
            @click="applyPreset('performance')"
          >
            性能优先
          </button>
          <button
            class="flex-1 py-2 px-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg transition-colors text-sm"
            @click="applyPreset('quality')"
          >
            质量优先
          </button>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="p-4 bg-white/5 rounded-b-2xl">
        <p class="text-xs text-gray-400 text-center">
          设置会自动保存，重启应用后生效
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePerformance } from '@/composables/usePerformance'

interface Props {
  show: boolean
}

defineProps<Props>()

defineEmits<{
  close: []
}>()

const {
  performanceConfig,
  deviceInfo,
  toggleLowPowerMode,
} = usePerformance()

// 应用预设配置
function applyPreset(preset: 'balanced' | 'performance' | 'quality') {
  switch (preset) {
    case 'performance':
      performanceConfig.lowPowerMode = true
      performanceConfig.reduceAnimations = true
      performanceConfig.disableBackgroundBlur = true
      performanceConfig.reducedRefreshRate = true
      performanceConfig.simplifyEffects = true
      performanceConfig.disableParticles = true
      break
    case 'balanced':
      performanceConfig.lowPowerMode = false
      performanceConfig.reduceAnimations = false
      performanceConfig.disableBackgroundBlur = true
      performanceConfig.reducedRefreshRate = false
      performanceConfig.simplifyEffects = true
      performanceConfig.disableParticles = false
      break
    case 'quality':
      performanceConfig.lowPowerMode = false
      performanceConfig.reduceAnimations = false
      performanceConfig.disableBackgroundBlur = false
      performanceConfig.reducedRefreshRate = false
      performanceConfig.simplifyEffects = false
      performanceConfig.disableParticles = false
      break
  }
}
</script>

<style scoped>
/* 模态框动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
