import { useRegisterSW } from 'virtual:pwa-register/vue'
import { onUnmounted, ref } from 'vue'

export function usePWA() {
  const showUpdateModal = ref(false)
  const updateCheckTimer = ref<NodeJS.Timeout | null>(null)

  // 定时检查配置
  const CHECK_INTERVAL = 30 * 60 * 1000 // 30分钟检查一次

  // PWA 更新相关
  const {
    needRefresh,
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(swRegistration) {
      console.log('SW Registered')
      // 启动定时检查更新
      startPeriodicUpdateCheck(swRegistration)
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error)
    },
    onNeedRefresh() {
      showUpdateModal.value = true
    },
    onOfflineReady() {
      console.log('App ready to work offline')
    },
  })

  // 定时检查更新函数
  function startPeriodicUpdateCheck(swRegistration?: ServiceWorkerRegistration) {
    if (updateCheckTimer.value) {
      clearInterval(updateCheckTimer.value)
    }

    updateCheckTimer.value = setInterval(async () => {
      try {
        // 只在页面可见时检查更新
        if (document.visibilityState === 'visible' && swRegistration) {
          console.log('检查应用更新...')
          await swRegistration.update()
        }
      } catch (error) {
        console.error('检查更新失败:', error)
      }
    }, CHECK_INTERVAL)

    console.log(`已启动定时更新检查，间隔: ${CHECK_INTERVAL / 1000 / 60} 分钟`)
  }

  // 停止定时检查
  function stopPeriodicUpdateCheck() {
    if (updateCheckTimer.value) {
      clearInterval(updateCheckTimer.value)
      updateCheckTimer.value = null
      console.log('已停止定时更新检查')
    }
  }

  // 组件卸载时清理定时器
  onUnmounted(() => {
    stopPeriodicUpdateCheck()
  })

  // 处理应用更新
  function handleUpdateApp() {
    updateServiceWorker(true)
    showUpdateModal.value = false
  }

  // 忽略更新
  function handleDismissUpdate() {
    showUpdateModal.value = false
  }

  return {
    showUpdateModal,
    needRefresh,
    handleUpdateApp,
    handleDismissUpdate,
    startPeriodicUpdateCheck,
    stopPeriodicUpdateCheck,
  }
}
