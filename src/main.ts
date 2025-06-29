import { createApp } from 'vue'
import App from './App.vue'
import { usePerformance } from './composables/usePerformance'
import './style.css'

// 初始化性能设置
const { applyPerformanceSettings } = usePerformance()

// 应用性能设置（确保在组件渲染前生效）
applyPerformanceSettings()

createApp(App).mount('#app')
