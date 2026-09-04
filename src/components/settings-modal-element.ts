import type { PlayMode } from '@/types'
import { html, LitElement, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'

import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { notificationStore } from '@/stores/notification-store'
import { performanceStore } from '@/stores/performance-store'
import { playerStore } from '@/stores/player-store'
import { userSettingsStore } from '@/stores/user-settings-store'
import { getAppConfig } from '@/utils/config'
import { icons } from '@/utils/icons'
import { generateGravatarUrl } from '@/utils/user'

const COOKIE_TOKEN_KEY = 'alisten-cookie-admin-token'

@customElement('alisten-settings-modal')
export class SettingsModalElement extends LitElement {
  createRenderRoot() {
    return this
  }

  @state() private userName = userSettingsStore.state.userName
  @state() private userEmail = userSettingsStore.state.userEmail
  @state() private performanceLevel = performanceStore.state.level
  @state() private volume = playerStore.state.volume
  @state() private isMuted = playerStore.state.isMuted
  @state() private playMode = userSettingsStore.state.playMode
  @state() private cookieToken = ''
  @state() private cookieValue = ''
  @state() private cookieStatus: 'unknown' | 'loading' | 'set' | 'unset' | 'error'
    = 'unknown'

  @state() private cookieSaving = false

  connectedCallback() {
    super.connectedCallback()
    userSettingsStore.addEventListener('change', this.handleUserSettingsChange)
    performanceStore.addEventListener('change', this.handlePerformanceChange)
    playerStore.addEventListener('change', this.handlePlayerChange)
    userSettingsStore.pullSetting()

    this.cookieToken = localStorage.getItem(COOKIE_TOKEN_KEY) || ''
    if (this.cookieToken)
      this.queryCookieStatus()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    userSettingsStore.removeEventListener(
      'change',
      this.handleUserSettingsChange,
    )
    performanceStore.removeEventListener(
      'change',
      this.handlePerformanceChange,
    )
    playerStore.removeEventListener('change', this.handlePlayerChange)

    const nameInput = this.querySelector(
      'input[type="text"]',
    ) as HTMLInputElement | null
    const emailInput = this.querySelector(
      'input[type="email"]',
    ) as HTMLInputElement | null
    const userName = nameInput?.value ?? this.userName
    const userEmail = emailInput?.value ?? this.userEmail

    userSettingsStore.setUserName(userName)
    userSettingsStore.setUserEmail(userEmail)
    userSettingsStore.syncUserSettings()
  }

  private handleUserSettingsChange = () => {
    this.userName = userSettingsStore.state.userName
    this.userEmail = userSettingsStore.state.userEmail
    this.playMode = userSettingsStore.state.playMode
  }

  private handlePerformanceChange = () => {
    this.performanceLevel = performanceStore.state.level
  }

  private handlePlayerChange = () => {
    this.volume = playerStore.state.volume
    this.isMuted = playerStore.state.isMuted
  }

  private get avatarUrl(): string {
    const displayName = this.userName || '匿名用户'
    if (this.userEmail && userSettingsStore.emailValidation.valid) {
      return generateGravatarUrl(this.userEmail, 200)
    }
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`
  }

  private handleClose() {
    this.dispatchEvent(new CustomEvent('close'))
  }

  private handleVolumeClick(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = (clickX / rect.width) * 100
    const newVolume = Math.max(0, Math.min(100, percentage))
    playerStore.setVolume(newVolume)
    if (newVolume > 0 && this.isMuted) {
      playerStore.toggleMute()
    }
  }

  private get cookieApiUrl(): string {
    const baseUrl = getAppConfig().api.baseUrl.replace(/\/+$/, '')
    return `${baseUrl}/config/cookie`
  }

  private get cookieStatusInfo(): { text: string, color: string } {
    switch (this.cookieStatus) {
      case 'loading':
        return { text: '查询中...', color: 'text-white/50' }
      case 'set':
        return { text: '已设置', color: 'text-green-400' }
      case 'unset':
        return { text: '未设置', color: 'text-amber-400' }
      case 'error':
        return { text: '查询失败', color: 'text-red-400' }
      default:
        return { text: '未查询', color: 'text-white/40' }
    }
  }

  private handleCookieTokenInput(e: InputEvent) {
    this.cookieToken = (e.target as HTMLInputElement).value.trim()
    localStorage.setItem(COOKIE_TOKEN_KEY, this.cookieToken)
  }

  private notifyCookieHttpError(status: number) {
    if (status === 401)
      notificationStore.error('Token 错误')
    else if (status === 403)
      notificationStore.error('服务端未配置 token')
    else
      notificationStore.error(`请求失败 (HTTP ${status})`)
  }

  private async queryCookieStatus() {
    if (!this.cookieToken) {
      this.cookieStatus = 'unknown'
      return
    }
    this.cookieStatus = 'loading'
    try {
      const response = await fetch(this.cookieApiUrl, {
        headers: { Authorization: `Bearer ${this.cookieToken}` },
      })
      if (response.ok) {
        const data = await response.json()
        this.cookieStatus = data.set ? 'set' : 'unset'
      } else {
        this.cookieStatus = 'error'
        this.notifyCookieHttpError(response.status)
      }
    } catch {
      this.cookieStatus = 'error'
      notificationStore.error('无法连接服务器')
    }
  }

  private async saveCookie() {
    if (!this.cookieToken) {
      notificationStore.warning('请先填写管理 Token')
      return
    }
    if (!this.cookieValue.trim()) {
      notificationStore.warning('请先粘贴网易云音乐 Cookie')
      return
    }
    this.cookieSaving = true
    try {
      const response = await fetch(this.cookieApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.cookieToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cookie: this.cookieValue.trim() }),
      })
      if (response.ok) {
        const data = await response.json()
        if (data.persisted)
          notificationStore.success('已保存并写入配置文件')
        else
          notificationStore.warning('已生效但写入配置文件失败，重启后会丢失')
        this.queryCookieStatus()
      } else {
        this.notifyCookieHttpError(response.status)
      }
    } catch {
      notificationStore.error('无法连接服务器')
    } finally {
      this.cookieSaving = false
    }
  }

  render() {
    return html`
      <div
        class="fixed top-0 left-0 right-0 bottom-0 z-[60] flex items-center justify-center p-0 md:p-8"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/70 backdrop-blur-md md:backdrop-blur-sm"
          @click=${this.handleClose}
        ></div>

        <!-- Container -->
        <div
          class="relative w-full max-w-none md:max-w-xl h-[100dvh] md:h-auto md:max-h-[85vh] flex flex-col rounded-none md:rounded-3xl overflow-hidden border-0 md:border md:border-white/10 shadow-none md:shadow-2xl"
          style="background: #1a1a1f;"
        >
          <!-- Header -->
          <div
            class="flex-shrink-0 px-6 py-4 border-b border-white/5 flex justify-between items-center"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center"
              >
                <i class="fa-solid fa-cog text-lg text-purple-400"></i>
              </div>
              <h2 class="text-xl font-bold text-white">设置</h2>
            </div>
            <button
              class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
              @click=${this.handleClose}
            >
              <i class="fa-solid fa-times text-sm"></i>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto min-h-0 p-6 space-y-6">
            <!-- Profile -->
            <div>
              <h4
                class="text-sm font-bold text-white mb-3 flex items-center gap-2"
              >
                ${unsafeSVG(icons.users(16, 'text-purple-400'))} 个人资料
              </h4>
              <div class="space-y-3">
                <!-- Avatar Preview -->
                <div class="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                  <img
                    src=${this.avatarUrl}
                    alt="头像预览"
                    class="w-14 h-14 rounded-full bg-white/10 object-cover"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-white truncate">
                      ${this.userName || '匿名用户'}
                    </p>
                    <p class="text-xs text-white/40 truncate">
                      ${this.userEmail || '未设置邮箱'}
                    </p>
                  </div>
                </div>
                <div>
                  <label class="text-xs text-white/50 mb-1 block">昵称</label>
                  <input
                    type="text"
                    .value=${this.userName}
                    class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-all"
                    placeholder="输入昵称"
                    @input=${(e: InputEvent) =>
                      (this.userName = (e.target as HTMLInputElement).value)}
                  />
                </div>
                <div>
                  <label class="text-xs text-white/50 mb-1 block"
                    >邮箱 (用于 Gravatar 头像)</label
                  >
                  <input
                    type="email"
                    .value=${this.userEmail}
                    class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-all"
                    placeholder="输入邮箱"
                    @input=${(e: InputEvent) =>
                      (this.userEmail = (e.target as HTMLInputElement).value)}
                  />
                  ${!userSettingsStore.emailValidation.valid
                    ? html`<p class="text-xs text-red-400 mt-1">
                        ${userSettingsStore.emailValidation.message}
                      </p>`
                    : nothing}
                </div>
              </div>
            </div>

            <!-- Volume -->
            <div>
              <h4
                class="text-sm font-bold text-white mb-3 flex items-center gap-2"
              >
                ${unsafeSVG(icons.volume2(16, 'text-indigo-400'))} 音量控制
              </h4>
              <div class="flex items-center gap-3">
                <button
                  class="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors shrink-0 flex items-center justify-center"
                  @click=${() => playerStore.toggleMute()}
                >
                  ${unsafeSVG(
                    this.isMuted
                      ? icons.volumeX(18, 'text-white/50')
                      : icons.volume2(18, 'text-white/70'),
                  )}
                </button>
                <div
                  class="flex-1 h-2 bg-white/10 rounded-full cursor-pointer relative"
                  @click=${this.handleVolumeClick}
                >
                  <div
                    class="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all volume-bar"
                    style="width: ${this.isMuted ? 0 : this.volume}%"
                  ></div>
                </div>
                <span class="text-xs text-white/50 w-10 text-right shrink-0"
                  >${this.isMuted ? 0 : Math.round(this.volume)}%</span
                >
              </div>
            </div>

            <!-- Play Mode -->
            <div>
              <h4
                class="text-sm font-bold text-white mb-3 flex items-center gap-2"
              >
                ${unsafeSVG(icons.listMusic(16, 'text-purple-400'))} 播放模式
              </h4>
              <div class="flex flex-col gap-2 mb-3">
                ${[
                  {
                    mode: 'sequential' as PlayMode,
                    title: '顺序播放',
                    desc: '按照播放列表顺序依次播放',
                    icon: icons.listMusic(16, 'mr-2'),
                  },
                  {
                    mode: 'random' as PlayMode,
                    title: '随机播放',
                    desc: '随机选择播放列表中的歌曲',
                    icon: icons.shuffle(16, 'mr-2'),
                  },
                ].map(({ mode, title, desc, icon }) => {
                  const active = this.playMode === mode
                  return html`
                    <button
                      class="text-left p-3 rounded-xl transition-all border ${active
                        ? 'bg-purple-600/20 border-purple-500/40'
                        : 'bg-white/5 border-transparent hover:bg-white/10'}"
                      @click=${() => userSettingsStore.setPlayMode(mode)}
                    >
                      <div class="flex items-center justify-between">
                        <div>
                          <div
                            class="text-sm font-medium ${active
                              ? 'text-white'
                              : 'text-white/70'} flex items-center"
                          >
                            ${unsafeSVG(icon)} ${title}
                          </div>
                          <p
                            class="text-xs ${active
                              ? 'text-white/70'
                              : 'text-white/40'} leading-relaxed pl-6"
                          >
                            ${desc}
                          </p>
                        </div>
                        <div
                          class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ml-2 ${active
                            ? 'border-purple-400'
                            : 'border-white/30'}"
                        >
                          ${active
                            ? html`<div
                                class="w-2 h-2 rounded-full bg-purple-400"
                              ></div>`
                            : nothing}
                        </div>
                      </div>
                    </button>
                  `
                })}
              </div>
            </div>

            <!-- Performance -->
            <div>
              <h4
                class="text-sm font-bold text-white mb-3 flex items-center gap-2"
              >
                ${unsafeSVG(icons.zap(16, 'text-amber-400'))} 性能设置
              </h4>
              <div class="flex flex-col gap-2 mb-3">
                ${[
                  {
                    level: 'high' as const,
                    title: '高质量模式',
                    desc: '所有动画、毛玻璃模糊、背景光晕脉动全部开启，视觉效果最佳。',
                  },
                  {
                    level: 'medium' as const,
                    title: '平衡模式',
                    desc: '在视觉效果与流畅度之间取得平衡，移动端会自动启用额外的性能优化策略。',
                  },
                  {
                    level: 'low' as const,
                    title: '省电模式',
                    desc: '简化动画时长并降低模糊强度，禁用背景脉动与光晕效果。',
                  },
                  {
                    level: 'off' as const,
                    title: '极简模式',
                    desc: '完全禁用所有动画、模糊、阴影和渐变效果，将 GPU 与 CPU 占用降至最低。',
                  },
                ].map(({ level, title, desc }) => {
                  const active = this.performanceLevel === level
                  return html`
                    <button
                      class="text-left p-3 rounded-xl transition-all border ${active
                        ? 'bg-purple-600/20 border-purple-500/40'
                        : 'bg-white/5 border-transparent hover:bg-white/10'}"
                      @click=${() => {
                        performanceStore.setState({ level })
                        performanceStore.applySettings()
                        performanceStore.saveSettings()
                      }}
                    >
                      <div class="flex items-center gap-2 mb-1">
                        <div
                          class="w-2 h-2 rounded-full ${active
                            ? 'bg-purple-400'
                            : 'bg-white/20'}"
                        ></div>
                        <span
                          class="text-sm font-medium ${active
                            ? 'text-white'
                            : 'text-white/70'}"
                          >${title}</span
                        >
                      </div>
                      <p
                        class="text-xs ${active
                          ? 'text-white/70'
                          : 'text-white/40'} leading-relaxed pl-4"
                      >
                        ${desc}
                      </p>
                    </button>
                  `
                })}
              </div>
            </div>
            <!-- Cookie -->
            <div>
              <h4
                class="text-sm font-bold text-white mb-3 flex items-center gap-2"
              >
                ${unsafeSVG(icons.lock(16, 'text-indigo-400'))} Cookie 管理
              </h4>
              <div class="space-y-3">
                <div>
                  <label class="text-xs text-white/50 mb-1 block"
                    >管理 Token</label
                  >
                  <input
                    type="password"
                    .value=${this.cookieToken}
                    class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-all"
                    placeholder="输入管理 Token"
                    @input=${this.handleCookieTokenInput}
                  />
                </div>
                <div
                  class="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                >
                  <span class="text-sm text-white/60">当前状态</span>
                  <div class="flex items-center gap-3">
                    <span
                      class="text-sm font-medium ${this.cookieStatusInfo.color}"
                      >${this.cookieStatusInfo.text}</span
                    >
                    <button
                      class="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center"
                      title="刷新状态"
                      @click=${() => this.queryCookieStatus()}
                    >
                      ${unsafeSVG(icons.refreshCw(14, 'text-white/50'))}
                    </button>
                  </div>
                </div>
                <div>
                  <label class="text-xs text-white/50 mb-1 block"
                    >网易云音乐 Cookie</label
                  >
                  <textarea
                    rows="3"
                    .value=${this.cookieValue}
                    class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-all resize-none"
                    placeholder="MUSIC_U=..."
                    @input=${(e: InputEvent) =>
                      (this.cookieValue = (e.target as HTMLTextAreaElement).value)}
                  ></textarea>
                  <p class="text-xs text-white/30 mt-1 leading-relaxed">
                    浏览器打开 music.163.com 并登录，按 F12 → Application →
                    Cookies，复制并粘贴到此处
                  </p>
                </div>
                <button
                  class="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-white transition-all active:scale-95"
                  ?disabled=${this.cookieSaving}
                  @click=${this.saveCookie}
                >
                  ${this.cookieSaving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }
}
