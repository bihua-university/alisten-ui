import type { PropertyValues } from 'lit'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ref } from 'lit/directives/ref.js'
import { lyricsStore } from '@/stores/lyrics-store'
import { performanceStore } from '@/stores/performance-store'

@customElement('alisten-lyrics-panel')
export class LyricsPanelElement extends LitElement {
  createRenderRoot() {
    return this
  }

  @state() private currentLyrics = lyricsStore.state.currentLyrics
  @state() private currentLyricIndex = lyricsStore.state.currentLyricIndex
  @state() private performanceLevel = performanceStore.state.level
  private lyricsContainerEl: HTMLElement | null = null

  connectedCallback() {
    super.connectedCallback()
    lyricsStore.addEventListener('change', () => {
      const lyricsChanged = lyricsStore.state.currentLyrics !== this.currentLyrics
      this.currentLyrics = lyricsStore.state.currentLyrics
      const newIndex = lyricsStore.state.currentLyricIndex
      if (newIndex !== this.currentLyricIndex) {
        this.currentLyricIndex = newIndex
        if (!lyricsChanged)
          this.updateActiveLyric()
      }
    })
    performanceStore.addEventListener('change', () => {
      this.performanceLevel = performanceStore.state.level
    })
  }

  firstUpdated() {
    if (this.lyricsContainerEl) {
      lyricsStore.registerContainer(this.lyricsContainerEl)
      this.updateActiveLyric()
    }
  }

  shouldUpdate(changedProperties: PropertyValues<this>) {
    // 仅歌词索引变化时不重渲染，直接操作 DOM class，降低开销
    if (changedProperties.has('currentLyricIndex' as keyof LyricsPanelElement) && !changedProperties.has('currentLyrics' as keyof LyricsPanelElement))
      return false
    return super.shouldUpdate(changedProperties)
  }

  private lastActiveIndex = -1

  private updateActiveLyric() {
    if (!this.lyricsContainerEl)
      return
    const lines = this.lyricsContainerEl.querySelectorAll('.lyric-line')
    const active = this.currentLyricIndex
    if (active === this.lastActiveIndex)
      return
    lines.forEach((line, index) => {
      const el = line as HTMLElement
      const isActive = index === active
      const isNear = index === active - 1 || index === active + 1
      el.className = `lyric-line text-center cursor-default transition-[transform,opacity] duration-500 ${
        isActive
          ? 'active-lyric text-white text-2xl md:text-4xl font-bold tracking-wide scale-105'
          : isNear
            ? 'near-lyric text-white/50 text-xl md:text-2xl font-medium scale-100'
            : 'far-lyric text-white/25 text-lg md:text-xl font-normal scale-95'
      }`
    })
    this.lastActiveIndex = active
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this.lyricsContainerEl) {
      lyricsStore.unregisterContainer(this.lyricsContainerEl)
    }
  }

  render() {
    const isOff = this.performanceLevel === 'off'

    return html`
      <div class="flex-1 rounded-xl p-4 md:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group"
        style="${isOff ? 'background: #111;' : 'background: rgba(20,20,20,0.4); border: 1px solid var(--bg-hover);'}">
        <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/15 z-0 pointer-events-none"></div>

        <div ${ref((el: Element | undefined) => {
          if (el instanceof HTMLElement)
            this.lyricsContainerEl = el
        })}
          class="z-10 w-full max-w-2xl md:max-w-4xl overflow-y-auto max-h-full py-8 px-4 lyrics-scroll flex flex-col items-center">
          ${this.currentLyrics.length > 0
            ? html`
            ${this.currentLyrics.map((line, index) => {
              const isActive = index === this.currentLyricIndex
              const isNear = index === this.currentLyricIndex - 1 || index === this.currentLyricIndex + 1
              const classes = isActive
                ? 'active-lyric text-white text-2xl md:text-4xl font-bold tracking-wide scale-105'
                : isNear
                  ? 'near-lyric text-white/50 text-xl md:text-2xl font-medium scale-100'
                  : 'far-lyric text-white/25 text-lg md:text-xl font-normal scale-95'
              return html`<p class="lyric-line text-center transition-[transform,opacity] duration-500 cursor-default ${classes}">${line.text || ' '}</p>`
            })}
          `
            : html`<p class="text-white/40 text-xl">暂无歌词</p>`}
        </div>
      </div>

      <style>
        .lyrics-scroll { scrollbar-width: none; -ms-overflow-style: none; scroll-behavior: smooth; }
        .lyrics-scroll::-webkit-scrollbar { display: none; }
      </style>
    `
  }
}
