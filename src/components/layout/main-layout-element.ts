import { html, LitElement, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { performanceStore } from '@/stores/performance-store'
import { playerStore } from '@/stores/player-store'
import { icons } from '@/utils/icons'
import { isScrollableElement } from '@/utils/mobile'

@customElement('alisten-main-layout')
export class MainLayoutElement extends LitElement {
  createRenderRoot() {
    return this
  }

  @state() private desktopRightTab: 'playlist' | 'chat' = 'playlist'
  @state() private activeTab: 'lyrics' | 'playlist' | 'room' = 'lyrics'
  @state() private isDragging = false
  @state() private isTransitioning = false
  @state() private dragOffset = 0
  @state() private isMinimalMode = false
  @state() private currentSong = playerStore.state.currentSong

  private touchStartX = 0
  private touchStartY = 0
  private touchCurrentX = 0
  private startTime = 0
  private isScrolling = false
  private performanceLevel = performanceStore.state.level

  connectedCallback() {
    super.connectedCallback()
    playerStore.addEventListener('change', () => {
      this.currentSong = playerStore.state.currentSong
    })
    performanceStore.addEventListener('change', () => {
      this.performanceLevel = performanceStore.state.level
      this.isMinimalMode = performanceStore.state.level === 'off'
    })
    this.isMinimalMode = this.performanceLevel === 'off'
    window.addEventListener('keydown', this.handleKeydown)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('keydown', this.handleKeydown)
  }

  private handleKeydown = (e: KeyboardEvent) => {
    if (window.innerWidth >= 768)
      return
    if (e.key === 'ArrowLeft')
      this.switchTab('prev')
    else if (e.key === 'ArrowRight')
      this.switchTab('next')
  }

  private switchTab(direction: 'next' | 'prev') {
    const tabs: Array<'lyrics' | 'playlist' | 'room'> = ['lyrics', 'playlist', 'room']
    const currentIndex = tabs.indexOf(this.activeTab)
    if (direction === 'next' && currentIndex < tabs.length - 1) {
      this.activeTab = tabs[currentIndex + 1]
    } else if (direction === 'prev' && currentIndex > 0) {
      this.activeTab = tabs[currentIndex - 1]
    }
  }

  private isTouchOnScrollable(e: TouchEvent): boolean {
    const target = e.target as Element
    return !!isScrollableElement(target)
  }

  private handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    this.touchStartX = touch.clientX
    this.touchStartY = touch.clientY
    this.touchCurrentX = touch.clientX
    this.startTime = Date.now()
    this.isScrolling = false

    if (this.isMinimalMode)
      return
    if (this.isTouchOnScrollable(e))
      return

    this.isDragging = true
    this.isTransitioning = false
    this.dragOffset = 0
  }

  private handleTouchMove = (e: TouchEvent) => {
    if (this.isMinimalMode)
      return

    if (!this.isDragging && !this.isScrolling) {
      const touch = e.touches[0]
      const deltaX = touch.clientX - this.touchStartX
      const deltaY = touch.clientY - this.touchStartY

      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
        this.isScrolling = true
        return
      }
      if (Math.abs(deltaX) > 10) {
        this.isDragging = true
        this.isTransitioning = false
      }
    }

    if (this.isDragging) {
      e.preventDefault()
      const touch = e.touches[0]
      this.touchCurrentX = touch.clientX
      let offset = this.touchCurrentX - this.touchStartX
      const tabIndex = this.activeTab === 'lyrics' ? 0 : this.activeTab === 'playlist' ? 1 : 2
      const screenWidth = window.innerWidth

      if (tabIndex === 0) {
        if (offset > 0)
          offset = Math.min(offset * 0.05, 20)
        else offset = Math.max(offset, -screenWidth)
      } else if (tabIndex === 1) {
        offset = Math.max(Math.min(offset, screenWidth), -screenWidth)
      } else if (tabIndex === 2) {
        if (offset < 0)
          offset = Math.max(offset * 0.05, -20)
        else offset = Math.min(offset, screenWidth)
      }
      this.dragOffset = offset
    }
  }

  private handleTouchEnd = (e: TouchEvent) => {
    const touch = e.changedTouches[0]
    const endX = touch.clientX
    const endTime = Date.now()
    const deltaX = endX - this.touchStartX
    const deltaTime = endTime - this.startTime
    const velocity = Math.abs(deltaX) / deltaTime
    const screenWidth = window.innerWidth
    const distanceThreshold = screenWidth * 0.25
    const velocityThreshold = 0.5
    const isQuickSwipe = velocity > velocityThreshold && Math.abs(deltaX) > 30
    const isLongSwipe = Math.abs(deltaX) > distanceThreshold

    if (this.isMinimalMode) {
      if (isQuickSwipe || isLongSwipe) {
        this.switchTab(deltaX < 0 ? 'next' : 'prev')
      }
      return
    }

    this.isTransitioning = true
    this.isDragging = false

    if (isQuickSwipe || isLongSwipe) {
      this.switchTab(deltaX < 0 ? 'next' : 'prev')
    }
    this.dragOffset = 0
  }

  private handleTouchCancel = () => {
    if (this.isMinimalMode)
      return
    this.isTransitioning = true
    this.isDragging = false
    this.dragOffset = 0
    this.isScrolling = false
  }

  private get baseTransform(): number {
    const tabIndex = this.activeTab === 'lyrics' ? 0 : this.activeTab === 'playlist' ? 1 : 2
    return -tabIndex * 100
  }

  private get panelsStyle() {
    if (this.isDragging) {
      const totalOffset = this.baseTransform + (this.dragOffset / window.innerWidth) * 100
      return `transform: translateX(${totalOffset}vw)`
    }
    return `transform: translateX(${this.baseTransform}vw)`
  }

  render() {
    const showBg = this.currentSong?.cover && !this.isMinimalMode
    const perfClasses = classMap({
      'performance-low': this.performanceLevel === 'low',
      'performance-off': this.performanceLevel === 'off',
    })

    return html`
      <div class="root-container overflow-x-hidden ${perfClasses}">
        <div class="main-layout-bg app-viewport flex flex-col items-center relative overflow-hidden font-sans text-white">
          <!-- Background Abstract Shapes -->
          <div class="bg-shapes performance-bg-shape absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>
          <div class="bg-shapes performance-bg-shape absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>

          <!-- Dynamic Song Background -->
          ${showBg
            ? html`
            <div class="song-bg absolute inset-0 z-0">
              <img src=${this.currentSong!.cover} alt=${this.currentSong!.title}
                class="w-full h-full object-cover blur-3xl scale-110 opacity-30 transition-all duration-1000">
              <div class="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/90"></div>
            </div>
          `
            : nothing}

          <!-- Main Layout Container -->
          <div class="z-10 w-full md:max-w-[95%] h-full flex flex-col gap-6 pt-4 px-0 md:p-6 md:mt-0 md:pb-6 overflow-hidden" style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));">
            <!-- Desktop Layout -->
            <div class="hidden md:flex md:flex-row gap-6 h-full">
              <!-- Left Panel: Player & Lyrics -->
              <div class="flex-[3] flex flex-col min-h-0 min-w-0 relative">
                <alisten-lyrics-panel class="mb-4 flex-1 min-h-0 flex flex-col"></alisten-lyrics-panel>
                <alisten-player-controls class="shrink-0" .isDesktop=${true}></alisten-player-controls>
              </div>

              <!-- Right Panel: Tabbed Interface -->
              <div class="flex-[1] flex flex-col gap-4 md:gap-6 min-h-0 md:h-auto overflow-hidden min-w-[280px] relative">
                <!-- Tab Navigation -->
                <div class="glass rounded-2xl p-1.5 flex gap-1 shrink-0">
                  <button class="flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${this.desktopRightTab === 'playlist' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}"
                    @click=${() => this.desktopRightTab = 'playlist'}>
                    <div class="flex items-center justify-center gap-2">
                      ${unsafeSVG(icons.listMusic(16))}
                      <span>播放列表</span>
                    </div>
                  </button>
                  <button class="flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${this.desktopRightTab === 'chat' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'}"
                    @click=${() => this.desktopRightTab = 'chat'}>
                    <div class="flex items-center justify-center gap-2">
                      ${unsafeSVG(icons.messageSquare(16))}
                      <span>聊天</span>
                    </div>
                  </button>
                </div>

                <!-- Tab Content Container with Slide Animation -->
                <div class="flex-1 flex transition-transform duration-300 ease-out overflow-hidden" style="width: 200%; transform: ${this.desktopRightTab === 'playlist' ? 'translateX(0)' : 'translateX(-50%)'};">
                  <div class="w-1/2 shrink-0 px-2 h-full">
                    <alisten-playlist-panel class="h-full" .isDesktop=${true}
                      @show-music-search=${() => this.dispatchEvent(new CustomEvent('show-music-search'))}
                      @song-like=${(e: CustomEvent) => this.dispatchEvent(new CustomEvent('song-like', { detail: e.detail }))}
                      @song-delete=${(e: CustomEvent) => this.dispatchEvent(new CustomEvent('song-delete', { detail: e.detail }))}
                    ></alisten-playlist-panel>
                  </div>
                  <div class="w-1/2 shrink-0 px-2 h-full">
                    <alisten-chat-panel class="h-full" .isDesktop=${true}
                      @show-help=${() => this.dispatchEvent(new CustomEvent('show-help'))}
                      @show-settings=${() => this.dispatchEvent(new CustomEvent('show-settings'))}
                      @show-play-history=${() => this.dispatchEvent(new CustomEvent('show-play-history'))}
                      @share-room=${() => this.dispatchEvent(new CustomEvent('share-room'))}
                    ></alisten-chat-panel>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mobile Swipe Container -->
            <div class="mobile-panels flex w-[300vw] flex-1 min-h-0 md:hidden ${this.isTransitioning ? 'transition-transform' : ''}"
              style=${this.panelsStyle}
              @touchstart=${this.handleTouchStart}
              @touchmove=${this.handleTouchMove}
              @touchend=${this.handleTouchEnd}
              @touchcancel=${this.handleTouchCancel}>
              <!-- Mobile Panel: Player & Lyrics -->
              <div class="w-screen shrink-0 flex flex-col min-h-0 h-full relative px-4 pb-2">
                <alisten-lyrics-panel class="mb-4 flex-1 min-h-0 flex flex-col"></alisten-lyrics-panel>
                <alisten-player-controls class="shrink-0"></alisten-player-controls>
              </div>
              <!-- Mobile Panel: Playlist -->
              <div class="w-screen shrink-0 flex flex-col gap-4 min-h-0 h-full px-4 pb-2">
                <alisten-playlist-panel class="h-full"
                  @show-music-search=${() => this.dispatchEvent(new CustomEvent('show-music-search'))}
                  @song-like=${(e: CustomEvent) => this.dispatchEvent(new CustomEvent('song-like', { detail: e.detail }))}
                  @song-delete=${(e: CustomEvent) => this.dispatchEvent(new CustomEvent('song-delete', { detail: e.detail }))}
                ></alisten-playlist-panel>
              </div>
              <!-- Mobile Panel: Chat -->
              <div class="w-screen shrink-0 flex flex-col gap-4 min-h-0 h-full px-4 pb-2">
                <alisten-chat-panel class="h-full"
                  @show-help=${() => this.dispatchEvent(new CustomEvent('show-help'))}
                  @show-settings=${() => this.dispatchEvent(new CustomEvent('show-settings'))}
                  @show-play-history=${() => this.dispatchEvent(new CustomEvent('show-play-history'))}
                  @share-room=${() => this.dispatchEvent(new CustomEvent('share-room'))}
                ></alisten-chat-panel>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        .app-viewport { height: 100vh; height: 100dvh; min-height: 100svh; }
        .mobile-panels { will-change: transform; touch-action: pan-y; }
        .mobile-panels.transition-transform { transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
        @media (min-width: 768px) { .mobile-panels { transform: none !important; transition: none !important; } }
        .performance-low .app-viewport, .performance-off .app-viewport { background: #0D1016 !important; }
        .performance-low .glass, .performance-off .glass { background: #15171B !important; backdrop-filter: none !important; border-color: rgba(255,255,255,0.05) !important; }
        .performance-low .song-bg, .performance-off .song-bg { display: none !important; }
        .performance-low .bg-shapes, .performance-off .bg-shapes { display: none !important; }
      </style>
    `
  }
}
