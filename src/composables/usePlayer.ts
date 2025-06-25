import type { Song } from '@/types'
import { reactive, ref, watch } from 'vue'
import { getDefaultAvatar } from '@/utils/user'
import { useLyrics } from './useLyrics'

// 全局共享的播放器状态
const playerState = reactive<{
  currentTime: number
  currentSong: Song | null
  pushTime: number | null
  playlist: Song[]
}>({
  currentTime: 0,
  currentSong: null,
  pushTime: null,
  playlist: [],
})

// 从本地存储读取音量设置
function getStoredVolume(): number {
  try {
    const stored = localStorage.getItem('VOLUME')
    if (stored !== null) {
      const volume = Number.parseInt(stored, 10)
      return Number.isNaN(volume) ? 75 : Math.max(0, Math.min(100, volume))
    }
  } catch (error) {
    console.warn('无法读取本地存储的音量设置:', error)
  }
  return 75 // 默认音量
}

// 从本地存储读取静音状态
function getStoredMuteState(): boolean {
  return localStorage.getItem('MUTE') === 'true'
}

// 保存音量到本地存储
function saveVolumeToStorage(volume: number) {
  localStorage.setItem('VOLUME', volume.toString())
}

// 保存静音状态到本地存储
function saveMuteStateToStorage(isMuted: boolean) {
  localStorage.setItem('MUTE', isMuted.toString())
}

export function usePlayer(websocket?: any) {
  // 播放器状态相关操作
  const setCurrentSong = (song: Song | null) => {
    playerState.currentSong = song
  }

  const setPushTime = (time: number | null) => {
    playerState.pushTime = time
  }

  const setCurrentTime = (time: number) => {
    playerState.currentTime = time
  }

  // 更新播放状态和时间（用于服务器同步）
  const updatePlayState = (currentTime: number, pushTime?: number) => {
    playerState.currentTime = currentTime
    if (pushTime !== undefined) {
      playerState.pushTime = pushTime
    } else {
      // 如果没有提供pushTime，使用当前时间
      playerState.pushTime = Date.now()
    }
  }

  // 播放列表相关
  const updatePlaylist = (playlist: Song[]) => {
    playerState.playlist = [...playlist]
  }

  const clearPlaylist = () => {
    playerState.playlist = []
    setCurrentSong(null)
  }

  // 如果提供了 websocket，注册消息处理器
  if (websocket && websocket.registerMessageHandler) {
    const { loadLrcLyrics } = useLyrics()

    // 注册音乐消息处理器
    websocket.registerMessageHandler('music', (message: any) => {
      if (!message.url) {
        console.warn('收到不完整的音乐消息:', message)
        return
      }

      let url = message.url || ''
      if (url.includes('kuwo.cn') && !url.includes('-')) {
        const urls = url.split('.sycdn.')
        const headUrls = urls[0].replace('http://', '').split('.')
        const lastHeadUrl = headUrls[headUrls.length - 1]
        url = `https://${lastHeadUrl}-sycdn.${urls[1]}&timestamp=${Date.now()}`
      }
      url = url.replace('http://', 'https://')

      const music: Song = {
        url,
        title: message.name,
        artist: message.artist || '未知艺术家',
        album: message.album?.name || '未知专辑',
        duration: message.duration || 0,
        cover: message.pictureUrl || getDefaultAvatar(message.id),
      }

      setCurrentSong(music)
      setPushTime(message.pushTime || Date.now())
      loadLrcLyrics(message.lyric || '')
    })

    // 注册播放列表消息处理器
    websocket.registerMessageHandler('pick', (message: any) => {
      if (!message.data || !Array.isArray(message.data)) {
        console.warn('收到无效的播放列表:', message)
        return
      }

      const playlist: Song[] = message.data
        .filter((item: any) => item && item.name) // 过滤无效数据
        .map((item: any) => ({
          id: item.id,
          url: item.url || '',
          title: item.name,
          artist: item.artist || '未知艺术家',
          album: item.album?.name || '未知专辑',
          duration: item.duration ? (item.duration / 1000) : 240,
          cover: item.pictureUrl || getDefaultAvatar(item.id),
          requestedBy: {
            name: item.nickName || '未知用户',
            avatar: getDefaultAvatar(),
          },
        }))

      updatePlaylist(playlist)
    })
  }

  // 音量和界面相关
  const volume = ref(getStoredVolume())
  const isMuted = ref(getStoredMuteState())
  const skipMessage = ref('')
  const showSkipMessage = ref(false)
  const isSkipping = ref(false)

  // 监听音量变化，自动保存到本地存储
  watch(volume, (newVolume) => {
    saveVolumeToStorage(newVolume)
  })

  // 监听静音状态变化，自动保存到本地存储
  watch(isMuted, (newMuteState) => {
    saveMuteStateToStorage(newMuteState)
  })

  const setVolume = (event: MouseEvent) => {
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const percentage = (clickX / rect.width) * 100

    volume.value = Math.max(0, Math.min(100, percentage))

    // 如果音量大于0，自动取消静音
    if (volume.value > 0 && isMuted.value) {
      isMuted.value = false
    }
  }

  const toggleMute = () => {
    isMuted.value = !isMuted.value
  }
  // 切歌功能
  const showSkipSong = () => {
    // 显示切歌提示消息
    skipMessage.value = `切换中`
    showSkipMessage.value = true
    setTimeout(() => {
      showSkipMessage.value = false
      isSkipping.value = false
    }, 1000)
  }
  return {
    // 播放器状态
    playerState,

    // 播放器操作
    setCurrentSong,
    setPushTime,
    setCurrentTime,
    updatePlayState,
    updatePlaylist,
    clearPlaylist,

    // 音量控制
    volume,
    isMuted,
    setVolume,
    toggleMute,

    // 切歌功能
    showSkipSong,
    skipMessage,
    showSkipMessage,
    isSkipping,
  }
}
