import type { PlayMode, User } from '@/types'
import { useStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import { generateGravatarUrl } from '@/utils/user'
import { useWebSocket } from './useWebSocket'

// 用户设置状态
const userName = useStorage('alisten_nickname', '')
const userEmail = useStorage('alisten_email', '')
const userTheme = useStorage<'default' | 'light-pastels'>('alisten_theme', 'default')

// 播放模式状态
const playMode = ref<PlayMode>('sequential')

const { registerMessageHandler, send } = useWebSocket()

registerMessageHandler('setting/push', (message: any) => {
  playMode.value = message.data.playmode || 'sequential'
})

// 从 localStorage 加载所有房间设置
function pullSetting() {
  send({
    action: '/setting/pull',
    data: {},
  })
}

function syncUserSettings() {
  if (!userName.value) {
    return
  }
  // 同步用户设置到服务器
  send({
    action: '/setting/user',
    data: {
      name: userName.value,
      email: userEmail.value,
      sendTime: Date.now(),
    },
  })
}

// 计算当前用户信息
const currentUser = computed((): User => {
  const displayName = userName.value || '匿名用户'
  const avatar = userEmail.value
    ? generateGravatarUrl(userEmail.value, 200)
    : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`

  return {
    name: displayName,
    avatar,
  }
})

// 验证邮箱格式
function isValidEmail(email: string): boolean {
  const emailRegex = /^[\w.%+-]+@[\w.-]+\.[a-z]{2,}$/i
  return emailRegex.test(email)
}

// 邮箱验证状态
const emailValidation = computed(() => {
  if (!userEmail.value) {
    return { valid: true, message: '' }
  }

  const valid = isValidEmail(userEmail.value)
  return {
    valid,
    message: valid ? '' : '请输入有效的邮箱地址',
  }
})

function setPlayMode(mode: PlayMode) {
  if (['sequential', 'random'].includes(mode)) {
    playMode.value = mode
  }
  send({
    action: '/music/playmode',
    data: {
      mode: playMode.value,
    },
  })
}

// 主题CSS路径映射
const themePathMap: Record<string, () => Promise<any>> = {
  'light-pastels': () => import('@/styles/themes/light-pastels.css?inline'),
}

// 动态加载主题CSS
async function loadThemeCSS(theme: 'default' | 'light-pastels') {
  // 先移除之前的主题样式
  const existingThemeStyle = document.querySelector('style[data-theme-style]')
  if (existingThemeStyle) {
    existingThemeStyle.remove()
  }

  // 如果是默认主题，不需要加载额外的CSS
  if (theme === 'default') {
    return
  }

  // 动态导入并加载主题CSS
  try {
    const loader = themePathMap[theme]
    if (loader) {
      const cssModule = await loader()
      const cssContent = cssModule.default

      // 创建style标签并插入CSS内容
      const style = document.createElement('style')
      style.setAttribute('data-theme-style', theme)
      style.textContent = cssContent
      document.head.appendChild(style)
    }
  } catch (error) {
    console.error('Failed to load theme CSS:', error)
  }
}

// 应用主题
async function applyTheme(theme: 'default' | 'light-pastels') {
  const htmlElement = document.documentElement

  // 动态加载主题CSS
  await loadThemeCSS(theme)

  // 设置data-theme属性
  if (theme === 'default') {
    htmlElement.removeAttribute('data-theme')
  } else {
    htmlElement.setAttribute('data-theme', theme)
  }

  userTheme.value = theme
}

// 初始化主题
function initTheme() {
  applyTheme(userTheme.value)
}

export function useUserSettings() {
  return {
    // 状态
    userName,
    userEmail,
    currentUser,
    emailValidation,
    playMode,
    userTheme,
    userTheme,

    // 方法
    syncUserSettings,
    isValidEmail,
    pullSetting,
    setPlayMode,
    applyTheme,
    initTheme,
    applyTheme,
    initTheme,
  }
}
