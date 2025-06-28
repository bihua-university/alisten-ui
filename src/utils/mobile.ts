/**
 * 移动端适配工具函数
 */

// 可滚动区域选择器
export const MOBILE_SCROLL_SELECTORS = `
  .lyrics-container, 
  .chat-container .overflow-y-auto, 
  .playlist-container, 
  .search-results, 
  .help-content .overflow-y-auto, 
  .modal-scroll, 
  .mobile-chat-scroll, 
  .smooth-scroll, 
  [data-scrollable="true"], 
  .overflow-y-auto.scrollbar-hide, 
  .overflow-y-auto.custom-scrollbar
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
  console.log(`📱 更新视口高度: ${window.innerHeight}px -> ${vh}px per vh`)
}

/**
 * 检查元素是否在允许滚动的区域内
 */
export function isScrollableElement(target: Element): Element | null {
  return target.closest(MOBILE_SCROLL_SELECTORS)
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
      console.log('阻止页面级滚动')
      e.preventDefault()
      return
    }

    const target = e.target as Element
    const inModal = isInModal(target)
    const inApp = isInApp(target)

    if (inModal || !inApp) {
      const scrollableElement = isScrollableElement(target)

      if (!scrollableElement) {
        console.log('阻止滚动: 不在允许的滚动区域内', { target: target.className })
        e.preventDefault()
        e.stopPropagation()
      }
    }
  }
}

/**
 * 防止触摸滚动的事件处理器
 */
export function createPreventTouchMoveHandler() {
  return function preventTouchMove(e: TouchEvent) {
    const target = e.target as Element
    const scrollableElement = isScrollableElement(target)

    if (!scrollableElement) {
      console.log('阻止触摸滚动: 不在允许的滚动区域内', { target: target.className })
      e.preventDefault()
      e.stopPropagation()
    } else {
      // 防止过度滚动（橡皮筋效果）
      const element = scrollableElement as HTMLElement
      const { scrollTop, scrollHeight, clientHeight } = element
      const targetRect = target?.getBoundingClientRect()
      const touchY = e.touches[0].clientY

      const isAtTop = scrollTop <= 0
      const isAtBottom = scrollTop + clientHeight >= scrollHeight
      const isScrollingUp = touchY > (targetRect?.top || 0)
      const isScrollingDown = touchY < (targetRect?.bottom || 0)

      if ((isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown)) {
        console.log('阻止边界触摸滚动: 防止橡皮筋效果')
        e.preventDefault()
        e.stopPropagation()
      }
    }
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
