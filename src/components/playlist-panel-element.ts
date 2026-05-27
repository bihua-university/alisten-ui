import type { Song } from '@/types'
import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { playerStore } from '@/stores/player-store'
import { icons } from '@/utils/icons'
import { isMobileDevice } from '@/utils/mobile'
import { processUser } from '@/utils/user'

@customElement('alisten-playlist-panel')
export class PlaylistPanelElement extends LitElement {
  createRenderRoot() {
    return this
  }

  @property({ type: Boolean }) isDesktop = false
  @state() private playlist: Song[] = []
  @state() private isMobile = false
  private _resizeHandler = () => {
    this.isMobile = isMobileDevice()
  }

  connectedCallback() {
    super.connectedCallback()
    this.isMobile = isMobileDevice()
    window.addEventListener('resize', this._resizeHandler)
    playerStore.addEventListener('change', () => {
      this.playlist = playerStore.state.playlist.map((song: Song) => ({
        ...song,
        requestedBy: song.requestedBy ? processUser(song.requestedBy) : undefined,
      }))
    })
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('resize', this._resizeHandler)
  }

  render() {
    const hasSongs = this.playlist.length > 0

    return html`
      <div class="h-full flex flex-col overflow-hidden min-h-[200px]"
        style="background: rgba(17,17,17,0.8); border: 1px solid var(--bg-hover); border-radius: 14px;">
        <!-- Header -->
        <div class="px-4 py-3.5 flex items-center justify-between shrink-0" style="border-bottom: 1px solid var(--bg-hover);">
          <div class="flex items-center gap-2">
            ${unsafeSVG(icons.listMusic(16, 'text-[var(--accent)]'))}
            <h3 class="text-[13px] font-semibold text-white/70 tracking-tight">待播列表</h3>
          </div>
          <span class="text-[11px] px-2 py-0.5 rounded-full text-white/35" style="background: var(--bg-hover);">${this.playlist.length} 首</span>
        </div>

        <!-- List -->
        <div class="flex-1 overflow-y-auto">
          ${hasSongs
            ? html`
              <div class="py-1">
                ${this.playlist.map((song, index) => html`
                  <div class="flex items-center gap-3 mx-1.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.04] transition-colors group ${index === 0 ? 'bg-white/[0.02]' : ''}">
                    <div class="w-9 h-9 rounded-md overflow-hidden shrink-0 bg-white/[0.04]">
                      <img src=${song.cover} alt=${song.title}
                        class="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        @click=${() => song.webUrl && window.open(song.webUrl, '_blank')}>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-[13px] font-medium truncate leading-tight ${index === 0 ? 'text-[var(--accent)]' : 'text-white/90'}">
                        ${song.title}
                      </div>
                      <div class="text-[11px] text-white/35 truncate mt-0.5">
                        ${song.artist}${song.requestedBy ? html` · ${song.requestedBy.name}` : ''}
                      </div>
                    </div>
                    ${index !== 0
                      ? html`
                      <div class="flex items-center gap-0.5 transition-opacity ${this.isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}">
                        <button class="p-1.5 hover:bg-white/[0.06] rounded-md transition-colors" @click=${() => this.dispatchEvent(new CustomEvent('song-like', { detail: { index, title: song.title } }))}>
                          ${unsafeSVG(icons.heart(13, 'text-white/40'))}
                        </button>
                        <button class="p-1.5 hover:bg-white/[0.06] rounded-md transition-colors" @click=${() => this.dispatchEvent(new CustomEvent('song-delete', { detail: { songName: song.title } }))}>
                          ${unsafeSVG(icons.trash2(13, 'text-white/40'))}
                        </button>
                      </div>
                    `
                      : ''}
                  </div>
                `)}
              </div>
            `
            : html`
              <div class="h-full flex flex-col items-center justify-center text-center px-6">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style="background: rgba(255,255,255,0.03);">
                  ${unsafeSVG(icons.music(20, 'text-white/20'))}
                </div>
                <p class="text-sm text-white/30">播放列表为空</p>
                <p class="text-xs text-white/20 mt-1">点击下方按钮点歌</p>
              </div>
            `}
        </div>

        <!-- Footer -->
        <div class="p-3 shrink-0" style="border-top: 1px solid var(--bg-hover);">
          <button class="w-full py-2.5 rounded-lg text-[13px] font-semibold transition-all active:scale-[0.98]"
            style="background: var(--accent); color: var(--bg-base);"
            @mouseenter=${(e: Event) => { (e.target as HTMLElement).style.background = 'var(--accent-hover)' }}
            @mouseleave=${(e: Event) => { (e.target as HTMLElement).style.background = 'var(--accent)' }}
            @click=${() => this.dispatchEvent(new CustomEvent('show-music-search'))}>
            点歌
          </button>
        </div>
      </div>
    `
  }
}
