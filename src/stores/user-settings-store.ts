import type { PlayMode, User } from '@/types'
import { generateGravatarUrl } from '@/utils/user'
import { Store } from './store-base'
import { websocketStore } from './websocket-store'

export type BubbleStyle = 'default' | 'feibi'

function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function setStorageItem(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value))
}

interface UserSettingsState {
  userName: string
  userEmail: string
  playMode: PlayMode
  bubbleStyle: BubbleStyle
}

class UserSettingsStore extends Store<UserSettingsState> {
  constructor() {
    super({
      userName: getStorageItem('alisten_nickname', ''),
      userEmail: getStorageItem('alisten_email', ''),
      playMode: 'sequential',
      bubbleStyle: getStorageItem('alisten_bubble_style', 'default'),
    })

    websocketStore.registerMessageHandler('setting/push', (message: any) => {
      this.setState({ playMode: message.data.playmode || 'sequential' })
    })
  }

  get currentUser(): User {
    const displayName = this.state.userName || '匿名用户'
    const avatar = this.state.userEmail
      ? generateGravatarUrl(this.state.userEmail, 200)
      : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`
    return { name: displayName, avatar }
  }

  get emailValidation() {
    if (!this.state.userEmail)
      return { valid: true, message: '' }
    const valid = /^[\w.%+-]+@[\w.-]+\.[a-z]{2,}$/i.test(this.state.userEmail)
    return { valid, message: valid ? '' : '请输入有效的邮箱地址' }
  }

  setUserName(name: string) {
    this.setState({ userName: name })
    setStorageItem('alisten_nickname', name)
  }

  setUserEmail(email: string) {
    this.setState({ userEmail: email })
    setStorageItem('alisten_email', email)
  }

  setBubbleStyle(style: BubbleStyle) {
    this.setState({ bubbleStyle: style })
    setStorageItem('alisten_bubble_style', style)
  }

  setPlayMode(mode: PlayMode) {
    if (['sequential', 'random'].includes(mode)) {
      this.setState({ playMode: mode })
    }
    websocketStore.send({ action: '/music/playmode', data: { mode: this.state.playMode } })
  }

  syncUserSettings() {
    if (!this.state.userName)
      return
    websocketStore.send({
      action: '/setting/user',
      data: { name: this.state.userName, email: this.state.userEmail, sendTime: Date.now() },
    })
  }

  pullSetting() {
    websocketStore.send({ action: '/setting/pull', data: {} })
  }
}

export const userSettingsStore = new UserSettingsStore()
