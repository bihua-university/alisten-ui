/**
 * 移动端适配工具函数
 */

// 可滚动区域选择器
export const MOBILE_SCROLL_SELECTORS = `
  .lyrics-container, 
  .overflow-y-auto, 
  .overflow-auto,
  .modal-scroll, 
  .mobile-chat-scroll, 
  .smooth-scroll,
  .scrollbar-hide,
  .custom-scrollbar,
  [data-scrollable="true"],
  [class*="scroll"]
`.replace(/\s+/g, ' ').trim()

/**
 * 检测是否为移动设备
 */
export function isMobileDevice(): boolean {
  const userAgent = navigator.userAgent
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  const isSmallScreen = window.innerWidth <= 768

  return isMobile || isSmallScreen
}

/**
 * 设置视口高度CSS变量
 */
export function setViewportHeight(): void {
  const vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

/**
 * 检查元素是否在允许滚动的区域内
 */
export function isScrollableElement(target: Element): Element | null {
  // 首先检查精确的滚动选择器
  const exactMatch = target.closest(MOBILE_SCROLL_SELECTORS)
  if (exactMatch) {
    return exactMatch
  }

  // 检查元素本身或父元素是否有滚动相关的类名
  let current: Element | null = target
  while (current && current !== document.body) {
    const classList = current.className || ''

    // 检查是否包含滚动相关的类名
    if (
      classList.includes('overflow-y')
      || classList.includes('overflow-auto')
      || classList.includes('scroll')
      || (classList.includes('flex-1') && current.querySelector('[class*="overflow"]'))
    ) {
      return current
    }

    current = current.parentElement
  }

  return null
}

/**
 * 检查是否在模态框中
 */
export function isInModal(target: Element): boolean {
  return !!target.closest('.fixed, .modal, .dialog, .popup, [class*="z-"]')
}

/**
 * 检查是否在应用内
 */
export function isInApp(target: Element): boolean {
  return !!target.closest('#app')
}

/**
 * 防止页面级滚动的事件处理器
 */
export function createPreventScrollHandler() {
  return function preventScroll(e: Event) {
    // 阻止页面级别的滚动
    if (e.target === document.body || e.target === document.documentElement) {
      e.preventDefault()
      return
    }

    const target = e.target as Element
    const scrollableElement = isScrollableElement(target)

    // 如果在可滚动区域内，总是允许滚动
    if (scrollableElement) {
      return
    }

    // 检查是否在模态框内，如果在模态框内则更宽松地处理
    const inModal = isInModal(target)
    if (inModal) {
      return
    }

    // 只有当不在可滚动区域且不在模态框内时才阻止滚动
    const inApp = isInApp(target)
    if (!inApp) {
      e.preventDefault()
      e.stopPropagation()
    }
  }
}

/**
 * 防止触摸滚动的事件处理器
 */
export function createPreventTouchMoveHandler() {
  return function preventTouchMove(e: TouchEvent) {
    const target = e.target as Element

    // 检查是否在允许滚动的区域内
    const scrollableElement = isScrollableElement(target)

    if (!scrollableElement) {
      // 检查是否在模态框内，如果在模态框内但没有找到滚动区域，可能是嵌套的情况
      const inModal = isInModal(target)
      if (!inModal) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    // 在滚动区域内，总是允许滚动，让浏览器自然处理边界
  }
}

/**
 * 防止多点触摸手势的事件处理器
 */
export function createPreventTouchStartHandler() {
  return function preventTouchStart(e: TouchEvent) {
    const target = e.target as Element
    const scrollableElement = isScrollableElement(target)
    if (!scrollableElement && e.touches.length > 1) {
      e.preventDefault()
    }
  }
}
