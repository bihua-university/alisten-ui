import { useRegisterSW } from 'virtual:pwa-register/vue'
import { ref } from 'vue'

export function usePWA() {
  const showUpdateModal = ref(false)

  // PWA 更新相关
  const {
    needRefresh,
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered() {
      console.log('SW Registered')
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
  }
}
