import { html, LitElement, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { playerStore } from '@/stores/player-store'
import { searchStore } from '@/stores/search-store'
import { websocketStore } from '@/stores/websocket-store'
import { icons } from '@/utils/icons'

function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function setStorageItem(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value))
}

// 页面会话级持久化：模态框关闭后再打开保持搜索状态
let _persistedQuery = ''
let _persistedPlatform = 'wy'
let _persistedSearchMode: 'song' | 'playlist' = 'song'

@customElement('alisten-music-search-modal')
export class MusicSearchModalElement extends LitElement {
  createRenderRoot() {
    return this
  }

  @state() private query = _persistedQuery
  @state() private platform = _persistedPlatform
  @state() private searchMode: 'song' | 'playlist' = _persistedSearchMode
  @state() private searchResults = searchStore.state.searchResults
  @state() private searchCounts = searchStore.state.searchCounts
  @state() private currentPage = searchStore.state.currentPage
  @state() private totalPages = searchStore.state.totalPages
  @state() private pageSize = searchStore.state.pageSize
  @state() private isSearching = false
  @state() private recommendations = playerStore.state.recommendations
  @state() private currentMode: 'search' | 'ai' = getStorageItem(
    'music-modal-mode',
    'search',
  )

  connectedCallback() {
    super.connectedCallback()
    searchStore.addEventListener('change', this.handleSearchStoreChange)
    playerStore.addEventListener('change', this.handlePlayerStoreChange)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    searchStore.removeEventListener('change', this.handleSearchStoreChange)
    playerStore.removeEventListener('change', this.handlePlayerStoreChange)
  }

  private handleSearchStoreChange = () => {
    this.searchResults = searchStore.state.searchResults
    this.searchCounts = searchStore.state.searchCounts
    this.currentPage = searchStore.state.currentPage
    this.totalPages = searchStore.state.totalPages
    this.pageSize = searchStore.state.pageSize
    this.isSearching = false
  }

  private handlePlayerStoreChange = () => {
    this.recommendations = playerStore.state.recommendations
  }

  private setMode(mode: 'search' | 'ai') {
    this.currentMode = mode
    setStorageItem('music-modal-mode', mode)
    if (mode === 'ai' && this.recommendations.length === 0) {
      playerStore.pullRecommendations()
    }
  }

  private clearSearchResults() {
    this.searchResults = []
    this.searchCounts = 0
    this.currentPage = 1
    this.totalPages = 0
    this.isSearching = false
    _persistedQuery = ''
    this.query = ''
    searchStore.clearSearchResults()
  }

  private handleModeToggle(e: Event) {
    const target = e.target as HTMLInputElement
    this.setMode(target.checked ? 'ai' : 'search')
  }

  private handleSearch(page = 1) {
    if (!this.query.trim())
      return

    const nextPage
      = typeof page === 'number' && Number.isFinite(page) ? page : 1

    this.isSearching = true
    _persistedQuery = this.query
    searchStore.setPage(nextPage)
    const action
      = this.searchMode === 'song' ? '/music/search' : '/music/searchsonglist'
    websocketStore.send({
      action,
      data: {
        keyword: this.query.trim(),
        source: this.platform,
        pageIndex: nextPage,
        pageSize: this.pageSize,
      },
    })
  }

  private goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage)
      return
    this.handleSearch(page)
  }

  private pickMusic(result: any) {
    playerStore.pickMusic(result, this.platform)
  }

  private viewPlaylist(result: any) {
    this.searchMode = 'song'
    _persistedSearchMode = 'song'
    this.query = `*${result.id}`
    _persistedQuery = this.query
    this.handleSearch()
  }

  private selectSearchMode(mode: 'song' | 'playlist') {
    this.searchMode = mode
    _persistedSearchMode = mode
    this.clearSearchResults()
  }

  private selectPlatform(platform: string) {
    this.platform = platform
    _persistedPlatform = platform
    this.clearSearchResults()
  }

  private handleClose() {
    this.dispatchEvent(new CustomEvent('close'))
  }

  private renderPageNumbers() {
    const total = this.totalPages
    const current = this.currentPage
    const pages: (number | string)[] = []

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', total)
      } else if (current >= total - 2) {
        pages.push(1, '...', total - 3, total - 2, total - 1, total)
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', total)
      }
    }

    return pages.map((page) => {
      if (page === '...') {
        return html`<span class="px-1.5 py-1 text-xs text-white/25">...</span>`
      }
      const isActive = page === current
      return html`
        <button
          class="w-7 h-7 rounded-lg text-xs transition-colors ${isActive
            ? 'bg-[#D4A853] text-[#0C0A09]'
            : 'text-white/50 hover:bg-white/[0.06] hover:text-white'}"
          @click=${() => this.goToPage(page as number)}
        >
          ${page}
        </button>
      `
    })
  }

  render() {
    return html`
      <div
        class="fixed top-0 left-0 right-0 bottom-0 z-[60] flex items-center justify-center p-0 md:p-8"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/70 backdrop-blur-md"
          @click=${this.handleClose}
        ></div>

        <!-- Modal Container -->
        <div
          class="relative w-full max-w-none md:max-w-[1100px] h-[100dvh] md:h-[85vh] min-h-0 md:min-h-[600px] flex flex-col rounded-none md:rounded-xl overflow-hidden border-0 md:border md:border-white/[0.06] shadow-none md:shadow-2xl"
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
                ${unsafeSVG(icons.search(20, 'text-[#D4A853]'))}
              </div>
              <h2 class="text-xl font-bold text-white">点歌台</h2>
            </div>
            <div class="flex items-center gap-4">
              <!-- AI Toggle -->
              <div class="flex items-center gap-2">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    class="sr-only peer"
                    .checked=${this.currentMode === 'ai'}
                    @change=${this.handleModeToggle}
                  />
                  <div
                    class="relative w-11 h-6 bg-white/[0.06] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#D4A853]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4A853]"
                  ></div>
                </label>
                <span
                  class="text-sm flex items-center gap-1 ${this.currentMode
                  === 'ai'
                    ? 'text-[#D4A853]'
                    : 'text-white/35'}"
                >
                  <i class="fa-solid fa-robot text-xs"></i>
                  AI推荐
                </span>
              </div>
              <button
                class="w-10 h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.06] flex items-center justify-center text-white/35 hover:text-white transition-all"
                @click=${this.handleClose}
              >
                <i class="fa-solid fa-times text-sm"></i>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 flex flex-col min-h-0 p-6 gap-4">
            ${this.currentMode === 'search'
              ? html`
                  <!-- Search Input -->
                  <div class="relative group flex-shrink-0">
                    <div
                      class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                    >
                      ${unsafeSVG(
                        icons.search(
                          18,
                          'text-white/25 group-focus-within:text-[#D4A853] transition-colors',
                        ),
                      )}
                    </div>
                    <input
                      type="text"
                      .value=${this.query}
                      placeholder="搜索歌曲、歌手、专辑..."
                      class="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-3.5 pl-12 pr-14 text-base text-white placeholder-white/30 focus:outline-none focus:border-[#D4A853]/30 focus:bg-white/[0.06] transition-all"
                      @input=${(e: InputEvent) => {
                        this.query = (e.target as HTMLInputElement).value
                        _persistedQuery = this.query
                      }}
                      @keydown=${(e: KeyboardEvent) => {
                        if (e.key === 'Enter')
                          this.handleSearch()
                      }}
                    />
                    <button
                      class="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-[#D4A853] hover:bg-[#C49A4A] transition-colors  flex items-center justify-center"
                      @click=${() => this.handleSearch()}
                    >
                      ${unsafeSVG(icons.search(16, 'text-white'))}
                    </button>
                  </div>

                  <!-- Mode Tabs -->
                  <div
                    class="flex-shrink-0 flex p-1 bg-white/[0.04] rounded-xl border border-white/5"
                  >
                    ${(
                      [
                        {
                          id: 'song' as const,
                          name: '单曲',
                          icon: 'fa-solid fa-music',
                        },
                        {
                          id: 'playlist' as const,
                          name: '歌单',
                          icon: 'fa-solid fa-list-ul',
                        },
                      ] as const
                    ).map(
                      m => html`
                        <button
                          class="flex-1 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all whitespace-nowrap
                    ${this.searchMode === m.id
                      ? 'bg-[#D4A853] text-[#0C0A09] '
                      : 'text-white/50 hover:text-white hover:bg-white/5'}"
                          @click=${() => this.selectSearchMode(m.id)}
                        >
                          <i class="${m.icon} text-xs"></i>
                          ${m.name}
                        </button>
                      `,
                    )}
                  </div>

                  <!-- Platform Tabs -->
                  <div
                    class="flex-shrink-0 flex p-1 bg-white/[0.04] rounded-xl border border-white/5"
                  >
                    ${[
                      { id: 'wy', name: '网易云', icon: 'fa-solid fa-music' },
                      { id: 'qq', name: 'QQ音乐', icon: 'fa-brands fa-qq' },
                      { id: 'bili', name: 'B站', icon: 'fa-solid fa-tv' },
                    ].map(
                      p => html`
                        <button
                          class="flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all whitespace-nowrap
                    ${this.platform === p.id
                      ? 'bg-[#D4A853] text-[#0C0A09] '
                      : 'text-white/50 hover:text-white hover:bg-white/5'}"
                          @click=${() => this.selectPlatform(p.id)}
                        >
                          <i class="${p.icon} text-xs"></i>
                          ${p.name}
                        </button>
                      `,
                    )}
                  </div>

                  <!-- Results Area -->
                  <div
                    class="flex-1 min-h-0 bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden flex flex-col"
                  >
                    ${this.isSearching
                      ? html`
                          <div
                            class="flex-1 flex flex-col items-center justify-center text-white/35"
                          >
                            <div
                              class="w-10 h-10 border-3 border-[#D4A853]/20 border-t-[#D4A853] rounded-full animate-spin mb-3"
                            ></div>
                            <p class="text-sm">正在搜索...</p>
                          </div>
                        `
                      : this.searchResults.length === 0
                        ? html`
                            <div
                              class="flex-1 flex flex-col items-center justify-center text-white/35"
                            >
                              <div
                                class="w-20 h-20 bg-gradient-to-br bg-[#D4A853]/10 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-[#D4A853]/10"
                              >
                                ${unsafeSVG(
                                  icons.music(28, 'text-[#D4A853]/60'),
                                )}
                              </div>
                              <p class="text-lg font-semibold text-white/50">
                                准备搜索
                              </p>
                              <p class="text-sm text-white/25 mt-1">
                                输入关键词开始搜索歌曲
                              </p>
                            </div>
                          `
                        : html`
                            <div
                              class="px-4 py-3 border-b border-white/5 flex items-center justify-between shrink-0"
                            >
                              <span class="text-xs text-white/35"
                                >找到 ${this.searchCounts} 个结果</span
                              >
                            </div>
                            <div class="flex-1 overflow-y-auto p-2">
                              <div class="flex flex-col gap-1">
                                ${this.searchResults.map(
                                  (result: any) => html`
                                    <div
                                      class="flex items-center gap-3 p-3 rounded-xl transition-colors group md:hover:bg-white/5"
                                    >
                                      <img
                                        src=${result.cover || ''}
                                        alt=${result.title}
                                        class="w-12 h-12 rounded-lg object-cover shrink-0 bg-white/5"
                                      />
                                      <div class="flex-1 min-w-0">
                                        <div
                                          class="text-sm font-medium text-white truncate"
                                        >
                                          ${result.title}
                                        </div>
                                        <div
                                          class="text-xs text-white/35 truncate"
                                        >
                                          ${this.searchMode === 'playlist'
                                            ? html`${result.creator
                                            || ''}${result.songCount
                                              ? ` · ${result.songCount}首`
                                              : ''}`
                                            : result.artist || ''}
                                        </div>
                                      </div>
                                      ${this.searchMode === 'playlist'
                                        ? html`
                                            <button
                                              class="p-2 rounded-lg bg-transparent hover:bg-[#D4A853] text-[#D4A853] hover:text-white transition-all duration-150 opacity-100 md:opacity-0 md:group-hover:opacity-100 active:scale-90 active:bg-[#B08A3E] shrink-0"
                                              @click=${() =>
                                                this.viewPlaylist(result)}
                                            >
                                              ${unsafeSVG(icons.eye(16))}
                                            </button>
                                          `
                                        : html`
                                            <button
                                              class="p-2 rounded-lg bg-transparent hover:bg-[#D4A853] text-[#D4A853] hover:text-white transition-all duration-150 opacity-100 md:opacity-0 md:group-hover:opacity-100 active:scale-90 active:bg-[#B08A3E] shrink-0"
                                              @click=${() =>
                                                this.pickMusic(result)}
                                            >
                                              ${unsafeSVG(icons.plus(16))}
                                            </button>
                                          `}
                                    </div>
                                  `,
                                )}
                              </div>
                            </div>
                            ${this.totalPages > 1
                              ? html`
                                  <div
                                    class="px-4 py-3 border-t border-white/5 flex items-center justify-between shrink-0"
                                  >
                                    <span class="text-xs text-white/35"
                                      >第 ${this.currentPage} /
                                      ${this.totalPages} 页</span
                                    >
                                    <div class="flex items-center gap-1">
                                      <button
                                        class="px-2 py-1 rounded-lg text-xs transition-colors ${this
                                          .currentPage <= 1
                                          ? 'text-white/20 cursor-not-allowed'
                                          : 'text-white/50 hover:bg-white/[0.06] hover:text-white'}"
                                        ?disabled=${this.currentPage <= 1}
                                        @click=${() =>
                                          this.goToPage(this.currentPage - 1)}
                                      >
                                        上一页
                                      </button>
                                      ${this.renderPageNumbers()}
                                      <button
                                        class="px-2 py-1 rounded-lg text-xs transition-colors ${this
                                          .currentPage >= this.totalPages
                                          ? 'text-white/20 cursor-not-allowed'
                                          : 'text-white/50 hover:bg-white/[0.06] hover:text-white'}"
                                        ?disabled=${this.currentPage
                                        >= this.totalPages}
                                        @click=${() =>
                                          this.goToPage(this.currentPage + 1)}
                                      >
                                        下一页
                                      </button>
                                    </div>
                                  </div>
                                `
                              : nothing}
                          `}
                  </div>
                `
              : html`
                  <!-- AI Recommendations -->
                  <div class="flex-1 min-h-0 flex flex-col gap-4">
                    <div
                      class="flex items-center justify-between flex-shrink-0"
                    >
                      <h3
                        class="text-base md:text-lg font-medium flex items-center gap-2"
                      >
                        <i class="fa-solid fa-robot text-[#D4A853]"></i>
                        AI为您推荐
                        ${this.recommendations.length > 0
                          ? html`<span class="text-xs text-white/35"
                              >(${this.recommendations.length}首)</span
                            >`
                          : nothing}
                      </h3>
                      <button
                        class="text-white/35 hover:text-white transition-colors w-7 h-7 flex items-center justify-center rounded-lg border border-white/[0.06] hover:border-white/20 hover:bg-white/5"
                        @click=${() => playerStore.pullRecommendations()}
                      >
                        <i class="fa-solid fa-refresh text-xs"></i>
                      </button>
                    </div>
                    <div
                      class="flex-1 min-h-0 bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden flex flex-col"
                    >
                      ${this.recommendations.length > 0
                        ? html`
                            <div class="flex-1 overflow-y-auto p-2">
                              <div class="flex flex-col gap-1">
                                ${this.recommendations.map(
                                  (result: any) => html`
                                    <div
                                      class="flex items-center gap-3 p-3 rounded-xl transition-colors group md:hover:bg-white/5"
                                    >
                                      <img
                                        src=${result.cover || ''}
                                        alt=${result.title}
                                        class="w-12 h-12 rounded-lg object-cover shrink-0 bg-white/5"
                                      />
                                      <div class="flex-1 min-w-0">
                                        <div
                                          class="text-sm font-medium text-white truncate"
                                        >
                                          ${result.title}
                                        </div>
                                        <div
                                          class="text-xs text-white/35 truncate"
                                        >
                                          ${result.artist || ''}
                                        </div>
                                      </div>
                                      <button
                                        class="p-2 rounded-lg bg-transparent hover:bg-[#D4A853] text-[#D4A853] hover:text-white transition-all duration-150 opacity-100 md:opacity-0 md:group-hover:opacity-100 active:scale-90 active:bg-[#B08A3E] shrink-0"
                                        @click=${() => this.pickMusic(result)}
                                      >
                                        ${unsafeSVG(icons.plus(16))}
                                      </button>
                                    </div>
                                  `,
                                )}
                              </div>
                            </div>
                          `
                        : html`
                            <div
                              class="flex-1 flex flex-col items-center justify-center text-white/35"
                            >
                              <i
                                class="fa-solid fa-robot text-4xl mb-4 opacity-50"
                              ></i>
                              <p class="text-lg mb-2">AI正在为您生成推荐...</p>
                            </div>
                          `}
                    </div>
                  </div>
                `}
          </div>
        </div>
      </div>
    `
  }
}
