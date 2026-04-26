import type { SearchResult, Song } from '@/types'
import { getDefaultAvatar } from '@/utils/user'
import { lyricsStore } from './lyrics-store'
import { mediaSessionStore } from './media-session-store'
import { notificationStore } from './notification-store'
import { Store } from './store-base'
import { websocketStore } from './websocket-store'

interface PlayerState {
  currentTime: number
  currentSong: Song | null
  pushTime: number | null
  playlist: Song[]
  volume: number
  isMuted: boolean
  needManualStartPlay: boolean
  recommendations: SearchResult[]
}

let networkDelay = 0
let audioPlayer: HTMLAudioElement | null = null
let rafId: number | null = null
let currentTimeValue = 0
let lastSyncTime = 0
let lastSyncCurrentTime = 0
let lastProgressEmitTime = 0
const progressCallbacks = new Set<(time: number) => void>()
let volumeStorage = 75
let muteStorage = false

try {
  const stored = localStorage.getItem('VOLUME')
  if (stored !== null) {
    const v = Number.parseInt(stored, 10)
    volumeStorage = Number.isNaN(v) ? 75 : Math.max(0, Math.min(100, v))
  }
  muteStorage = localStorage.getItem('MUTE') === 'true'
} catch (error) {
  console.warn('无法读取本地存储的音量设置:', error)
}

function saveVolume(volume: number) {
  localStorage.setItem('VOLUME', volume.toString())
}

function saveMute(isMuted: boolean) {
  localStorage.setItem('MUTE', isMuted.toString())
}

class PlayerStore extends Store<PlayerState> {
  constructor() {
    super({
      currentTime: 0,
      currentSong: null,
      pushTime: null,
      playlist: [],
      volume: volumeStorage,
      isMuted: muteStorage,
      needManualStartPlay: false,
      recommendations: [],
    })

    websocketStore.registerMessageHandler('music', (message: any) => {
      if (!message.url) {
        console.warn('收到不完整的音乐消息:', message)
        return
      }
      let url = message.url || ''
      if (url.includes('kuwo.cn') && !url.includes('-')) {
        const urls = url.split('.sycdn.')
        const headUrls = urls[0].replace('http://', '').split('.')
        const lastHeadUrl = headUrls[headUrls.length - 1]
        url = `https://${lastHeadUrl}-sycdn.${urls[1]}`
      }
      url = url.replace('http://', 'https://')

      const music: Song = {
        url,
        id: message.id,
        source: message.source,
        title: message.name,
        artist: message.artist || '未知艺术家',
        album: message.album || '未知专辑',
        duration: message.duration || 0,
        cover: message.pictureUrl || getDefaultAvatar(message.id),
      }
      this.setState({ currentSong: music, pushTime: message.pushTime || Date.now() })
      lyricsStore.loadLrcLyrics(message.lyric || '')
      mediaSessionStore.updateMetadata(music)
    })

    websocketStore.registerMessageHandler('pick', (message: any) => {
      if (!message.data || !Array.isArray(message.data)) {
        console.warn('收到无效的播放列表:', message)
        return
      }
      const playlist: Song[] = message.data
        .filter((item: any) => item && item.name)
        .map((item: any) => ({
          ...item,
          title: item.name,
          artist: item.artist || '未知艺术家',
          album: item.album || '未知专辑',
          duration: item.duration ? (item.duration / 1000) : 240,
          cover: item.pictureUrl || getDefaultAvatar(item.id),
          requestedBy: item.user,
        }))
      this.setState({ playlist: [...playlist] })
    })

    websocketStore.registerMessageHandler('music/recommend', (message: any) => {
      if (!message.data || !Array.isArray(message.data))
        return
      const results: SearchResult[] = message.data
        .filter((item: any) => item && item.id && item.name)
        .map((item: any) => ({
          id: item.id,
          title: item.name,
          artist: item.artist || '未知艺术家',
          album: item.album || '未知专辑',
          cover: item.cover || getDefaultAvatar(item.id),
          duration: item.duration || 240,
          requestedBy: {
            name: item.requestedBy?.name || '未知用户',
            avatar: item.requestedBy?.avatar || getDefaultAvatar(),
          },
        }))
      this.setState({ recommendations: results })
    })

    websocketStore.registerMessageHandler('delay', (message: any) => {
      if (typeof message.delay === 'number') {
        networkDelay = message.delay
        console.log('收到延迟信息:', `${message.delay}ms`)
      }
    })

    websocketStore.registerMessageHandler('info/push', (message: any) => {
      notificationStore.info(message.info)
    })
  }

  setAudioPlayer(el: HTMLAudioElement | null) {
    audioPlayer = el
    if (el) {
      el.volume = this.state.volume / 100
      el.muted = this.state.isMuted
      // 当音频开始播放时，确保时间基准已同步
      el.addEventListener('play', () => {
        lastSyncTime = performance.now()
        lastSyncCurrentTime = el.currentTime
      })
    }
  }

  getAudioPlayer(): HTMLAudioElement | null {
    return audioPlayer
  }

  private runProgressLoop() {
    if (audioPlayer && !audioPlayer.paused && !audioPlayer.ended) {
      const now = performance.now()
      const elapsed = (now - lastSyncTime) / 1000
      const newTime = lastSyncCurrentTime + elapsed
      currentTimeValue = newTime
      // 每 100ms 触发一次进度回调，降低 DOM 更新频率（约 10fps）
      if (now - lastProgressEmitTime >= 100) {
        lastProgressEmitTime = now
        progressCallbacks.forEach(cb => cb(currentTimeValue))
      }
      rafId = requestAnimationFrame(() => this.runProgressLoop())
      return
    }
    rafId = null
  }

  startProgressUpdate() {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => this.runProgressLoop())
    }
  }

  stopProgressUpdate() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  registerProgressCallback(cb: (time: number) => void) {
    progressCallbacks.add(cb)
  }

  unregisterProgressCallback(cb: (time: number) => void) {
    progressCallbacks.delete(cb)
  }

  getCurrentTime(): number {
    if (audioPlayer && !audioPlayer.paused) {
      const now = performance.now()
      return lastSyncCurrentTime + (now - lastSyncTime) / 1000
    }
    return currentTimeValue
  }

  async playAudio(): Promise<{ audioPlaySuccess: boolean | undefined }> {
    if (audioPlayer) {
      audioPlayer.volume = this.state.volume / 100
      audioPlayer.muted = this.state.isMuted
      try {
        await audioPlayer.play()
      } catch (e) {
        console.warn('播放失败', e)
        return { audioPlaySuccess: false }
      }
      lastSyncTime = performance.now()
      lastSyncCurrentTime = audioPlayer.currentTime
      this.startProgressUpdate()
      return { audioPlaySuccess: true }
    }
    return { audioPlaySuccess: undefined }
  }

  setAudioCurrentTime(time: number) {
    if (audioPlayer) {
      try {
        audioPlayer.currentTime = Math.max(0, time)
        lastSyncTime = performance.now()
        lastSyncCurrentTime = Math.max(0, time)
      } catch (e) {
        console.warn('设置播放时间失败:', e)
      }
    }
  }

  syncAudioCurrentTime() {
    if (!this.state.pushTime || this.state.pushTime === 0)
      return
    const delta = Date.now() - this.state.pushTime - networkDelay
    // pushTime 大于当前时间（服务器时间不同步），从头播放
    if (delta < 0) {
      console.log('pushTime 是未来时间，从头播放')
      if (audioPlayer) {
        this.setAudioCurrentTime(0)
        currentTimeValue = 0
        this.setState({ currentTime: 0 })
      }
      return
    }
    const duration = this.state.currentSong?.duration ?? 0
    const newTime = Math.min(delta, duration)
    if (audioPlayer) {
      const newTimeSeconds = newTime / 1000
      this.setAudioCurrentTime(newTimeSeconds)
      lastSyncTime = performance.now()
      lastSyncCurrentTime = newTimeSeconds
      currentTimeValue = newTimeSeconds
      this.setState({ currentTime: newTimeSeconds })
      console.log('同步新时间:', `${newTimeSeconds}s`)
    }
  }

  onAudioTimeUpdate(event: Event) {
    const audio = event.target as HTMLAudioElement
    if (audio) {
      lastSyncTime = performance.now()
      lastSyncCurrentTime = audio.currentTime
      currentTimeValue = audio.currentTime
      lastProgressEmitTime = performance.now()
      progressCallbacks.forEach(cb => cb(currentTimeValue))
      lyricsStore.syncLyrics(audio.currentTime)
    }
  }

  onAudioError(event: Event) {
    const audio = event.target as HTMLAudioElement
    console.error('音频播放错误:', audio.error)
  }

  onCanPlay() {
    this.syncAudioCurrentTime()
    this.playAudio().then((res) => {
      if (res.audioPlaySuccess === false) {
        this.setState({ needManualStartPlay: true })
      }
    })
  }

  handleNewSong() {
    const song = this.state.currentSong
    if (song && audioPlayer && song.url) {
      console.log('加载新歌曲:', song.title)
      // 直接设置 src，避免 Lit 模板绑定的异步延迟导致 load() 时 src 为空
      audioPlayer.src = song.url
      audioPlayer.load()
      const handler = () => {
        this.onCanPlay()
        audioPlayer?.removeEventListener('canplay', handler)
      }
      audioPlayer.addEventListener('canplay', handler)
    }
  }

  setVolumeFromClick(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const percentage = (clickX / rect.width) * 100
    const newVolume = Math.max(0, Math.min(100, percentage))
    this.setState({ volume: newVolume })
    saveVolume(newVolume)
    if (newVolume > 0 && this.state.isMuted) {
      this.setState({ isMuted: false })
      saveMute(false)
    }
    if (audioPlayer)
      audioPlayer.volume = newVolume / 100
  }

  setVolume(volume: number) {
    this.setState({ volume })
    saveVolume(volume)
    if (audioPlayer)
      audioPlayer.volume = volume / 100
  }

  toggleMute() {
    const newMuted = !this.state.isMuted
    this.setState({ isMuted: newMuted })
    saveMute(newMuted)
    if (audioPlayer)
      audioPlayer.muted = newMuted
  }

  get progressPercentage(): number {
    if (this.state.currentSong?.duration) {
      return (this.state.currentTime / (this.state.currentSong.duration / 1000)) * 100
    }
    return 0
  }

  pickMusic(result: any, source: string) {
    if (source === 'netease')
      source = 'wy'
    websocketStore.send({
      action: '/music/pick',
      data: { id: result.id, name: result.title, source },
    })
    notificationStore.success(`已发送点歌请求: ${result.title}`)
  }

  skipSong() {
    websocketStore.send({ action: '/music/skip/vote', data: {} })
    notificationStore.info('正在切歌...', { icon: 'fa-solid fa-forward', duration: 2000 })
  }

  requestMusicSync() {
    websocketStore.send({ action: '/music/sync', data: {} })
    console.log('请求重新同步音乐')
  }

  pullRecommendations() {
    websocketStore.send({ action: '/music/recommend', data: {} })
  }

  clearManualStartPlay() {
    this.setState({ needManualStartPlay: false })
  }
}

export const playerStore = new PlayerStore()
