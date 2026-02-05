import type { Ref } from 'vue'
import { onMounted, onUnmounted } from 'vue'

/**
 * 点击元素外部时执行回调
 * @param elementRef - 目标元素的 ref
 * @param callback - 点击外部时执行的回调函数
 * @param enabled - 是否启用监听（可选，默认为 true）
 */
export function useClickOutside(
  elementRef: Ref<HTMLElement | null>,
  callback: () => void,
  enabled: Ref<boolean> | boolean = true,
) {
  const handleClick = (event: MouseEvent) => {
    const enabledValue = typeof enabled === 'boolean' ? enabled : enabled.value
    if (!enabledValue || !elementRef.value)
      return

    const target = event.target as Node
    if (!elementRef.value.contains(target)) {
      callback()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClick, true)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClick, true)
  })
}
