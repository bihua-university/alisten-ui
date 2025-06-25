import { useRegisterSW } from 'virtual:pwa-register/vue'
import { ref } from 'vue'

export function usePWA() {
  const showUpdateModal = ref(false)
  const isInstallable = ref(false)
  const deferredPrompt = ref<any>(null)

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

  // PWA 安装相关
  function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt.value = e
      isInstallable.value = true
    })

    window.addEventListener('appinstalled', () => {
      deferredPrompt.value = null
      isInstallable.value = false
      console.log('PWA was installed')
    })
  }

  // 安装 PWA
  async function installPWA() {
    if (!deferredPrompt.value) {
      return false
    }

    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice

    if (outcome === 'accepted') {
      deferredPrompt.value = null
      isInstallable.value = false
    }

    return outcome === 'accepted'
  }

  return {
    showUpdateModal,
    needRefresh,
    isInstallable,
    handleUpdateApp,
    handleDismissUpdate,
    setupInstallPrompt,
    installPWA,
  }
}
