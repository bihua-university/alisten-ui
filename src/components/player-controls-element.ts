import { html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ref } from 'lit/directives/ref.js'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { playerStore } from '@/stores/player-store'
import { icons } from '@/utils/icons'
import { formatTime } from '@/utils/time'

@customElement('alisten-player-controls')
export class PlayerControlsElement extends LitElement {
  createRenderRoot() {
    return this
  }

  @property({ type: Boolean }) isDesktop = false
  @state() private playerState = playerStore.state
  @state() private showVolumePopup = false
  @state() private isSkipping = false

  private progressBarEl: HTMLElement | null = null
  private timeLabelEl: HTMLElement | null = null

  connectedCallback() {
    super.connectedCallback()
    playerStore.addEventListener('change', this.handlePlayerStoreChange)
    playerStore.registerProgressCallback(this.updateProgressDOM)
    document.addEventListener('click', this.handleDocumentClick)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    playerStore.removeEventListener('change', this.handlePlayerStoreChange)
    playerStore.unregisterProgressCallback(this.updateProgressDOM)
    document.removeEventListener('click', this.handleDocumentClick)
  }

  private handlePlayerStoreChange = () => {
    this.playerState = playerStore.state
  }

  private lastTimeText = ''

  private updateProgressDOM = (time: number) => {
    const song = playerStore.state.currentSong
    const durationSec = (song?.duration || 0) / 1000
    if (this.progressBarEl && durationSec > 0) {
      const scale = Math.min(1, Math.max(0, time / durationSec))
      this.progressBarEl.style.transform = `scaleX(${scale})`
    }
    if (this.timeLabelEl) {
      const newText = `${formatTime(time)} / ${formatTime(durationSec)}`
      if (this.lastTimeText !== newText) {
        this.lastTimeText = newText
        this.timeLabelEl.textContent = newText
      }
    }
  }

  private handleDocumentClick = (e: MouseEvent) => {
    if (!this.showVolumePopup)
      return
    const target = e.target as Element
    if (!target.closest('.volume-popup')) {
      this.showVolumePopup = false
    }
  }

  private handleVolumeToggle = () => {
    this.showVolumePopup = !this.showVolumePopup
  }

  private handleVolumePopupClick = (e: Event) => {
    e.stopPropagation()
  }

  private async handleSkipSong() {
    if (this.isSkipping)
      return
    this.isSkipping = true
    playerStore.skipSong()
    setTimeout(() => {
      this.isSkipping = false
    }, 2000)
  }

  private handleVolumeClick(e: MouseEvent) {
    playerStore.setVolumeFromClick(e)
  }

  render() {
    const song = this.playerState.currentSong
    const durationSec = (song?.duration || 0) / 1000
    const currentTime = this.playerState.currentTime || 0

    return html`
      <div class="rounded-xl p-3.5 flex items-center gap-4 shrink-0 transition-colors duration-200"
        style="background: rgba(20,20,20,0.6); border: 1px solid rgba(255,255,255,0.05);">
        <!-- Album Art -->
        <div class="rounded-lg bg-white/[0.03] shrink-0 overflow-hidden flex items-center justify-center album-art-container ${this.isDesktop ? 'w-12 h-12 md:w-14 md:h-14' : 'w-12 h-12'}">
          ${song?.cover
            ? html`
            <img src=${song.cover} alt=${song.title} class="w-full h-full object-cover">
          `
            : html`<div class="w-full h-full flex items-center justify-center"><div class="w-5 h-5 rounded-full border-2 border-white/20"></div></div>`}
        </div>

        <!-- Info & Progress -->
        <div class="flex-1 min-w-0 flex flex-col justify-center gap-2">
          <div class="flex justify-between items-baseline gap-3">
            <div class="min-w-0">
              <h2 class="font-semibold text-white truncate text-[15px] leading-tight tracking-tight">
                ${song?.title || '暂无歌曲'}
              </h2>
              <p class="text-white/40 truncate text-xs mt-0.5">
                ${song?.artist || '未知艺术家'}
              </p>
            </div>
            <div class="text-white/30 font-mono text-[11px] shrink-0 tabular-nums">
              <span ${ref((el: Element | undefined) => {
                if (el instanceof HTMLElement) {
                  this.timeLabelEl = el
                  this.timeLabelEl.textContent = `${formatTime(currentTime)} / ${formatTime(durationSec)}`
                }
              })}></span>
            </div>
          </div>
          <!-- Progress Bar -->
          <div class="h-[3px] bg-white/[0.08] rounded-full overflow-hidden relative group cursor-pointer">
            <div ${ref((el: Element | undefined) => {
              if (el instanceof HTMLElement)
                this.progressBarEl = el
            })}
              class="absolute top-0 left-0 h-full w-full bg-[#D4A853] rounded-full origin-left will-change-transform transition-transform duration-100 ease-linear"
              style="transform: scaleX(${durationSec > 0 ? Math.min(1, Math.max(0, currentTime / durationSec)) : 0})"></div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-1 pl-3 ml-1 shrink-0" style="border-left: 1px solid rgba(255,255,255,0.06);">
          <button
            ?disabled=${this.isSkipping}
            class="p-2 hover:bg-white/[0.06] rounded-lg transition-all duration-150 active:scale-95 ${this.isSkipping ? 'opacity-40 cursor-not-allowed' : ''}"
            title="切歌"
            @click=${this.handleSkipSong}
          >
            ${unsafeSVG(icons.skipForward(17, `text-white/60 ${this.isSkipping ? 'animate-spin' : ''}`))}
          </button>

          ${this.isDesktop
            ? html`
            <div class="relative volume-popup">
              <button class="volume-toggle-btn p-2 hover:bg-white/[0.06] rounded-lg transition-all duration-150 active:scale-95 ${this.showVolumePopup ? 'bg-white/[0.06]' : ''}"
                @click=${this.handleVolumeToggle}>
                ${unsafeSVG(icons.volume2(17, 'text-white/60'))}
              </button>
              ${this.showVolumePopup
                ? html`
                <div class="absolute bottom-full right-0 mb-2 rounded-xl p-3.5 z-50 w-44" style="background: #141414; border: 1px solid rgba(255,255,255,0.06);" @click=${this.handleVolumePopupClick}>
                  <div class="text-[11px] text-white/40 mb-2.5 font-medium">音量 ${Math.round(this.playerState.volume)}%</div>
                  <div class="h-1.5 bg-white/[0.08] rounded-full cursor-pointer relative" @click=${this.handleVolumeClick}>
                    <div class="absolute top-0 left-0 h-full bg-[#D4A853] rounded-full transition-all" style="width: ${this.playerState.volume}%"></div>
                  </div>
                </div>
              `
                : nothing}
            </div>
          `
            : nothing}
        </div>
      </div>

      <style>
        .album-art-container { transition: opacity 0.3s ease; }
        .album-art-container:hover { opacity: 0.85; }
      </style>
    `
  }
}
