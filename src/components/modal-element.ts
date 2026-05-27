import { html, LitElement, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'
/**
 * Modal 基础组件（Light DOM 兼容版）
 *
 * 由于项目禁用 Shadow DOM，<slot> 无法使用。
 * 通过在 updated() 中将子节点移动到内容容器中实现 slot 效果。
 */
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
  @property({ type: Boolean }) open = true

  private get sizeClass(): string {
    const map = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }
    return map[this.size]
  }

  private get themeClasses(): { bg: string, text: string } {
    const map = {
      primary: { bg: 'bg-[#D4A853]/10', text: 'text-[#D4A853]' },
      success: { bg: 'bg-green-500/10', text: 'text-green-400' },
      warning: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
      danger: { bg: 'bg-red-500/10', text: 'text-red-400' },
      info: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    }
    return map[this.theme]
  }

  private handleBackdropClick() {
    this.dispatchEvent(new CustomEvent('backdropClick'))
    if (this.allowBackdropClose) {
      this.dispatchEvent(new CustomEvent('close'))
    }
  }

  private handleCloseClick() {
    this.dispatchEvent(new CustomEvent('close'))
  }

  private moveChildrenToContentArea() {
    const contentArea = this.querySelector('.alisten-modal-content-area') as HTMLElement | null
    if (!contentArea)
      return

    // 获取当前不在 modal-wrapper 内部的子节点，移动到 content area
    Array.from(this.childNodes).forEach((child) => {
      const el = child as HTMLElement
      // 跳过 content area 本身
      if (el.classList?.contains('alisten-modal-content-area'))
        return
      // 跳过已在 wrapper 内部的节点
      if (el.closest?.('.alisten-modal-wrapper'))
        return
      contentArea.appendChild(child)
    })
  }

  updated() {
    this.moveChildrenToContentArea()
  }

  render() {
    if (!this.open)
      return nothing

    const theme = this.themeClasses

    return html`
      <div class="fixed inset-0 flex items-center justify-center alisten-modal-wrapper" style="z-index: ${this.zIndex}">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm alisten-modal-backdrop"
          @click=${this.handleBackdropClick}></div>

        <!-- Modal Content -->
        <div class="relative w-full mx-4 overflow-hidden flex flex-col alisten-modal-container ${this.sizeClass}">
          <!-- Background -->
          <div class="absolute inset-0 alisten-modal-bg rounded-3xl"></div>

          <!-- Decorative glows -->
          <div class="absolute -top-20 -right-20 w-40 h-40 bg-[#D4A853]/15 rounded-full blur-[80px] pointer-events-none modal-glow"></div>
          <div class="absolute -bottom-20 -left-20 w-40 h-40 bg-[#D4A853]/15 rounded-full blur-[80px] pointer-events-none modal-glow"></div>

          <!-- Header -->
          ${this.showHeader
            ? html`
              <div class="flex-shrink-0 px-6 pt-6 pb-4 relative z-10">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-3">
                    ${this.headerIcon
                      ? html`
                        <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${theme.bg}">
                          <i class="text-lg ${this.headerIcon} ${theme.text}"></i>
                        </div>
                      `
                      : nothing}
                    <div>
                      <h2 class="text-lg font-semibold text-white">${this.title}</h2>
                      ${this.subtitle
                        ? html`<p class="text-sm text-white/40 mt-0.5">${this.subtitle}</p>`
                        : nothing}
                    </div>
                  </div>
                  ${this.allowBackdropClose
                    ? html`
                      <button
                        class="w-7 h-7 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
                        @click=${this.handleCloseClick}
                      >
                        <i class="fa-solid fa-times text-xs"></i>
                      </button>
                    `
                    : nothing}
                </div>
              </div>
            `
            : nothing}

          <!-- Scrollable Content Area (children moved here via JS) -->
          <div class="flex-1 overflow-y-auto relative z-10 alisten-modal-scrollable">
            <div class="px-6 pb-6 alisten-modal-content-area"></div>
          </div>
        </div>
      </div>

      <style>
        .alisten-modal-bg {
          background: #141414;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .alisten-modal-container {
          border-radius: 16px;
          max-height: 80vh;
          animation: alisten-modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .alisten-modal-backdrop {
          animation: alisten-modal-backdrop-in 0.3s ease;
        }
        .alisten-modal-scrollable {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .alisten-modal-scrollable::-webkit-scrollbar {
          display: none;
        }
        @keyframes alisten-modal-in {
          from { opacity: 0; transform: scale(0.9) translateY(30px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes alisten-modal-backdrop-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (max-width: 640px) {
          .alisten-modal-container {
            margin-left: 16px;
            margin-right: 16px;
            max-height: 85vh;
          }
          @keyframes alisten-modal-in {
            from { opacity: 0; transform: scale(0.95) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        }
      </style>
    `
  }
}
