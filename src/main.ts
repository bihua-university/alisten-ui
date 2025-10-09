import { createApp } from 'vue'
import App from './App.vue'
import { usePerformance } from './composables/usePerformance'
import { useUserSettings } from './composables/useUserSettings'
import './style.css'

// 初始化性能设置
const { applyPerformanceSettings } = usePerformance()

// 应用性能设置（确保在组件渲染前生效）
applyPerformanceSettings()

// 初始化主题设置
const { initTheme } = useUserSettings()
initTheme()

createApp(App).mount('#app')
