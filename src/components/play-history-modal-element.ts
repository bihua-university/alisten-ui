import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { historyStore } from '@/stores/history-store'
import { playerStore } from '@/stores/player-store'
import { icons } from '@/utils/icons'
import { formatTime } from '@/utils/time'

@customElement('alisten-play-history-modal')
export class PlayHistoryModalElement extends LitElement {
  createRenderRoot() {
    return this
  }

  @state() private searchQuery = ''
  @state() private historyByDate = historyStore.playHistoryByDate
  @state() private stats = historyStore.playStats

  connectedCallback() {
    super.connectedCallback()
    historyStore.addEventListener('change', () => {
      this.historyByDate = historyStore.playHistoryByDate
      this.stats = historyStore.playStats
    })
  }

  private get filteredHistory() {
    if (!this.searchQuery.trim())
      return this.historyByDate
    const filtered = historyStore.searchPlayHistory(this.searchQuery)
    const groups: { [key: string]: typeof filtered } = {}
    filtered.forEach((item) => {
      const dateKey = new Date(item.playedAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
      if (!groups[dateKey])
        groups[dateKey] = []
      groups[dateKey].push(item)
    })
    return Object.entries(groups).map(([date, items]) => ({ date, items }))
  }

  render() {
    return html`
      <alisten-modal title="播放历史" headerIcon="fa-solid fa-history" size="lg" .open=${true} @close=${() => this.dispatchEvent(new CustomEvent('close'))}>
        <div class="space-y-4">
          <!-- Stats -->
          <div class="flex gap-4">
            <div class="flex-1 glass rounded-xl p-4 text-center">
              <div class="text-2xl font-bold text-[var(--accent)]">${this.stats.totalPlays}</div>
              <div class="text-xs text-white/50 mt-1">总播放次数</div>
            </div>
            <div class="flex-1 glass rounded-xl p-4 text-center">
              <div class="text-2xl font-bold text-[var(--accent)]">${formatTime(this.stats.totalDuration)}</div>
              <div class="text-xs text-white/50 mt-1">总时长</div>
            </div>
          </div>

          <!-- Search -->
          <div class="relative">
            <input type="text" .value=${this.searchQuery} placeholder="搜索播放历史..."
              class="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent)]/30 transition-all"
              @input=${(e: InputEvent) => this.searchQuery = (e.target as HTMLInputElement).value}>
          </div>

          <!-- History List -->
          <div class="space-y-4 max-h-[50vh] overflow-y-auto">
            ${this.filteredHistory.length === 0
              ? html`
              <div class="text-center text-white/35 py-8">
                ${unsafeSVG(icons.history(32, 'mx-auto mb-2 opacity-50'))}
                <p>暂无播放历史</p>
              </div>
            `
              : this.filteredHistory.map(group => html`
              <div>
                <h4 class="text-xs font-bold text-white/35 uppercase tracking-wider mb-2 sticky top-0 bg-[#1a1a1f] py-1">${group.date}</h4>
                <div class="space-y-1">
                  ${group.items.map(item => html`
                    <div class="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors group">
                      <img src=${item.song.cover} alt=${item.song.title} class="w-10 h-10 rounded-lg object-cover shrink-0">
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium truncate">${item.song.title}</div>
                        <div class="text-xs text-white/35 truncate">${item.song.artist}</div>
                      </div>
                      <span class="text-xs text-white/25 mr-1">${formatTime(item.song.duration / 1000)}</span>
                      <button class="p-2 rounded-lg bg-transparent hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white transition-all duration-150 opacity-100 md:opacity-0 md:group-hover:opacity-100 active:scale-90 active:bg-[#B08A3E] shrink-0"
                        @click=${() => playerStore.pickMusic(item.song, item.song.source || 'wy')}>
                        ${unsafeSVG(icons.plus(16))}
                      </button>
                    </div>
                  `)}
                </div>
              </div>
            `)}
          </div>

          <!-- Actions -->
          <div class="flex gap-2 pt-2 border-t border-white/5">
            <button class="flex-1 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.06] text-sm text-white/50 transition-colors flex items-center justify-center gap-2"
              @click=${() => historyStore.exportPlayHistory()}>
              ${unsafeSVG(icons.download(14))}
              导出
            </button>
            <button class="flex-1 py-2 rounded-xl bg-white/[0.04] hover:bg-red-500/20 text-sm text-white/50 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
              @click=${() => {
                if (confirm('确定要清空播放历史吗？'))
                  historyStore.clearPlayHistory()
              }}>
              ${unsafeSVG(icons.trash(14))}
              清空
            </button>
          </div>
        </div>
      </alisten-modal>
    `
  }
}
