import type { Song } from '@/types'
import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { playerStore } from '@/stores/player-store'
import { icons } from '@/utils/icons'
import { isMobileDevice, onMobileDeviceChange } from '@/utils/mobile'
import { processUser } from '@/utils/user'

@customElement('alisten-playlist-panel')
export class PlaylistPanelElement extends LitElement {
  createRenderRoot() {
    return this
  }

  @property({ type: Boolean }) isDesktop = false
  @state() private playlist: Song[] = []
  @state() private queueCurrent: Song | null = null
  @state() private isMobile = false
  private unsubscribeMobileChange: (() => void) | null = null

  connectedCallback() {
    super.connectedCallback()
    this.isMobile = isMobileDevice()
    // 媒体查询订阅：替代自带 resize 监听，避免移动端滚动时反复重算
    this.unsubscribeMobileChange = onMobileDeviceChange((value) => {
      this.isMobile = value
    })
    this.syncFromStore()
    playerStore.addEventListener('change', this.handleStoreChange)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    playerStore.removeEventListener('change', this.handleStoreChange)
    this.unsubscribeMobileChange?.()
    this.unsubscribeMobileChange = null
  }

  private handleStoreChange = () => {
    this.syncFromStore()
  }

  private syncFromStore() {
    const adapt = (song: Song): Song => ({
      ...song,
      requestedBy: song.requestedBy ? processUser(song.requestedBy) : undefined,
    })
    this.playlist = playerStore.state.playlist.map(adapt)
    this.queueCurrent = playerStore.state.queueCurrent
      ? adapt(playerStore.state.queueCurrent)
      : null
  }

  private renderSongRow(song: Song, isCurrent: boolean) {
    return html`
      <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group ${isCurrent ? 'bg-white/[0.03]' : ''}">
        <img src=${song.cover} alt=${song.title}
          class="w-10 h-10 rounded-lg object-cover shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          @click=${() => song.webUrl && window.open(song.webUrl, '_blank')}>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium truncate ${isCurrent ? 'text-purple-400' : 'text-white'}">
            ${song.title}<span class="text-white/40 font-normal"> · ${song.artist}</span>
          </div>
          ${song.requestedBy
            ? html`
            <div class="flex items-center gap-1 mt-0.5">
              <img src=${song.requestedBy.avatar} class="w-3.5 h-3.5 rounded-full object-cover shrink-0" alt="">
              <span class="text-xs text-white/40 truncate">${song.requestedBy.name}</span>
            </div>
          `
            : ''}
        </div>
        ${!isCurrent && song.id && song.source
          ? html`
          <div class="flex items-center gap-1 transition-opacity ${this.isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}">
            <button class="p-1.5 hover:bg-white/10 rounded-lg transition-colors" @click=${() => this.dispatchEvent(new CustomEvent('song-like', { detail: { id: song.id, source: song.source } }))}>
              ${unsafeSVG(icons.heart(14, 'text-white/60'))}
            </button>
            <button class="p-1.5 hover:bg-white/10 rounded-lg transition-colors" @click=${() => this.dispatchEvent(new CustomEvent('song-delete', { detail: { id: song.id, source: song.source } }))}>
              ${unsafeSVG(icons.trash2(14, 'text-white/60'))}
            </button>
          </div>
        `
          : ''}
      </div>
    `
  }

  render() {
    const totalCount = this.playlist.length + (this.queueCurrent ? 1 : 0)
    return html`
      <div class="glass rounded-3xl h-full flex flex-col overflow-hidden min-h-[200px]">
        <div class="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
          <h3 class="font-bold flex items-center gap-2 text-sm">
            ${unsafeSVG(icons.listMusic(18, 'text-indigo-400'))}
            待播列表
          </h3>
          <span class="text-xs bg-white/10 px-2 py-0.5 rounded-full">${totalCount} 首</span>
        </div>
        <div class="flex-1 overflow-y-auto space-y-1">
          ${this.queueCurrent ? this.renderSongRow(this.queueCurrent, true) : ''}
          ${this.playlist.map(song => this.renderSongRow(song, false))}
        </div>
        <div class="p-3 border-t border-white/5 shrink-0">
          <button class="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 hover:shadow-purple-500/30 text-sm font-medium transition-all duration-150 shadow-lg shadow-purple-600/20 active:scale-[0.97] active:shadow-none active:bg-purple-700"
            @click=${() => this.dispatchEvent(new CustomEvent('show-music-search'))}>
            点歌
          </button>
        </div>
      </div>
    `
  }
}
