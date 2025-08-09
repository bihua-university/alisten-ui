import type { PlayMode, User } from '@/types'
import { useStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import { generateGravatarUrl } from '@/utils/user'
import { useWebSocket } from './useWebSocket'

// 用户设置状态
const userName = useStorage('alisten_nickname', '')
const userEmail = useStorage('alisten_email', '')

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

export function useUserSettings() {
  return {
    // 状态
    userName,
    userEmail,
    currentUser,
    emailValidation,
    playMode,

    // 方法
    syncUserSettings,
    isValidEmail,
    pullSetting,
    setPlayMode,
  }
}
