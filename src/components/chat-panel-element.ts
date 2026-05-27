import { html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { chatStore } from '@/stores/chat-store'
import { roomStore } from '@/stores/room-store'
import { userSettingsStore } from '@/stores/user-settings-store'
import { icons } from '@/utils/icons'
import { formatTimeHH_MM } from '@/utils/time'

@customElement('alisten-chat-panel')
export class ChatPanelElement extends LitElement {
  createRenderRoot() {
    return this
  }

  @property({ type: Boolean }) isDesktop = false
  @state() private chatMessages = chatStore.chatMessages
  @state() private onlineUsers = chatStore.onlineUsers
  @state() private roomInfo = roomStore.state
  @state() private bubbleStyle = userSettingsStore.state.bubbleStyle
  @state() private currentUser = userSettingsStore.currentUser
  @state() private newMessage = ''
  @state() private showOnlineUsers = false
  private chatContainerEl: HTMLElement | null = null

  connectedCallback() {
    super.connectedCallback()
    chatStore.addEventListener('change', () => {
      this.chatMessages = chatStore.chatMessages
      this.onlineUsers = chatStore.onlineUsers
      this.scrollToBottom()
    })
    roomStore.addEventListener('change', () => {
      this.roomInfo = roomStore.state
    })
    userSettingsStore.addEventListener('change', () => {
      this.bubbleStyle = userSettingsStore.state.bubbleStyle
      this.currentUser = userSettingsStore.currentUser
    })
    document.addEventListener('click', this.handleDocumentClick)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    document.removeEventListener('click', this.handleDocumentClick)
  }

  private handleDocumentClick = (e: MouseEvent) => {
    if (this.showOnlineUsers && !(e.target as Element).closest('.online-users-popup')) {
      this.showOnlineUsers = false
    }
  }

  private scrollToBottom() {
    requestAnimationFrame(() => {
      if (this.chatContainerEl) {
        this.chatContainerEl.scrollTop = this.chatContainerEl.scrollHeight
      }
    })
  }

  private handleSendMessage() {
    if (this.newMessage.trim()) {
      chatStore.sendMessage(this.newMessage)
      this.newMessage = ''
    }
  }

  private isCurrentUser(name: string): boolean {
    return name === this.currentUser.name
  }

  render() {
    return html`
      <div class="flex flex-col gap-2.5 h-full relative">
        <!-- Room Info -->
        <div class="rounded-xl p-3 shrink-0" style="background: rgba(17,17,17,0.8); border: 1px solid var(--bg-hover);">
          <div class="flex items-center gap-2.5 mb-2.5">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0" style="background: var(--accent); color: var(--bg-base);">
              ${this.roomInfo.name?.slice(0, 1) || 'R'}
            </div>
            <div class="min-w-0">
              <h3 class="text-[13px] font-semibold text-white/80 truncate leading-tight">${this.roomInfo.name || '音乐房间'}</h3>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="${this.isDesktop ? 'flex items-center gap-1' : 'grid grid-cols-3 gap-1'}">
            <button class="py-1.5 px-2 hover:bg-white/[0.05] rounded-md transition-colors flex items-center justify-center gap-1.5 ${this.isDesktop ? 'flex-1' : ''}"
              @click=${(e: Event) => {
                e.stopPropagation()
                this.showOnlineUsers = true
              }}>
              <span class="flex h-1.5 w-1.5 shrink-0 relative">
                <span class="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" style="animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite"></span>
                <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
              </span>
              <span class="text-[11px] text-white/50 whitespace-nowrap">${this.onlineUsers.length} 在线</span>
            </button>
            ${this.isDesktop
              ? html`
              <button class="flex-1 py-1.5 px-2 hover:bg-white/[0.05] rounded-md transition-colors flex items-center justify-center gap-1.5" @click=${() => this.dispatchEvent(new CustomEvent('show-play-history'))}>
                ${unsafeSVG(icons.history(14, 'text-white/50'))}
                <span class="text-[11px] text-white/50">历史</span>
              </button>
              <button class="flex-1 py-1.5 px-2 hover:bg-white/[0.05] rounded-md transition-colors flex items-center justify-center gap-1.5" @click=${() => this.dispatchEvent(new CustomEvent('share-room'))}>
                ${unsafeSVG(icons.share2(14, 'text-white/50'))}
                <span class="text-[11px] text-white/50">分享</span>
              </button>
            `
              : nothing}
            <button class="py-1.5 px-2 hover:bg-white/[0.05] rounded-md transition-colors flex items-center justify-center gap-1.5 ${this.isDesktop ? 'flex-1' : ''}" @click=${() => this.dispatchEvent(new CustomEvent('show-settings'))}>
              ${unsafeSVG(icons.settings(14, 'text-white/50'))}
              <span class="text-[11px] text-white/50">设置</span>
            </button>
            <button class="py-1.5 px-2 hover:bg-white/[0.05] rounded-md transition-colors flex items-center justify-center gap-1.5 ${this.isDesktop ? 'flex-1' : ''}" @click=${() => this.dispatchEvent(new CustomEvent('show-help'))}>
              ${unsafeSVG(icons.helpCircle(14, 'text-white/50'))}
              <span class="text-[11px] text-white/50">帮助</span>
            </button>
          </div>
        </div>

        <!-- Online Users Popup -->
        ${this.showOnlineUsers
          ? html`
          <div class="online-users-popup absolute top-0 left-0 right-0 mt-[100px] rounded-xl p-3.5 z-[100] max-h-[280px] md:max-h-[300px] overflow-hidden flex flex-col"
            style="background: var(--bg-surface); border: 1px solid var(--border-hover);">
            <div class="flex items-center justify-between mb-2.5">
              <div class="flex items-center gap-1.5">
                ${unsafeSVG(icons.users(14, 'text-white/50'))}
                <span class="text-[11px] font-medium text-white/70">在线用户</span>
              </div>
              <button class="p-1 hover:bg-white/[0.06] rounded-md transition-colors" @click=${() => this.showOnlineUsers = false}>
                ${unsafeSVG(icons.x(14, 'text-white/50'))}
              </button>
            </div>
            <div class="space-y-1.5 overflow-y-auto pr-1">
              ${this.onlineUsers.map(user => html`
                <div class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <div class="relative shrink-0">
                    <img src=${user.avatar} alt=${user.name} class="w-8 h-8 rounded-md object-cover">
                    <div class="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full" style="border: 2px solid var(--bg-surface);"></div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-[12px] font-medium truncate">${user.name}</div>
                    <div class="text-[10px] text-white/30 truncate">在线</div>
                  </div>
                </div>
              `)}
            </div>
          </div>
        `
          : nothing}

        <!-- Chat Messages -->
        <div class="flex-1 flex flex-col overflow-hidden min-h-[200px] rounded-xl"
          style="background: rgba(17,17,17,0.8); border: 1px solid var(--bg-hover);">
          <div class="px-3 py-2.5 shrink-0" style="border-bottom: 1px solid var(--bg-hover);">
            <div class="flex items-center gap-1.5 text-[11px] font-medium text-white/40 uppercase tracking-wider">
              ${unsafeSVG(icons.messageSquare(13))}
              聊天
            </div>
          </div>
          <div ${(el: Element | undefined) => {
            if (el instanceof HTMLElement)
              this.chatContainerEl = el
          }}
            class="flex-1 overflow-y-auto px-3 pt-3 pb-1 space-y-4">
            ${this.chatMessages.map((msg) => {
              const isSelf = this.isCurrentUser(msg.user.name)
              const isFeibi = this.bubbleStyle === 'feibi'
              return html`
                <div class="flex gap-2.5 items-start ${isSelf ? 'flex-row-reverse' : ''}">
                  <img src=${msg.user.avatar} alt=${msg.user.name} class="w-7 h-7 rounded-full shrink-0 object-cover mt-0.5">
                  <div class="flex-1 min-w-0 ${isSelf ? 'text-right' : ''}">
                    <div class="flex items-center gap-1.5 mb-1 ${isSelf ? 'flex-row-reverse' : ''}">
                      <span class="text-[11px] font-medium ${isSelf ? 'text-[var(--accent)]/70' : 'text-white/40'}">${msg.user.name}</span>
                      <span class="text-[10px] text-white/25">${formatTimeHH_MM(msg.timestamp)}</span>
                    </div>
                    <div class="inline-block text-left">
                      <div class="text-[13px] leading-relaxed break-words px-3 py-1.5 rounded-lg
                        ${isSelf
                          ? 'text-[var(--bg-base)]'
                          : 'text-white/85'}
                        ${isFeibi && isSelf ? 'feibi-bubble' : ''}"
                        style="${isSelf && !isFeibi ? 'background: var(--accent);' : isFeibi && isSelf ? '' : 'background: var(--border-hover);'}">
                        ${msg.content}
                      </div>
                    </div>
                  </div>
                </div>
              `
            })}
          </div>
          <div class="p-2.5 shrink-0" style="border-top: 1px solid var(--bg-hover);">
            <div class="relative">
              <input
                .value=${this.newMessage}
                type="text"
                placeholder="发送消息..."
                class="w-full rounded-lg px-3.5 py-2 text-[13px] text-white placeholder-white/20 focus:outline-none transition-all"
                style="background: var(--bg-hover); border: 1px solid var(--border-hover);"
                @focus=${(e: FocusEvent) => { (e.target as HTMLElement).style.borderColor = 'var(--border-focus)' }}
                @blur=${(e: FocusEvent) => { (e.target as HTMLElement).style.borderColor = 'var(--border-hover)' }}
                @input=${(e: InputEvent) => this.newMessage = (e.target as HTMLInputElement).value}
                @keydown=${(e: KeyboardEvent) => {
                  if (e.key === 'Enter')
                    this.handleSendMessage()
                }}
              >
              <button
                class="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all duration-150
                  ${this.newMessage.trim() ? 'text-[var(--accent)] hover:bg-[var(--accent)]/10 active:scale-95' : 'text-white/15'}"
                ?disabled=${!this.newMessage.trim()}
                @click=${this.handleSendMessage}
              >
                ${unsafeSVG(icons.send(16))}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
        .feibi-bubble { background: #ffffff !important; color: #000000 !important; font-weight: 600; }
      </style>
    `
  }
}
