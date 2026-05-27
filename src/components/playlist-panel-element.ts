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
    return html`
      <div class="glass rounded-2xl h-full flex flex-col overflow-hidden min-h-[200px]">
        <div class="p-4 border-b border-white/[0.04] flex items-center justify-between shrink-0">
          <h3 class="font-semibold flex items-center gap-2 text-sm text-white/80">
            ${unsafeSVG(icons.listMusic(18, 'text-[#D4A853]'))}
            待播列表
          </h3>
          <span class="text-xs bg-white/[0.06] px-2.5 py-1 rounded-full text-white/50">${this.playlist.length} 首</span>
        </div>
        <div class="flex-1 overflow-y-auto space-y-0.5">
          ${this.playlist.map((song, index) => html`
            <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors group ${index === 0 ? 'bg-white/[0.02]' : ''}">
              <img src=${song.cover} alt=${song.title}
                class="w-10 h-10 rounded-lg object-cover shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                @click=${() => song.webUrl && window.open(song.webUrl, '_blank')}>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate ${index === 0 ? 'text-[#D4A853]' : 'text-white'}">
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
              ${index !== 0
                ? html`
                <div class="flex items-center gap-1 transition-opacity ${this.isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}">
                  <button class="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors" @click=${() => this.dispatchEvent(new CustomEvent('song-like', { detail: { index, title: song.title } }))}>
                    ${unsafeSVG(icons.heart(14, 'text-white/50'))}
                  </button>
                  <button class="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors" @click=${() => this.dispatchEvent(new CustomEvent('song-delete', { detail: { songName: song.title } }))}>
                    ${unsafeSVG(icons.trash2(14, 'text-white/50'))}
                  </button>
                </div>
              `
                : ''}
            </div>
          `)}
        </div>
        <div class="p-3 border-t border-white/5 shrink-0">
          <button class="w-full py-2.5 rounded-xl bg-[#D4A853] hover:bg-[#C49A4A] text-[#0C0A09] text-sm font-medium transition-all duration-150 shadow-lg shadow-[#D4A853]/15 active:scale-[0.97] active:shadow-none"
            @click=${() => this.dispatchEvent(new CustomEvent('show-music-search'))}>
            点歌
          </button>
        </div>
      </div>
    `
  }
}
