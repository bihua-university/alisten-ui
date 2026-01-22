import { ref } from 'vue'

export interface NotificationOptions {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  icon?: string
  duration?: number // 持续时间，毫秒
}

export interface NotificationItem extends NotificationOptions {
  id: string
  show: boolean
}

// 全局通知状态
const notifications = ref<NotificationItem[]>([])

let notificationId = 0

export function useNotification() {
  // 显示通知
  const showNotification = (options: NotificationOptions) => {
    const id = `notification-${++notificationId}`
    const duration = options.duration ?? 3000 // 默认3秒

    const notification: NotificationItem = {
      id,
      show: true,
      ...options,
    }

    notifications.value.push(notification)

    // 自动隐藏
    setTimeout(() => {
      hideNotification(id)
    }, duration)

    return id
  }

  // 隐藏通知
  function hideNotification(id: string) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.show = false
      // 延迟移除，等待动画完成
      setTimeout(() => {
        const index = notifications.value.findIndex(n => n.id === id)
        if (index > -1) {
          notifications.value.splice(index, 1)
        }
      }, 300)
    }
  }

  // 清除所有通知
  const clearNotifications = () => {
    notifications.value.forEach(n => n.show = false)
    setTimeout(() => {
      notifications.value.length = 0
    }, 300)
  }

  // 便捷方法
  const showSuccess = (message: string, options?: Omit<NotificationOptions, 'message' | 'type'>) => {
    return showNotification({
      ...options,
      message,
      type: 'success',
      icon: options?.icon || 'fa-solid fa-check-circle',
    })
  }

  const showError = (message: string, options?: Omit<NotificationOptions, 'message' | 'type'>) => {
    return showNotification({
      ...options,
      message,
      type: 'error',
      icon: options?.icon || 'fa-solid fa-exclamation-circle',
    })
  }

  const showWarning = (message: string, options?: Omit<NotificationOptions, 'message' | 'type'>) => {
    return showNotification({
      ...options,
      message,
      type: 'warning',
      icon: options?.icon || 'fa-solid fa-exclamation-triangle',
    })
  }

  const showInfo = (message: string, options?: Omit<NotificationOptions, 'message' | 'type'>) => {
    return showNotification({
      ...options,
      message,
      type: 'info',
      icon: options?.icon || 'fa-solid fa-info-circle',
    })
  }

  // 连接状态专用通知
  const showConnectionSuccess = () => {
    return showSuccess('已连接到服务器', {
      icon: 'fa-solid fa-wifi',
    })
  }

  const showConnectionError = (message: string = '连接失败') => {
    return showError(message, {
      icon: 'fa-solid fa-wifi',
      duration: 5000, // 错误信息显示更久
    })
  }

  const showConnectionWarning = (message: string = '连接不稳定') => {
    return showWarning(message, {
      icon: 'fa-solid fa-wifi',
    })
  }

  return {
    notifications,
    showNotification,
    hideNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConnectionSuccess,
    showConnectionError,
    showConnectionWarning,
  }
}
