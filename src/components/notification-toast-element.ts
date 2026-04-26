import type { NotificationItem } from '@/stores/notification-store'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('alisten-notification-toast')
export class NotificationToastElement extends LitElement {
  createRenderRoot() {
    return this
  }

  @property({ type: Object }) notification!: NotificationItem

  private getIconClass(): string {
    switch (this.notification.type) {
      case 'success': return 'fa-solid fa-check-circle text-green-400'
      case 'error': return 'fa-solid fa-exclamation-circle text-red-400'
      case 'warning': return 'fa-solid fa-exclamation-triangle text-amber-400'
      case 'info': return 'fa-solid fa-info-circle text-blue-400'
      default: return 'fa-solid fa-info-circle text-blue-400'
    }
  }

  private getBorderClass(): string {
    switch (this.notification.type) {
      case 'success': return 'border-green-500/30'
      case 'error': return 'border-red-500/30'
      case 'warning': return 'border-amber-500/30'
      case 'info': return 'border-blue-500/30'
      default: return 'border-white/10'
    }
  }

  render() {
    const show = this.notification.show
    return html`
      <div class="bg-[#1a1a1f]/95 backdrop-blur-xl rounded-2xl px-5 py-3.5 shadow-2xl border ${this.getBorderClass()} min-w-[280px] max-w-md
        ${show ? 'toast-enter' : 'toast-exit'}">
        <div class="flex items-center gap-3">
          <i class="${this.getIconClass()} text-lg shrink-0"></i>
          <p class="flex-1 text-sm text-white font-medium text-center">${this.notification.message}</p>
        </div>
      </div>
      <style>
        .toast-enter {
          animation: toast-enter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .toast-exit {
          animation: toast-exit 0.3s ease-in forwards;
        }
        @keyframes toast-enter {
          from { opacity: 0; transform: translateY(-12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toast-exit {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-8px) scale(0.96); }
        }
      </style>
    `
  }
}
