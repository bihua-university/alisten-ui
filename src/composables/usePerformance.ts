import { computed, ref, watch } from 'vue'

// 性能设置类型
export type PerformanceLevel = 'high' | 'medium' | 'low' | 'off'

// 性能设置状态
const performanceLevel = ref<PerformanceLevel>('medium')
const reducedMotion = ref(false)

// 从localStorage加载设置
function loadPerformanceSettings() {
  try {
    const saved = localStorage.getItem('alisten-performance-level')
    if (saved && ['high', 'medium', 'low', 'off'].includes(saved)) {
      performanceLevel.value = saved as PerformanceLevel
    }

    const motionSaved = localStorage.getItem('alisten-reduced-motion')
    if (motionSaved) {
      reducedMotion.value = JSON.parse(motionSaved)
    }
  } catch (error) {
    console.warn('读取性能设置失败:', error)
  }
}

// 保存设置到localStorage
function savePerformanceSettings() {
  try {
    localStorage.setItem('alisten-performance-level', performanceLevel.value)
    localStorage.setItem('alisten-reduced-motion', JSON.stringify(reducedMotion.value))
  } catch (error) {
    console.warn('保存性能设置失败:', error)
  }
}

// 应用性能设置到DOM
function applyPerformanceSettings() {
  const body = document.body

  // 移除所有性能类
  body.classList.remove('performance-high', 'performance-medium', 'performance-low', 'performance-off', 'no-animations', 'mobile-performance')

  // 应用新的性能类
  switch (performanceLevel.value) {
    case 'high':
      body.classList.add('performance-high')
      console.log('Applied performance-high class')
      break
    case 'medium':
      body.classList.add('performance-medium')
      if (window.innerWidth <= 768) {
        body.classList.add('mobile-performance')
      }
      console.log('Applied performance-medium class')
      break
    case 'low':
      body.classList.add('performance-low', 'mobile-performance')
      console.log('Applied performance-low class')
      break
    case 'off':
      body.classList.add('performance-off', 'no-animations')
      console.log('Applied performance-off class')
      break
  }

  // 应用减少动效设置
  if (reducedMotion.value) {
    body.classList.add('no-animations')
  }

  console.log('Current body classes:', body.className)
}

// 自动检测设备性能
function autoDetectPerformance() {
  // 检测用户是否偏好减少动效
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reducedMotion.value = true
  }

  // 基于设备类型和内存自动设置性能等级
  const isMobile = window.innerWidth <= 768
  const isLowEnd = (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 4

  if (isMobile || isLowEnd) {
    performanceLevel.value = 'low'
  } else if ((navigator as any).deviceMemory && (navigator as any).deviceMemory >= 8) {
    performanceLevel.value = 'high'
  } else {
    performanceLevel.value = 'medium'
  }
}

// 性能监控
let performanceMonitor: number | null = null

function startPerformanceMonitoring() {
  if (performanceMonitor)
    return

  let frameCount = 0
  let lastTime = performance.now()

  function checkPerformance() {
    frameCount++
    const currentTime = performance.now()

    // 每60帧检查一次
    if (frameCount >= 60) {
      const fps = 60000 / (currentTime - lastTime)

      // 如果FPS低于30，自动降低性能设置
      if (fps < 30 && performanceLevel.value !== 'off') {
        const levels: PerformanceLevel[] = ['high', 'medium', 'low', 'off']
        const currentIndex = levels.indexOf(performanceLevel.value)
        if (currentIndex < levels.length - 1) {
          performanceLevel.value = levels[currentIndex + 1]
          console.log(`检测到性能问题，自动降低到 ${performanceLevel.value} 模式`)
        }
      }

      frameCount = 0
      lastTime = currentTime
    }

    performanceMonitor = requestAnimationFrame(checkPerformance)
  }

  performanceMonitor = requestAnimationFrame(checkPerformance)
}

function stopPerformanceMonitoring() {
  if (performanceMonitor) {
    cancelAnimationFrame(performanceMonitor)
    performanceMonitor = null
  }
}

// 获取当前性能设置描述
function getPerformanceDescription(level: PerformanceLevel): string {
  switch (level) {
    case 'high':
      return '高质量 - 所有动画效果，适合高性能设备'
    case 'medium':
      return '平衡 - 优化过的动画效果，推荐设置'
    case 'low':
      return '省电 - 简化动画效果，适合移动设备'
    case 'off':
      return '极简 - 禁用所有动画，最低GPU占用'
    default:
      return '未知设置'
  }
}

export function usePerformance() {
  // 计算性能相关的CSS类
  const performanceClasses = computed(() => {
    const classes = [`performance-${performanceLevel.value}`]

    if (reducedMotion.value) {
      classes.push('no-animations')
    }

    // 移动端性能优化 (仅在客户端)
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      classes.push('mobile-performance')
    }

    return classes
  })

  // 监听设置变化
  watch([performanceLevel, reducedMotion], () => {
    applyPerformanceSettings()
    savePerformanceSettings()
  })

  // 初始化时加载设置
  if (typeof window !== 'undefined') {
    loadPerformanceSettings()
    applyPerformanceSettings()

    // 如果是首次访问，自动检测性能
    if (!localStorage.getItem('alisten-performance-level')) {
      autoDetectPerformance()
    }
  }

  return {
    performanceLevel,
    reducedMotion,
    performanceClasses,
    loadPerformanceSettings,
    savePerformanceSettings,
    applyPerformanceSettings,
    autoDetectPerformance,
    startPerformanceMonitoring,
    stopPerformanceMonitoring,
    getPerformanceDescription,

    // 便捷方法
    setHighPerformance: () => {
      performanceLevel.value = 'high'
    },
    setMediumPerformance: () => {
      performanceLevel.value = 'medium'
    },
    setLowPerformance: () => {
      performanceLevel.value = 'low'
    },
    disableAnimations: () => {
      performanceLevel.value = 'off'
    },
    toggleReducedMotion: () => {
      reducedMotion.value = !reducedMotion.value
    },
  }
}
