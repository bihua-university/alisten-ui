import type { PlayMode } from '@/types'
import { html, LitElement, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'

import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { performanceStore } from '@/stores/performance-store'
import { playerStore } from '@/stores/player-store'
import { userSettingsStore } from '@/stores/user-settings-store'
import { icons } from '@/utils/icons'
import { generateGravatarUrl } from '@/utils/user'

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

  connectedCallback() {
    super.connectedCallback()
    userSettingsStore.addEventListener('change', this.handleUserSettingsChange)
    performanceStore.addEventListener('change', this.handlePerformanceChange)
    playerStore.addEventListener('change', this.handlePlayerChange)
    userSettingsStore.pullSetting()
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
                class="w-10 h-10 rounded-xl bg-[#D4A853]/10 flex items-center justify-center"
              >
                <i class="fa-solid fa-cog text-lg text-[#D4A853]"></i>
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
                ${unsafeSVG(icons.users(16, 'text-[#D4A853]'))} 个人资料
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
                    class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4A853]/50 transition-all"
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
                    class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4A853]/50 transition-all"
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
                ${unsafeSVG(icons.volume2(16, 'text-[#D4A853]'))} 音量控制
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
                    class="absolute top-0 left-0 h-full bg-gradient-to-r bg-[#D4A853] rounded-full transition-all volume-bar"
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
                ${unsafeSVG(icons.listMusic(16, 'text-[#D4A853]'))} 播放模式
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
                        ? 'bg-[#D4A853]/15 border-[#D4A853]/30'
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
                            ? 'border-[#D4A853]'
                            : 'border-white/30'}"
                        >
                          ${active
                            ? html`<div
                                class="w-2 h-2 rounded-full bg-[#D4A853]"
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
                        ? 'bg-[#D4A853]/15 border-[#D4A853]/30'
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
                            ? 'bg-[#D4A853]'
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
          </div>
        </div>
      </div>
    `
  }
}
