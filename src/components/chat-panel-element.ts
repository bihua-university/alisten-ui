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
      <div class="flex flex-col gap-3 h-full relative">
        <!-- Room Info Card -->
        <div class="glass rounded-2xl p-3 shrink-0">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-[#D4A853] flex items-center justify-center font-bold text-sm text-[#0C0A09]">
              ${this.roomInfo.name?.slice(0, 1) || 'R'}
            </div>
            <div>
              <h3 class="font-semibold text-sm leading-none">${this.roomInfo.name || '音乐房间'}</h3>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="${this.isDesktop ? 'flex items-center gap-1 flex-wrap' : 'grid grid-cols-3 gap-1.5'}">
            <button class="py-2 px-2 md:px-3 hover:bg-white/[0.06] rounded-lg transition-colors flex items-center justify-center gap-1.5 ${this.isDesktop ? 'flex-1' : ''}"
              @click=${(e: Event) => {
                e.stopPropagation()
                this.showOnlineUsers = true
              }}>
              <span class="flex h-2 w-2 shrink-0 relative">
                <span class="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" style="animation: ping 1s cubic-bezier(0,0,0.2,1) infinite"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span class="text-xs text-white/60 whitespace-nowrap">${this.onlineUsers.length} 在线</span>
            </button>
            ${this.isDesktop
              ? html`
              <button class="flex-1 py-2 px-3 hover:bg-white/[0.06] rounded-lg transition-colors flex items-center justify-center gap-1.5" @click=${() => this.dispatchEvent(new CustomEvent('show-play-history'))}>
                ${unsafeSVG(icons.history(16, 'text-white/60'))}
                <span class="text-xs text-white/60">历史</span>
              </button>
              <button class="flex-1 py-2 px-3 hover:bg-white/[0.06] rounded-lg transition-colors flex items-center justify-center gap-1.5" @click=${() => this.dispatchEvent(new CustomEvent('share-room'))}>
                ${unsafeSVG(icons.share2(16, 'text-white/60'))}
                <span class="text-xs text-white/60">分享</span>
              </button>
            `
              : nothing}
            <button class="py-2 px-2 md:px-3 hover:bg-white/[0.06] rounded-lg transition-colors flex items-center justify-center gap-1.5 ${this.isDesktop ? 'flex-1' : ''}" @click=${() => this.dispatchEvent(new CustomEvent('show-settings'))}>
              ${unsafeSVG(icons.settings(16, 'text-white/60'))}
              <span class="text-xs text-white/60">设置</span>
            </button>
            <button class="py-2 px-2 md:px-3 hover:bg-white/[0.06] rounded-lg transition-colors flex items-center justify-center gap-1.5 ${this.isDesktop ? 'flex-1' : ''}" @click=${() => this.dispatchEvent(new CustomEvent('show-help'))}>
              ${unsafeSVG(icons.helpCircle(16, 'text-white/60'))}
              <span class="text-xs text-white/60">帮助</span>
            </button>
          </div>
        </div>

        <!-- Online Users Popup -->
        ${this.showOnlineUsers
          ? html`
          <div class="online-users-popup absolute top-0 left-0 right-0 mt-[120px] glass rounded-2xl p-4 z-[100] max-h-[280px] md:max-h-[300px] overflow-hidden flex flex-col">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                ${unsafeSVG(icons.users(16, 'text-white/60'))}
                <span class="text-xs font-medium text-white/80">在线用户</span>
              </div>
              <button class="p-1 hover:bg-white/10 rounded-full transition-colors" @click=${() => this.showOnlineUsers = false}>
                ${unsafeSVG(icons.x(16, 'text-white/60'))}
              </button>
            </div>
            <div class="space-y-2 overflow-y-auto pr-1 custom-scrollbar">
              ${this.onlineUsers.map(user => html`
                <div class="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] hover:bg-white/5 border border-white/5 transition-all">
                  <div class="relative">
                    <img src=${user.avatar} alt=${user.name} class="w-10 h-10 rounded-lg object-cover">
                    <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black"></div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-xs font-bold truncate">${user.name}</div>
                    <div class="text-[10px] text-white/40 truncate">在线</div>
                  </div>
                </div>
              `)}
            </div>
          </div>
        `
          : nothing}

        <!-- Chat Messages Card -->
        <div class="glass rounded-3xl flex-1 flex flex-col overflow-hidden min-h-[200px]">
          <div class="p-3 border-b border-white/5 shrink-0">
            <div class="flex items-center gap-2 text-xs font-bold text-white/60 uppercase tracking-wider">
              ${unsafeSVG(icons.messageSquare(14))}
              聊天
            </div>
          </div>
          <div ${(el: Element | undefined) => {
            if (el instanceof HTMLElement)
              this.chatContainerEl = el
          }}
            class="flex-1 overflow-y-auto space-y-5 relative px-3 pt-3 chat-messages-container">
            ${this.chatMessages.map((msg) => {
              const isSelf = this.isCurrentUser(msg.user.name)
              const isFeibi = this.bubbleStyle === 'feibi'
              return html`
                <div class="flex gap-3 items-start chat-message-item ${isSelf ? 'flex-row-reverse' : ''}">
                  <img src=${msg.user.avatar} alt=${msg.user.name} class="w-10 h-10 rounded-full shrink-0 object-cover">
                  <div class="flex-1 min-w-0 ${isSelf ? 'text-right' : ''}">
                    <div class="flex items-center gap-2 mb-0.5 ${isSelf ? 'flex-row-reverse' : ''}">
                      <span class="font-semibold text-sm leading-none py-2 ${isSelf ? 'text-[#D4A853]' : 'text-white/70'}">${msg.user.name}</span>
                    </div>
                    <div class="flex items-end gap-2 ${isSelf ? 'flex-row-reverse' : ''}">
                      <div class="relative">
                        <div class="chat-bubble text-sm leading-relaxed break-words inline-block text-left relative
                          ${isSelf ? 'chat-bubble-self' : 'chat-bubble-other'}
                          ${isFeibi ? 'chat-bubble-feibi' : ''}">
                          ${msg.content}
                        </div>
                        ${isFeibi && isSelf ? html`<img src="/feibi.png" class="feibi-avatar" alt="菲比">` : nothing}
                      </div>
                      <span class="text-[10px] text-white/30 pb-1">${formatTimeHH_MM(msg.timestamp)}</span>
                    </div>
                  </div>
                </div>
              `
            })}
          </div>
          <div class="p-3 bg-black/20 shrink-0">
            <div class="relative">
              <input
                .value=${this.newMessage}
                type="text"
                placeholder="发送消息..."
                class="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:bg-white/[0.06] focus:border-[#D4A853]/30 transition-all"
                @input=${(e: InputEvent) => this.newMessage = (e.target as HTMLInputElement).value}
                @keydown=${(e: KeyboardEvent) => {
                  if (e.key === 'Enter')
                    this.handleSendMessage()
                }}
              >
              <button
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all duration-200
                  ${this.newMessage.trim() ? 'text-[#D4A853] hover:bg-[#D4A853]/10 hover:scale-110 active:scale-95' : 'text-white/20'}"
                ?disabled=${!this.newMessage.trim()}
                @click=${this.handleSendMessage}
              >
                ${unsafeSVG(icons.send(18))}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>
        .chat-messages-container::-webkit-scrollbar { width: 4px; }
        .chat-messages-container::-webkit-scrollbar-track { background: transparent; }
        .chat-messages-container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .chat-bubble { padding: 8px 12px; border-radius: 12px; max-width: min(280px, calc(100vw - 140px)); word-wrap: break-word; }
        @media (min-width: 768px) { .chat-bubble { max-width: 400px; } }
        .chat-bubble-feibi { background: #ffffff !important; color: #000000 !important; border-radius: 14px !important; box-shadow: 1px 1px 0 #3f3f3f !important; font-weight: 600; }
        .chat-bubble-feibi.chat-bubble-self { border-bottom-right-radius: 2px !important; z-index: 5; position: relative; }
        .chat-bubble-feibi.chat-bubble-other { border-bottom-left-radius: 2px !important; }
        .feibi-avatar { position: absolute; right: -25px; bottom: -20px; width: 40px; height: 40px; object-fit: contain; pointer-events: none; z-index: 0; }
        .chat-bubble-self { background: #D4A853; color: #0C0A09; border-bottom-right-radius: 4px; }
        .chat-bubble-other { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.9); border-bottom-left-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05) inset; backdrop-filter: blur(10px); }
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
      </style>
    `
  }
}
