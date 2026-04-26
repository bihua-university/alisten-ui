import type { NotificationItem } from '@/stores/notification-store'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { notificationStore } from '@/stores/notification-store'

// Import child component to trigger custom element registration
import './notification-toast-element'

@customElement('alisten-notification-container')
export class NotificationContainerElement extends LitElement {
  createRenderRoot() {
    return this
  }

  @state() private notifications: NotificationItem[] = []

  connectedCallback() {
    super.connectedCallback()
    notificationStore.addEventListener('change', () => {
      this.notifications = notificationStore.state.notifications
    })
  }

  render() {
    return html`
      <div class="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
        ${this.notifications.map(n => html`
          <div class="pointer-events-auto">
            <alisten-notification-toast .notification=${n}></alisten-notification-toast>
          </div>
        `)}
      </div>
    `
  }
}
