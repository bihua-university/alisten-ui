import type { Ref } from 'vue'
import { onMounted, onUnmounted } from 'vue'

/**
 * 键盘快捷键处理 composable
 */
export function useKeyboardShortcuts(
  isImmersiveMode: Ref<boolean>,
  toggleImmersiveMode: () => void,
) {
  // 键盘事件处理
  function handleKeyDown(event: KeyboardEvent) {
    // 按 F 键切换沉浸模式（仅在没有聚焦输入框时）
    if (event.key === 'f' || event.key === 'F') {
      const activeElement = document.activeElement
      if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
        event.preventDefault()
        toggleImmersiveMode()
      }
    }

    // 按 Escape 键退出沉浸模式
    if (event.key === 'Escape' && isImmersiveMode.value) {
      event.preventDefault()
      isImmersiveMode.value = false
    }
  }

  // 初始化键盘事件监听
  function initKeyboardListeners() {
    document.addEventListener('keydown', handleKeyDown)
  }

  // 清理键盘事件监听
  function cleanupKeyboardListeners() {
    document.removeEventListener('keydown', handleKeyDown)
  }

  // 生命周期管理
  onMounted(() => {
    initKeyboardListeners()
  })

  onUnmounted(() => {
    cleanupKeyboardListeners()
  })

  return {
    handleKeyDown,
    initKeyboardListeners,
    cleanupKeyboardListeners,
  }
}
