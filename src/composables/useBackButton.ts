import type { Ref } from 'vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'

/**
 * 手机返回键处理组合函数
 * 用于在移动端拦截返回键操作，优雅地关闭模态框而不是直接退出应用
 */
export function useBackButton(modalRefs: Ref<boolean>[] = []) {
  // 当前是否有历史状态被推入
  const hasHistoryState = ref(false)

  // 获取当前打开的模态框引用
  function getOpenModals(): Ref<boolean>[] {
    return modalRefs.filter(modalRef => modalRef.value)
  }

  // 检查是否有模态框打开
  function hasOpenModal(): boolean {
    return modalRefs.some(modalRef => modalRef.value)
  }

  // 关闭最后一个打开的模态框
  function closeLastModal(): boolean {
    const openModals = getOpenModals()
    if (openModals.length > 0) {
      // 关闭最后一个打开的模态框
      const lastModal = openModals[openModals.length - 1]
      lastModal.value = false
      return true
    }
    return false
  }

  // 添加一个虚拟的历史记录状态
  function pushHistoryState() {
    if (!hasHistoryState.value) {
      window.history.pushState({ modal: true }, '', window.location.href)
      hasHistoryState.value = true
    }
  }

  // 移除历史记录状态标记
  function removeHistoryState() {
    hasHistoryState.value = false
  }

  // 处理返回键事件
  function handlePopState(event: PopStateEvent) {
    // 检查当前是否有模态框打开
    if (hasOpenModal()) {
      // 阻止默认的返回行为
      event.preventDefault()

      // 关闭最后打开的模态框
      const closed = closeLastModal()

      if (closed) {
        // 如果还有其他模态框打开，继续保持历史状态
        if (hasOpenModal()) {
          pushHistoryState()
        } else {
          // 没有模态框了，移除历史状态标记
          removeHistoryState()
        }
      }
    } else {
      // 没有模态框打开，移除历史状态标记
      removeHistoryState()
    }
  }

  // 生命周期管理
  onMounted(() => {
    // 监听浏览器返回事件
    window.addEventListener('popstate', handlePopState)

    // 监听所有模态框状态变化
    modalRefs.forEach((modalRef) => {
      watch(modalRef, (isOpen, wasOpen) => {
        if (isOpen && !wasOpen) {
          // 模态框打开了，推送历史状态
          // 如果不推送历史状态，浏览器返回键会直接退出应用
          pushHistoryState()
        } else if (!isOpen && wasOpen && !hasOpenModal()) {
          // 模态框关闭了且没有其他模态框打开，移除历史状态标记
          removeHistoryState()
        }
      })
    })
  })

  onUnmounted(() => {
    // 清理事件监听
    window.removeEventListener('popstate', handlePopState)

    // 重置状态
    removeHistoryState()
  })
}
