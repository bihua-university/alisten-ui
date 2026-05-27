import { html, LitElement, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { styleMap } from 'lit/directives/style-map.js'
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
  private transitionPrepFrame: number | null = null
  private transitionApplyFrame: number | null = null
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
    this.cancelScheduledTransition()
    window.removeEventListener('keydown', this.handleKeydown)
  }

  private handleKeydown = (e: KeyboardEvent) => {
    if (window.innerWidth >= 768)
      return
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')
      return

    const direction = e.key === 'ArrowLeft' ? 'prev' : 'next'

    if (this.isMinimalMode) {
      this.switchTab(direction)
      return
    }

    if (this.isTransitioning)
      return
    if (!this.getNextTab(direction))
      return

    this.schedulePanelTransition(() => {
      this.switchTab(direction)
    })
  }

  private getNextTab(direction: 'next' | 'prev') {
    const tabs: Array<'lyrics' | 'playlist' | 'room'> = ['lyrics', 'playlist', 'room']
    const currentIndex = tabs.indexOf(this.activeTab)

    if (direction === 'next' && currentIndex < tabs.length - 1)
      return tabs[currentIndex + 1]
    if (direction === 'prev' && currentIndex > 0)
      return tabs[currentIndex - 1]

    return null
  }

  private switchTab(direction: 'next' | 'prev') {
    const nextTab = this.getNextTab(direction)
    if (!nextTab)
      return false

    this.activeTab = nextTab
    return true
  }

  private isTouchOnScrollable(e: TouchEvent): boolean {
    const target = e.target as Element
    return !!isScrollableElement(target)
  }

  private cancelScheduledTransition() {
    if (this.transitionPrepFrame !== null)
      cancelAnimationFrame(this.transitionPrepFrame)
    if (this.transitionApplyFrame !== null)
      cancelAnimationFrame(this.transitionApplyFrame)

    this.transitionPrepFrame = null
    this.transitionApplyFrame = null
  }

  private schedulePanelTransition(update: () => void) {
    if (this.isMinimalMode) {
      update()
      return
    }

    this.cancelScheduledTransition()
    this.isTransitioning = true

    void this.updateComplete.then(() => {
      this.transitionPrepFrame = requestAnimationFrame(() => {
        this.transitionPrepFrame = null
        this.transitionApplyFrame = requestAnimationFrame(() => {
          this.transitionApplyFrame = null
          update()
        })
      })
    })
  }

  private handlePanelTransitionEnd = (e: TransitionEvent) => {
    if (e.target !== e.currentTarget || e.propertyName !== 'transform')
      return

    this.isTransitioning = false
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

    this.cancelScheduledTransition()
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
    if (!this.isDragging) {
      this.isScrolling = false
      return
    }

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

    this.isDragging = false
    this.schedulePanelTransition(() => {
      if (isQuickSwipe || isLongSwipe)
        this.switchTab(deltaX < 0 ? 'next' : 'prev')

      this.dragOffset = 0
      this.isScrolling = false
    })
  }

  private handleTouchCancel = () => {
    if (this.isMinimalMode)
      return

    this.isDragging = false
    this.schedulePanelTransition(() => {
      this.dragOffset = 0
      this.isScrolling = false
    })
  }

  private get baseTransform(): number {
    const tabIndex = this.activeTab === 'lyrics' ? 0 : this.activeTab === 'playlist' ? 1 : 2
    return -tabIndex * 100
  }

  private get panelsStyle() {
    const totalOffset = this.baseTransform + (this.dragOffset / window.innerWidth) * 100
    return {
      transform: `translateX(${totalOffset}vw)`,
      transition: this.isTransitioning ? 'transform 300ms cubic-bezier(0.25, 0.8, 0.25, 1)' : 'none',
    }
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
          <!-- Ambient Background -->
          <div class="bg-shapes performance-bg-shape absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-[var(--accent)]/[0.06] rounded-full blur-[140px] pointer-events-none"></div>
          <div class="bg-shapes performance-bg-shape absolute bottom-[-20%] right-[-5%] w-[500px] h-[500px] bg-[var(--text-secondary)]/[0.04] rounded-full blur-[120px] pointer-events-none"></div>

          <!-- Dynamic Song Background -->
          ${showBg
            ? html`
            <div class="song-bg absolute inset-0 z-0">
              <img src=${this.currentSong!.cover} alt=${this.currentSong!.title}
                class="w-full h-full object-cover blur-[80px] scale-110 opacity-[0.12] transition-all duration-[1500ms]">
              <div class="absolute inset-0 bg-gradient-to-b from-[var(--bg-base)]/60 via-[var(--bg-base)]/85 to-[var(--bg-base)]"></div>
            </div>
          `
            : nothing}

          <!-- Main Layout Container -->
          <div class="z-10 w-full h-full flex flex-col gap-5 pt-3 px-0 md:px-6 md:py-5 overflow-hidden" style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0.75rem));">
            <!-- Desktop Layout -->
            <div class="hidden md:flex md:flex-row gap-5 h-full">
              <!-- Left Panel: Player & Lyrics -->
              <div class="flex-[2.2] flex flex-col min-h-0 min-w-0 relative">
                <alisten-lyrics-panel class="mb-3 flex-1 min-h-0 flex flex-col"></alisten-lyrics-panel>
                <alisten-player-controls class="shrink-0" .isDesktop=${true}></alisten-player-controls>
              </div>

              <!-- Right Panel: Tabbed Interface -->
              <div class="flex-[1] flex flex-col gap-3 min-h-0 overflow-hidden min-w-[300px] max-w-[400px] relative">
                <!-- Tab Navigation -->
                <div class="glass-panel rounded-lg p-1 flex gap-1 shrink-0">
                  <button class="flex-1 py-2 px-3 rounded-md text-[13px] font-medium transition-all ${this.desktopRightTab === 'playlist' ? 'bg-white/[0.07] text-white shadow-sm' : 'text-white/35 hover:text-white/55'}"
                    @click=${() => this.desktopRightTab = 'playlist'}>
                    <div class="flex items-center justify-center gap-1.5">
                      ${unsafeSVG(icons.listMusic(15))}
                      <span>播放列表</span>
                    </div>
                  </button>
                  <button class="flex-1 py-2 px-3 rounded-md text-[13px] font-medium transition-all ${this.desktopRightTab === 'chat' ? 'bg-white/[0.07] text-white shadow-sm' : 'text-white/35 hover:text-white/55'}"
                    @click=${() => this.desktopRightTab = 'chat'}>
                    <div class="flex items-center justify-center gap-1.5">
                      ${unsafeSVG(icons.messageSquare(15))}
                      <span>聊天</span>
                    </div>
                  </button>
                </div>

                <!-- Tab Content Container with Slide Animation -->
                <div class="flex-1 flex transition-transform duration-300 ease-out overflow-hidden" style="width: 200%; transform: ${this.desktopRightTab === 'playlist' ? 'translateX(0)' : 'translateX(-50%)'};">
                  <div class="w-1/2 shrink-0 pr-1.5 h-full">
                    <alisten-playlist-panel class="h-full" .isDesktop=${true}
                      @show-music-search=${() => this.dispatchEvent(new CustomEvent('show-music-search'))}
                      @song-like=${(e: CustomEvent) => this.dispatchEvent(new CustomEvent('song-like', { detail: e.detail }))}
                      @song-delete=${(e: CustomEvent) => this.dispatchEvent(new CustomEvent('song-delete', { detail: e.detail }))}
                    ></alisten-playlist-panel>
                  </div>
                  <div class="w-1/2 shrink-0 pl-1.5 h-full">
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
            <div class="mobile-panels flex w-[300vw] flex-1 min-h-0 md:hidden"
              style=${styleMap(this.panelsStyle)}
              @touchstart=${this.handleTouchStart}
              @touchmove=${this.handleTouchMove}
              @touchend=${this.handleTouchEnd}
              @touchcancel=${this.handleTouchCancel}
              @transitionend=${this.handlePanelTransitionEnd}>
              <!-- Mobile Panel: Player & Lyrics -->
              <div class="w-screen shrink-0 flex flex-col min-h-0 h-full relative px-3 pb-2">
                <alisten-lyrics-panel class="mb-3 flex-1 min-h-0 flex flex-col"></alisten-lyrics-panel>
                <alisten-player-controls class="shrink-0"></alisten-player-controls>
              </div>
              <!-- Mobile Panel: Playlist -->
              <div class="w-screen shrink-0 flex flex-col min-h-0 h-full px-3 pb-2">
                <alisten-playlist-panel class="h-full"
                  @show-music-search=${() => this.dispatchEvent(new CustomEvent('show-music-search'))}
                  @song-like=${(e: CustomEvent) => this.dispatchEvent(new CustomEvent('song-like', { detail: e.detail }))}
                  @song-delete=${(e: CustomEvent) => this.dispatchEvent(new CustomEvent('song-delete', { detail: e.detail }))}
                ></alisten-playlist-panel>
              </div>
              <!-- Mobile Panel: Chat -->
              <div class="w-screen shrink-0 flex flex-col min-h-0 h-full px-3 pb-2">
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
        @media (min-width: 768px) { .mobile-panels { transform: none !important; transition: none !important; } }
        .performance-low .app-viewport, .performance-off .app-viewport { background: #0D1016 !important; }
        .performance-low .glass, .performance-off .glass { background: #15171B !important; backdrop-filter: none !important; border-color: var(--border-subtle) !important; }
        .performance-low .song-bg, .performance-off .song-bg { display: none !important; }
        .performance-low .bg-shapes, .performance-off .bg-shapes { display: none !important; }
      </style>
    `
  }
}
