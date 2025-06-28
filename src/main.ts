import { createApp } from 'vue'
import App from './App.vue'
import { usePerformance } from './composables/usePerformance'
import './style.css'

// 初始化性能设置
const { applyPerformanceSettings, startPerformanceMonitoring } = usePerformance()

// 应用性能设置（确保在组件渲染前生效）
applyPerformanceSettings()

// 启动性能监控（仅在开发环境启用）
if (import.meta.env.DEV) {
  startPerformanceMonitoring()
}

createApp(App).mount('#app')
