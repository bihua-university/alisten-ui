import type { PropertyValues } from 'lit'
import { html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { performanceStore } from '@/stores/performance-store'
import { icons } from '@/utils/icons'

@customElement('alisten-modal')
export class ModalElement extends LitElement {
  createRenderRoot() {
    return this
  }

  @property({ type: String }) title = ''
  @property({ type: String }) subtitle = ''
  @property({ type: String }) headerIcon = ''
  @property({ type: String }) size: 'sm' | 'md' | 'lg' | 'xl' = 'md'
  @property({ type: String }) theme: 'primary' | 'success' | 'warning' | 'danger' | 'info' = 'primary'
  @property({ type: Number }) zIndex = 100
  @property({ type: Boolean }) showHeader = true
  @property({ type: Boolean }) allowBackdropClose = true
  @property({ type: Boolean }) open = false

  @state() private isClosing = false
  private closeTimeout: ReturnType<typeof setTimeout> | null = null

  private get sizeClass(): string {
    const map = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }
    return map[this.size]
  }

  private get themeClasses() {
    const themes = {
      primary: { bg: 'bg-[var(--accent)]/10', text: 'text-[var(--accent)]' },
      success: { bg: 'bg-green-500/10', text: 'text-green-400' },
      warning: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
      danger: { bg: 'bg-red-500/10', text: 'text-red-400' },
      info: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    }
    return themes[this.theme]
  }

  private get enableAnimation(): boolean {
    return performanceStore.state.level === 'high' || performanceStore.state.level === 'medium'
  }

  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('open')) {
      const wasOpen = changedProperties.get('open')
      if (wasOpen && !this.open) {
        // 正在关闭
        if (this.enableAnimation) {
          this.isClosing = true
          if (this.closeTimeout)
            clearTimeout(this.closeTimeout)
          this.closeTimeout = setTimeout(() => {
            this.isClosing = false
          }, 300)
        }
      } else if (!wasOpen && this.open) {
        // 正在打开，重置关闭状态
        this.isClosing = false
        if (this.closeTimeout) {
          clearTimeout(this.closeTimeout)
          this.closeTimeout = null
        }
      }
    }
  }

  private handleBackdropClick() {
    if (this.allowBackdropClose) {
      this.dispatchEvent(new CustomEvent('close'))
    }
  }

  render() {
    if (!this.open && !this.isClosing)
      return nothing

    const showEffects = performanceStore.state.level !== 'low' && performanceStore.state.level !== 'off'
    const animating = this.enableAnimation
    const wrapperAnim = animating ? (this.isClosing ? 'modal-exit' : 'modal-enter') : ''
    const backdropAnim = animating ? (this.isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-enter') : ''
    const contentAnim = animating ? (this.isClosing ? 'modal-content-exit' : 'modal-content-enter') : ''

    return html`
      <div class="fixed inset-0 flex items-center justify-center ${wrapperAnim}" style="z-index: ${this.zIndex}">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm ${backdropAnim}" @click=${this.handleBackdropClick}></div>
        <div class="relative w-full mx-4 overflow-hidden flex flex-col modal-container ${contentAnim} ${this.sizeClass}">
          <div class="absolute inset-0 modal-bg rounded-3xl"></div>
          ${showEffects
            ? html`
            <div class="absolute -top-20 -right-20 w-40 h-40 bg-[var(--accent)]/15 rounded-full blur-[80px] pointer-events-none"></div>
            <div class="absolute -bottom-20 -left-20 w-40 h-40 bg-[var(--accent)]/15 rounded-full blur-[80px] pointer-events-none"></div>
          `
            : nothing}

          ${this.showHeader
            ? html`
            <div class="flex-shrink-0 px-6 pt-6 pb-4 relative z-10">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-3">
                  ${this.headerIcon
                    ? html`
                    <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${this.themeClasses.bg}">
                      <i class="text-lg ${this.headerIcon} ${this.themeClasses.text}"></i>
                    </div>
                  `
                    : nothing}
                  <div>
                    <h2 class="text-lg font-semibold text-white">${this.title}</h2>
                    ${this.subtitle ? html`<p class="text-sm text-white/40 mt-0.5">${this.subtitle}</p>` : nothing}
                  </div>
                </div>
                ${this.allowBackdropClose
                  ? html`
                  <button class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all duration-200"
                    @click=${() => this.dispatchEvent(new CustomEvent('close'))}>
                    ${unsafeSVG(icons.x(14))}
                  </button>
                `
                  : nothing}
              </div>
            </div>
          `
            : nothing}

          <div class="flex-1 overflow-y-auto scrollable-content relative z-10">
            <div class="px-6 pb-6">
              <slot></slot>
            </div>
          </div>
        </div>
      </div>

      <style>
        .modal-bg { background: var(--bg-surface); border: 1px solid var(--border-hover); }
        .modal-container { border-radius: 16px; max-height: 80vh; }
        .modal-enter { animation: modalIn 0.25s cubic-bezier(0.16,1,0.3,1); }
        .modal-backdrop-enter { animation: fadeIn 0.2s ease; }
        .modal-content-enter { animation: modalContentIn 0.3s cubic-bezier(0.16,1,0.3,1); }
        .modal-exit { animation: modalOut 0.25s cubic-bezier(0.4,0,0.2,1) forwards; }
        .modal-backdrop-exit { animation: fadeOut 0.2s ease forwards; }
        .modal-content-exit { animation: modalContentOut 0.25s cubic-bezier(0.4,0,0.2,1) forwards; }
        @keyframes modalIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalContentIn { from { opacity: 0; transform: scale(0.97) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes modalOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes modalContentOut { from { opacity: 1; transform: scale(1) translateY(0); } to { opacity: 0; transform: scale(0.97) translateY(8px); } }
        .scrollable-content { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollable-content::-webkit-scrollbar { display: none; }
        @media (max-width: 640px) {
          .modal-container { margin-left: 16px; margin-right: 16px; max-height: 85vh; }
        }
      </style>
    `
  }
}
