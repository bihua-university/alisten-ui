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
      <div class="glass rounded-3xl p-4 flex items-center gap-4 shrink-0 hover:bg-white/[0.05] transition-all duration-300">
        <!-- Album Art -->
        <div class="rounded-xl bg-white/10 shrink-0 overflow-hidden flex items-center justify-center album-art-container ${this.isDesktop ? 'w-14 h-14 md:w-16 md:h-16' : 'w-14 h-14'}">
          ${song?.cover
            ? html`
            <img src=${song.cover} alt=${song.title} class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
          `
            : html`<span class="text-2xl">🎵</span>`}
        </div>

        <!-- Info & Progress -->
        <div class="flex-1 min-w-0 flex flex-col justify-center gap-2">
          <div class="flex justify-between items-end">
            <div class="min-w-0">
              <h2 class="font-bold text-white truncate ${this.isDesktop ? 'text-base md:text-lg' : 'text-base'}">
                ${song?.title || '暂无歌曲'}
              </h2>
              <p class="text-white/60 truncate ${this.isDesktop ? 'text-xs md:text-sm' : 'text-xs'}">
                ${song?.artist || '未知艺术家'}
              </p>
            </div>
            <div class="text-white/40 font-mono mb-0.5 ${this.isDesktop ? 'text-[10px] md:text-xs' : 'text-[10px]'}">
              <span ${ref((el: Element | undefined) => {
                if (el instanceof HTMLElement) {
                  this.timeLabelEl = el
                  this.timeLabelEl.textContent = `${formatTime(currentTime)} / ${formatTime(durationSec)}`
                }
              })}></span>
            </div>
          </div>
          <!-- Progress Bar -->
          <div class="h-1.5 bg-white/10 rounded-full overflow-hidden relative">
            <div ${ref((el: Element | undefined) => {
              if (el instanceof HTMLElement)
                this.progressBarEl = el
            })}
              class="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full origin-left will-change-transform transition-transform duration-150 ease-linear player-progress-bar"
              style="transform: scaleX(${durationSec > 0 ? Math.min(1, Math.max(0, currentTime / durationSec)) : 0})"></div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 pl-2 border-l border-white/10 ml-2">
          <button
            ?disabled=${this.isSkipping}
            class="p-2 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${this.isSkipping ? 'opacity-50 cursor-not-allowed' : ''}"
            title="切歌"
            @click=${this.handleSkipSong}
          >
            ${unsafeSVG(icons.skipForward(18, `text-white/70 transition-transform ${this.isSkipping ? 'animate-spin' : ''}`))}
          </button>

          ${this.isDesktop
            ? html`
            <div class="relative volume-popup">
              <button class="volume-toggle-btn p-2 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${this.showVolumePopup ? 'bg-white/10 scale-110' : ''}"
                @click=${this.handleVolumeToggle}>
                ${unsafeSVG(icons.volume2(18, 'text-white/70'))}
              </button>
              ${this.showVolumePopup
                ? html`
                <div class="absolute bottom-full right-0 mb-2 bg-[#121214]/95 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl border border-white/10 z-50 w-48" @click=${this.handleVolumePopupClick}>
                  <div class="text-xs text-white/60 mb-2">音量 ${Math.round(this.playerState.volume)}%</div>
                  <div class="h-2 bg-white/10 rounded-full cursor-pointer relative" @click=${this.handleVolumeClick}>
                    <div class="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full volume-bar" style="width: ${this.playerState.volume}%"></div>
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
        .album-art-container { transition: all 0.3s ease; }
        .album-art-container:hover { transform: scale(1.05); }
      </style>
    `
  }
}
