import type { User } from '@/types'
import { computed, ref } from 'vue'
import { generateGravatarUrl } from '@/utils/user'
import { useWebSocket } from './useWebSocket'

// 用户设置状态
const userName = ref('')
const userEmail = ref('')

const { send } = useWebSocket()

// 从 localStorage 加载用户设置
function loadUserSettings() {
  const savedName = localStorage.getItem('alisten_nickname')
  const savedEmail = localStorage.getItem('alisten_email')

  if (savedName) {
    userName.value = savedName
  }

  if (savedEmail) {
    userEmail.value = savedEmail
  }
}

// 保存用户设置到 localStorage
function saveUserSettings() {
  localStorage.setItem('alisten_nickname', userName.value)
  localStorage.setItem('alisten_email', userEmail.value)

  syncUserSettings()
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

export function useUserSettings() {
  // 初始化时加载设置
  loadUserSettings()

  return {
    // 状态
    userName,
    userEmail,
    currentUser,
    emailValidation,

    // 方法
    loadUserSettings,
    saveUserSettings,
    syncUserSettings,
    isValidEmail,
  }
}
