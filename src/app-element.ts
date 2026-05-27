import { html, LitElement, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ref } from 'lit/directives/ref.js'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
// chatStore imported via event listeners
import { historyStore } from './stores/history-store'
import { lyricsStore } from './stores/lyrics-store'
import { mediaSessionStore } from './stores/media-session-store'
import { notificationStore } from './stores/notification-store'
// performanceStore applied in main.ts
import { playerStore } from './stores/player-store'
import { pwaStore } from './stores/pwa-store'
import { roomStore } from './stores/room-store'
import { userSettingsStore } from './stores/user-settings-store'
import { websocketStore } from './stores/websocket-store'
import { getAppConfig, logConfig, validateConfig } from './utils/config'
import { icons } from './utils/icons'

import { isMobileDevice, setViewportHeight } from './utils/mobile'
// Import child components to trigger custom element registration
import './components/chat-panel-element'
import './components/help-modal-element'
import './components/layout/main-layout-element'
import './components/lyrics-panel-element'
import './components/modal-element'
import './components/music-search-modal-element'
import './components/notification-container-element'
import './components/play-history-modal-element'
import './components/player-controls-element'
import './components/playlist-panel-element'

import './components/join-room-modal-element'
import './components/settings-modal-element'

@customElement('alisten-app')
export class AppElement extends LitElement {
  createRenderRoot() {
    return this
  }

  private appConfig = getAppConfig()
  private isDevelopment = import.meta.env.DEV

  @state() private initialized = false
  @state() private showMusicSearchModal = false
  @state() private showHelp = false
  @state() private showSettings = false
  @state() private showPlayHistory = false
  @state() private showJoinRoomConfirm = true
  @state() private showDebugInfo = true
  @state() private connectionStatus = websocketStore.state.connectionStatus
  @state() private reconnectAttempts = websocketStore.state.reconnectAttempts
  @state() private needManualStartPlay = playerStore.state.needManualStartPlay
  @state() private showUpdateModal = pwaStore.state.showUpdateModal
  // roomStore state accessed directly when needed
  @state() private isMobile = isMobileDevice()

  // audio element managed by playerStore
  private lyricsContainerEl: HTMLElement | null = null
  private viewportResizeHandler: (() => void) | null = null
  private viewportOrientationHandler: (() => void) | null = null
  private modalStack: Array<() => void> = []
  private popstateHandler: ((e: PopStateEvent) => void) | null = null

  connectedCallback() {
    super.connectedCallback()

    const configErrors = validateConfig(this.appConfig)
    if (configErrors.length > 0)
      console.warn('配置错误:', configErrors)

    // Subscribe to stores
    websocketStore.addEventListener('change', () => {
      this.connectionStatus = websocketStore.state.connectionStatus
      this.reconnectAttempts = websocketStore.state.reconnectAttempts
    })
    playerStore.addEventListener('change', () => {
      this.needManualStartPlay = playerStore.state.needManualStartPlay
    })
    // Watch currentSong changes to load new audio
    let lastSongUrl: string | null = null
    playerStore.addEventListener('change', () => {
      const song = playerStore.state.currentSong
      const url = song?.url || null
      if (url && url !== lastSongUrl) {
        lastSongUrl = url
        playerStore.handleNewSong()
      }
    })
    pwaStore.addEventListener('change', () => {
      this.showUpdateModal = pwaStore.state.showUpdateModal
    })
    // Watch playerState.currentSong for history
    let lastSongId: string | null = null
    playerStore.addEventListener('change', () => {
      const song = playerStore.state.currentSong
      if (song && song.id !== undefined && song.id !== lastSongId) {
        lastSongId = song.id || null
        historyStore.addToPlayHistory(song)
        document.title = `${song.title} - ${song.artist} | ${this.appConfig.app.name}`
      } else if (!song) {
        lastSongId = null
        document.title = this.appConfig.app.name
      }
    })

    // Watch connection status for notifications
    let lastStatus = this.connectionStatus
    websocketStore.addEventListener('change', () => {
      const status = websocketStore.state.connectionStatus
      if (status === lastStatus)
        return
      lastStatus = status
      switch (status) {
        case 'connecting':
          notificationStore.info('正在连接服务器...', {
            icon: 'fa-solid fa-spinner fa-spin',
          })
          break
        case 'connected':
          notificationStore.connectionSuccess()
          userSettingsStore.syncUserSettings()
          break
        case 'disconnected':
          notificationStore.error('与服务器断开连接', {
            icon: 'fa-solid fa-wifi',
          })
          break
        case 'reconnecting':
          notificationStore.connectionWarning('正在重新连接...')
          break
        case 'error':
          notificationStore.connectionError('连接错误')
          break
      }
    })

    // Setup responsive layout
    this.setupResponsiveLayout()

    // Setup back button handling
    this.setupBackButton()

    // Register lyrics container when DOM ready
    requestAnimationFrame(() => {
      if (this.lyricsContainerEl) {
        lyricsStore.registerContainer(this.lyricsContainerEl)
      }
    })
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.cleanupResponsiveLayout()
    this.cleanupBackButton()
    lyricsStore.unregisterContainer(this.lyricsContainerEl!)
    mediaSessionStore.clearSession()
    websocketStore.disconnect()
    playerStore.stopProgressUpdate()
    pwaStore.stopPeriodicUpdateCheck()
  }

  private setupResponsiveLayout() {
    setViewportHeight()

    this.viewportResizeHandler = () => {
      setViewportHeight()
      const newIsMobile = isMobileDevice()
      if (this.isMobile !== newIsMobile)
        this.isMobile = newIsMobile
    }
    this.viewportOrientationHandler = () =>
      setTimeout(() => this.viewportResizeHandler?.(), 200)

    window.addEventListener('resize', this.viewportResizeHandler, {
      passive: true,
    })
    window.addEventListener(
      'orientationchange',
      this.viewportOrientationHandler,
      { passive: true },
    )
  }

  private cleanupResponsiveLayout() {
    if (this.viewportResizeHandler)
      window.removeEventListener('resize', this.viewportResizeHandler)
    if (this.viewportOrientationHandler) {
      window.removeEventListener(
        'orientationchange',
        this.viewportOrientationHandler,
      )
    }
  }

  private setupBackButton() {
    this.popstateHandler = (e: PopStateEvent) => {
      if (this.modalStack.length > 0) {
        e.preventDefault()
        const close = this.modalStack.pop()
        close?.()
        if (this.modalStack.length > 0) {
          window.history.pushState({ modal: true }, '', window.location.href)
        }
      }
    }
    window.addEventListener('popstate', this.popstateHandler)
  }

  private cleanupBackButton() {
    if (this.popstateHandler)
      window.removeEventListener('popstate', this.popstateHandler)
  }

  private pushModal(closeFn: () => void) {
    if (this.modalStack.length === 0) {
      window.history.pushState({ modal: true }, '', window.location.href)
    }
    this.modalStack.push(closeFn)
  }

  private openModal(setter: (v: boolean) => void) {
    setter(true)
    this.pushModal(() => setter(false))
  }

  private confirmJoinRoom(e: CustomEvent) {
    const { roomId, password } = e.detail as {
      roomId: string
      password?: string
    }
    if (roomId)
      roomStore.setRoomId(roomId)
    if (password !== undefined)
      roomStore.setCurrentPassword(password)
    this.showJoinRoomConfirm = false
    this.initializeApp()
  }

  private cancelJoinRoom() {
    console.log('用户取消加入房间')
  }

  private initializeApp() {
    this.initialized = true
    logConfig(this.appConfig)

    // Init media session
    if (mediaSessionStore.isSupported()) {
      mediaSessionStore.setupActionHandlers({
        onPlay: () => playerStore.requestMusicSync(),
        onPause: () => playerStore.getAudioPlayer()?.pause(),
        onSeekBackward: null,
        onSeekForward: null,
        onStop: null,
        onPreviousTrack: null,
        onNextTrack: () => playerStore.skipSong(),
      })
    }

    playerStore.startProgressUpdate()

    setTimeout(() => {
      websocketStore.connect()
    }, 0)
  }

  private shareRoom() {
    const baseUrl = `${window.location.origin}${window.location.pathname}`
    const shareUrl = `${baseUrl}?houseId=${roomStore.state.id}&housePwd=`
    if (navigator.share) {
      navigator
        .share({
          title: `加入我的音乐房间 - ${roomStore.state.name}`,
          text: '来和我一起听歌吧！',
          url: shareUrl,
        })
        .catch(() => this.fallbackShare())
    } else {
      this.fallbackShare()
    }
  }

  private fallbackShare() {
    const url = `${window.location.origin}${window.location.pathname}?houseId=${roomStore.state.id}&housePwd=`
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          notificationStore.success('房间链接已复制到剪贴板！', {
            icon: 'fa-solid fa-copy',
          })
        })
        .catch(() => prompt('请复制房间链接:', url))
    } else {
      prompt('请复制房间链接:', url)
    }
  }

  private handleAudioRef(el: Element | undefined) {
    if (el instanceof HTMLAudioElement) {
      playerStore.setAudioPlayer(el)
    }
  }

  render() {
    return html`
      <div
        id="app-root"
        class="text-white h-screen-mobile font-sans overflow-hidden relative scrollbar-hide"
      >
        ${this.renderPWAUpdateModal()}
        ${this.showJoinRoomConfirm
          ? html`
              <alisten-join-room-modal
                @confirm=${this.confirmJoinRoom}
                @cancel=${this.cancelJoinRoom}
              ></alisten-join-room-modal>
            `
          : nothing}
        ${this.renderManualStartModal()}
        ${this.initialized
          ? html`
              <div class="relative z-10 h-full overflow-hidden scrollbar-hide">
                <audio
                  preload="auto"
                  @timeupdate=${playerStore.onAudioTimeUpdate.bind(playerStore)}
                  @error=${playerStore.onAudioError.bind(playerStore)}
                  @play=${() => playerStore.startProgressUpdate()}
                  @pause=${() => playerStore.stopProgressUpdate()}
                  ${ref(this.handleAudioRef)}
                >
                  您的浏览器不支持音频播放。
                </audio>

                <alisten-main-layout
                  @show-music-search=${() =>
                    this.openModal(v => (this.showMusicSearchModal = v))}
                  @show-help=${() => this.openModal(v => (this.showHelp = v))}
                  @show-settings=${() =>
                    this.openModal(v => (this.showSettings = v))}
                  @show-play-history=${() =>
                    this.openModal(v => (this.showPlayHistory = v))}
                  @share-room=${this.shareRoom}
                  @song-like=${(e: CustomEvent) =>
                    websocketStore.sendSongLike(e.detail.index, e.detail.title)}
                  @song-delete=${(e: CustomEvent) =>
                    websocketStore.sendDeleteSong(e.detail.songName)}
                ></alisten-main-layout>

                ${this.showMusicSearchModal
                  ? html`
                      <alisten-music-search-modal
                        @close=${() => (this.showMusicSearchModal = false)}
                      ></alisten-music-search-modal>
                    `
                  : nothing}
                ${this.showHelp
                  ? html`
                      <alisten-help-modal
                        @close=${() => (this.showHelp = false)}
                      ></alisten-help-modal>
                    `
                  : nothing}
                ${this.showSettings
                  ? html`
                      <alisten-settings-modal
                        @close=${() => (this.showSettings = false)}
                      ></alisten-settings-modal>
                    `
                  : nothing}
                ${this.showPlayHistory
                  ? html`
                      <alisten-play-history-modal
                        @close=${() => (this.showPlayHistory = false)}
                      ></alisten-play-history-modal>
                    `
                  : nothing}

                <alisten-notification-container></alisten-notification-container>

                ${this.isDevelopment && this.showDebugInfo
                  ? html`
                      <div class="fixed bottom-4 right-4 z-40">
                        <div
                          class="bg-black/80 text-white text-xs p-2 rounded backdrop-blur-sm max-w-xs relative"
                        >
                          <button
                            class="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded hover:bg-white/20 transition-colors"
                            @click=${() => (this.showDebugInfo = false)}
                          >
                            ${unsafeSVG(icons.x(12))}
                          </button>
                          <div class="font-medium mb-1 pr-5">
                            WebSocket 配置
                          </div>
                          <div>URL: ${this.appConfig.websocket.url}</div>
                          <div>状态: ${this.connectionStatus}</div>
                          ${this.connectionStatus === 'reconnecting'
                            ? html`<div>
                                重连次数: ${this.reconnectAttempts}
                              </div>`
                            : nothing}
                        </div>
                      </div>
                    `
                  : nothing}
              </div>
            `
          : nothing}
      </div>
    `
  }

  private renderPWAUpdateModal() {
    if (!this.showUpdateModal)
      return nothing
    return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click=${() => pwaStore.handleDismissUpdate()}
        ></div>
        <div
          class="relative bg-[#1a1a1f] rounded-3xl p-6 max-w-sm w-full mx-4 border border-white/10"
        >
          <h3 class="text-lg font-semibold mb-2">应用更新</h3>
          <p class="text-white/60 text-sm mb-4">新版本已可用，是否立即更新？</p>
          <div class="flex gap-3">
            <button
              class="flex-1 py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
              @click=${() => pwaStore.handleDismissUpdate()}
            >
              稍后再说
            </button>
            <button
              class="flex-1 py-2 px-4 rounded-xl bg-[#D4A853] hover:bg-[#C49A4A] text-[#0C0A09] font-medium transition-colors"
              @click=${() => pwaStore.handleUpdateApp()}
            >
              立即更新
            </button>
          </div>
        </div>
      </div>
    `
  }

  private renderManualStartModal() {
    if (!this.needManualStartPlay)
      return nothing
    return html`
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
        <div class="relative flex flex-col items-center">
          <button
            class="w-20 h-20 rounded-full bg-[#D4A853] hover:bg-[#C49A4A] flex items-center justify-center transition-transform active:scale-95 mb-4 shadow-lg shadow-[#D4A853]/20"
            @click=${() => {
              playerStore.playAudio()
              playerStore.clearManualStartPlay()
            }}
          >
            ${unsafeSVG(icons.play(32))}
          </button>
          <p class="text-white/80 text-lg font-medium">点击开始播放</p>
          <p class="text-white/40 text-sm mt-1">
            浏览器需要您的交互才能播放音频
          </p>
        </div>
      </div>
    `
  }
}
