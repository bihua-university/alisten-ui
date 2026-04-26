import type { Song } from '@/types'
import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { playerStore } from '@/stores/player-store'
import { icons } from '@/utils/icons'
import { processUser } from '@/utils/user'

@customElement('alisten-playlist-panel')
export class PlaylistPanelElement extends LitElement {
  createRenderRoot() {
    return this
  }

  @property({ type: Boolean }) isDesktop = false
  @state() private playlist: Song[] = []

  connectedCallback() {
    super.connectedCallback()
    playerStore.addEventListener('change', () => {
      this.playlist = playerStore.state.playlist.map((song: Song) => ({
        ...song,
        requestedBy: song.requestedBy ? processUser(song.requestedBy) : undefined,
      }))
    })
  }

  render() {
    return html`
      <div class="glass rounded-3xl h-full flex flex-col overflow-hidden min-h-[200px]">
        <div class="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
          <h3 class="font-bold flex items-center gap-2 text-sm">
            ${unsafeSVG(icons.listMusic(18, 'text-indigo-400'))}
            待播列表
          </h3>
          <span class="text-xs bg-white/10 px-2 py-0.5 rounded-full">${this.playlist.length} 首</span>
        </div>
        <div class="flex-1 overflow-y-auto space-y-1">
          ${this.playlist.map((song, index) => html`
            <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group ${index === 0 ? 'bg-white/[0.03]' : ''}">
              <img src=${song.cover} alt=${song.title}
                class="w-10 h-10 rounded-lg object-cover shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                @click=${() => song.webUrl && window.open(song.webUrl, '_blank')}>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate ${index === 0 ? 'text-purple-400' : 'text-white'}">${song.title}</div>
                <div class="text-xs text-white/40 truncate">${song.artist}</div>
              </div>
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="p-1.5 hover:bg-white/10 rounded-lg transition-colors" @click=${() => this.dispatchEvent(new CustomEvent('song-like', { detail: { index, title: song.title } }))}>
                  ${unsafeSVG(icons.heart(14, 'text-white/60'))}
                </button>
                <button class="p-1.5 hover:bg-white/10 rounded-lg transition-colors" @click=${() => this.dispatchEvent(new CustomEvent('song-delete', { detail: { songName: song.title } }))}>
                  ${unsafeSVG(icons.trash2(14, 'text-white/60'))}
                </button>
              </div>
            </div>
          `)}
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
