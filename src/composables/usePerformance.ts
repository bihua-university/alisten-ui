import { reactive, ref, watch } from 'vue'

// 性能配置
interface PerformanceConfig {
  // 低功耗模式
  lowPowerMode: boolean
  // 减少动画
  reduceAnimations: boolean
  // 禁用背景模糊
  disableBackgroundBlur: boolean
  // 降低刷新率
  reducedRefreshRate: boolean
  // 简化特效
  simplifyEffects: boolean
  // 禁用粒子效果
  disableParticles: boolean
}

// 默认性能配置
const defaultConfig: PerformanceConfig = {
  lowPowerMode: false,
  reduceAnimations: false,
  disableBackgroundBlur: false,
  reducedRefreshRate: false,
  simplifyEffects: false,
  disableParticles: false,
}

// 从本地存储加载配置
function loadPerformanceConfig(): PerformanceConfig {
  try {
    const stored = localStorage.getItem('alisten-performance-config')
    if (stored) {
      const config = JSON.parse(stored)
      return { ...defaultConfig, ...config }
    }
  } catch (error) {
    console.warn('Failed to load performance config:', error)
  }
  return { ...defaultConfig }
}

// 保存配置到本地存储
function savePerformanceConfig(config: PerformanceConfig) {
  try {
    localStorage.setItem('alisten-performance-config', JSON.stringify(config))
  } catch (error) {
    console.warn('Failed to save performance config:', error)
  }
}

// 全局性能配置状态
const performanceConfig = reactive<PerformanceConfig>(loadPerformanceConfig())

// 是否支持低功耗模式检测
const supportsLowPowerMode = ref(true)

// 检测设备性能
function detectDevicePerformance() {
  // 检测是否为移动设备
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // 检测内存限制
  const memoryInfo = (navigator as any).deviceMemory
  const hasLowMemory = memoryInfo && memoryInfo < 4

  // 检测硬件并发数
  const hasLowConcurrency = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4

  // 检测是否为低端设备
  const isLowEndDevice = isMobile || hasLowMemory || hasLowConcurrency

  return {
    isMobile,
    hasLowMemory,
    hasLowConcurrency,
    isLowEndDevice,
    shouldRecommendLowPowerMode: isLowEndDevice,
  }
}

// 获取设备信息
const deviceInfo = detectDevicePerformance()

// 自动启用低功耗模式（如果检测到低端设备）
if (deviceInfo.shouldRecommendLowPowerMode && !localStorage.getItem('alisten-performance-config')) {
  performanceConfig.lowPowerMode = true
  performanceConfig.reduceAnimations = true
  performanceConfig.disableBackgroundBlur = true
  performanceConfig.simplifyEffects = true
}

// 监听配置变化并保存
watch(performanceConfig, (newConfig) => {
  savePerformanceConfig(newConfig)
}, { deep: true })

// 切换低功耗模式
function toggleLowPowerMode() {
  performanceConfig.lowPowerMode = !performanceConfig.lowPowerMode

  if (performanceConfig.lowPowerMode) {
    // 启用低功耗模式时自动设置相关选项
    performanceConfig.reduceAnimations = true
    performanceConfig.disableBackgroundBlur = true
    performanceConfig.reducedRefreshRate = true
    performanceConfig.simplifyEffects = true
    performanceConfig.disableParticles = true
  } else {
    // 关闭低功耗模式时恢复默认设置
    performanceConfig.reduceAnimations = false
    performanceConfig.disableBackgroundBlur = false
    performanceConfig.reducedRefreshRate = false
    performanceConfig.simplifyEffects = false
    performanceConfig.disableParticles = false
  }
}

// 获取动画持续时间（根据性能设置调整）
function getAnimationDuration(defaultDuration: number): number {
  if (performanceConfig.reduceAnimations) {
    return Math.min(defaultDuration * 0.3, 150) // 减少到30%，最多150ms
  }
  return defaultDuration
}

// 获取刷新率限制
function getRefreshRateLimit(): number {
  if (performanceConfig.reducedRefreshRate) {
    return 30 // 限制为30fps
  }
  return 60 // 默认60fps
}

// 获取模糊强度
function getBlurIntensity(defaultBlur: number): number {
  if (performanceConfig.disableBackgroundBlur) {
    return 0
  }
  if (performanceConfig.simplifyEffects) {
    return Math.min(defaultBlur * 0.5, 10)
  }
  return defaultBlur
}

// CSS类名生成器
function getPerformanceClasses() {
  const classes = []

  if (performanceConfig.lowPowerMode) {
    classes.push('low-power-mode')
  }

  if (performanceConfig.reduceAnimations) {
    classes.push('reduce-animations')
  }

  if (performanceConfig.disableBackgroundBlur) {
    classes.push('disable-blur')
  }

  if (performanceConfig.simplifyEffects) {
    classes.push('simplify-effects')
  }

  if (performanceConfig.disableParticles) {
    classes.push('disable-particles')
  }

  return classes.join(' ')
}

export function usePerformance() {
  return {
    performanceConfig,
    deviceInfo,
    supportsLowPowerMode,
    toggleLowPowerMode,
    getAnimationDuration,
    getRefreshRateLimit,
    getBlurIntensity,
    getPerformanceClasses,
  }
}
