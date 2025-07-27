import type { Song } from '@/types'
import { computed, reactive, ref, watch } from 'vue'
import { getDefaultAvatar } from '@/utils/user'
import { useLyrics } from './useLyrics'
import { useMediaSession } from './useMediaSession'
import { useNotification } from './useNotification'
import { useWebSocket } from './useWebSocket'

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

// 网络延迟（毫秒）
let networkDelay = 0

// 全局共享的音频播放器引用
const audioPlayer = ref<HTMLAudioElement>()

// 全局共享的音量和静音状态
const volume = ref(getStoredVolume())
const isMuted = ref(getStoredMuteState())

// 进度更新相关
let animationFrameId: number | null = null

function updateProgress() {
  if (audioPlayer.value) {
    // 只有在音频存在且不是暂停状态时才更新
    if (!audioPlayer.value.paused && !audioPlayer.value.ended) {
      playerState.currentTime = audioPlayer.value.currentTime
    }
  }
  // 只有在需要时才继续动画循环
  if (animationFrameId !== null) {
    animationFrameId = requestAnimationFrame(updateProgress)
  }
}

function startProgressUpdate() {
  if (animationFrameId === null) {
    animationFrameId = requestAnimationFrame(updateProgress)
  }
}

function stopProgressUpdate() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

// 监听音量变化，自动保存到本地存储
watch(volume, (newVolume) => {
  saveVolumeToStorage(newVolume)
})

// 监听静音状态变化，自动保存到本地存储
watch(isMuted, (newMuteState) => {
  saveMuteStateToStorage(newMuteState)
})

// 音频事件处理函数 - 这些函数现在在 usePlayer 内部定义

// 音频播放控制函数
function playAudio() {
  if (audioPlayer.value) {
    audioPlayer.value.volume = volume.value / 100
    audioPlayer.value.muted = isMuted.value
    audioPlayer.value.play()
    startProgressUpdate()
  }
}

function setAudioCurrentTime(time: number) {
  if (audioPlayer.value) {
    audioPlayer.value.currentTime = time
  }
}

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

// 同步音频当前时间到服务器
function syncAudioCurrentTime() {
  // 如果 pushTime 为 0，则不进行同步
  if (!playerState.pushTime || playerState.pushTime === 0) {
    return
  }

  // 使用 pushTime 和 networkDelay 修正时间差
  const delta = Date.now() - playerState.pushTime - networkDelay
  const duration = playerState.currentSong?.duration ?? 0

  // 确保播放时间不超过歌曲长度
  const newTime = Math.min(delta, duration)
  if (audioPlayer.value) {
    // 转换为秒
    const newTimeSeconds = newTime / 1000
    // 同时设置音频元素的 currentTime 和播放器状态的 currentTime
    setAudioCurrentTime(newTimeSeconds)
    setCurrentTime(newTimeSeconds)
    console.log('🕐 同步新时间:', `${newTimeSeconds}s`)
  }
}

// 在模块加载时初始化全局监听器（只执行一次）
const { registerMessageHandler, send } = useWebSocket()
const { loadLrcLyrics, syncLyrics } = useLyrics()
const { updateMetadata } = useMediaSession()

// 监听当前歌曲变化，更新音频源并自动播放
watch(() => playerState.currentSong, (newSong) => {
  if (newSong && audioPlayer.value) {
    // 如果有新歌曲且有音频URL，则加载新音频
    if (newSong.url) {
      console.log('🎵 加载新歌曲:', newSong.title)
      audioPlayer.value.load()
      // 自动播放
      audioPlayer.value.addEventListener('canplay', function onCanPlay() {
        // 应该在播放前设置 currentTime
        syncAudioCurrentTime()
        playAudio()
        audioPlayer.value?.removeEventListener('canplay', onCanPlay)
      })
    }
  }
}, { immediate: true })

// 监听音量变化，同步到音频元素
watch(volume, (newVolume) => {
  if (audioPlayer.value) {
    audioPlayer.value.volume = newVolume / 100
  }
}, { immediate: true })

// 监听静音状态变化
watch(isMuted, (muted) => {
  if (audioPlayer.value) {
    audioPlayer.value.muted = muted
  }
}, { immediate: true })

// 注册音乐消息处理器
registerMessageHandler('music', (message: any) => {
  if (!message.url) {
    console.warn('收到不完整的音乐消息:', message)
    return
  }
  console.log('📥 收到音乐消息:', message)

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

  playerState.currentSong = music
  playerState.pushTime = message.pushTime || Date.now()
  loadLrcLyrics(message.lyric || '')
  // 直接更新媒体会话元数据
  updateMetadata(music)
})

// 注册播放列表消息处理器
registerMessageHandler('pick', (message: any) => {
  if (!message.data || !Array.isArray(message.data)) {
    console.warn('收到无效的播放列表:', message)
    return
  }

  const playlist: Song[] = message.data
    .filter((item: any) => item && item.name) // 过滤无效数据
    .map((item: any) => ({
      id: item.id,
      url: item.url || '',
      webUrl: item.webUrl || '',
      title: item.name,
      artist: item.artist || '未知艺术家',
      album: item.album?.name || '未知专辑',
      duration: item.duration ? (item.duration / 1000) : 240,
      cover: item.pictureUrl || getDefaultAvatar(item.id),
      requestedBy: item.user,
    }))

  playerState.playlist = [...playlist]
})

// 注册延迟消息处理器
registerMessageHandler('delay', (message: any) => {
  if (typeof message.delay === 'number') {
    networkDelay = message.delay
    console.log('📡 收到延迟信息:', `${message.delay}ms`)
  }
})

// 音频事件处理函数
function onAudioTimeUpdate(event: Event) {
  const audio = event.target as HTMLAudioElement
  if (audio) {
    // 根据audio的currentTime更新pushTime，使其与服务器保持同步
    const currentTimeFromAudio = audio.currentTime
    syncLyrics(currentTimeFromAudio)
    // 更新当前时间（用于歌词同步和显示）
    playerState.currentTime = currentTimeFromAudio
  }
}

function onAudioError(event: Event) {
  const audio = event.target as HTMLAudioElement
  console.error('音频播放错误:', audio.error)
}

// 播放器状态相关操作
function setCurrentSong(song: Song | null) {
  playerState.currentSong = song
  // 直接更新媒体会话元数据
  updateMetadata(song)
}

function setPushTime(time: number | null) {
  playerState.pushTime = time
}

function setCurrentTime(time: number) {
  playerState.currentTime = time
}

// 更新播放状态和时间（用于服务器同步）
function updatePlayState(currentTime: number, pushTime?: number) {
  playerState.currentTime = currentTime
  if (pushTime !== undefined) {
    playerState.pushTime = pushTime
  } else {
    // 如果没有提供pushTime，使用当前时间
    playerState.pushTime = Date.now()
  }
}

// 播放列表相关
function updatePlaylist(playlist: Song[]) {
  playerState.playlist = [...playlist]
}

function clearPlaylist() {
  playerState.playlist = []
  setCurrentSong(null)
}

function setVolume(event: MouseEvent) {
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

function toggleMute() {
  isMuted.value = !isMuted.value
}

// 播放进度百分比
const progressPercentage = computed(() => {
  if (playerState.currentSong?.duration) {
    return (playerState.currentTime / (playerState.currentSong.duration / 1000)) * 100
  }
  return 0
})

const { showInfo } = useNotification()

// 发送切歌请求
function skipSong() {
  send({
    action: '/music/skip/vote',
    data: {},
  })
  // 显示通知
  showInfo('正在切歌...', {
    icon: 'fa-solid fa-forward',
    duration: 2000,
  })
}

// 请求音乐同步
function requestMusicSync() {
  send({
    action: '/music/sync',
    data: {},
  })
  console.log('🎵 请求重新同步音乐')
}

export function usePlayer() {
  return {
    // 播放器状态
    playerState,
    audioPlayer,

    // 播放器操作
    setCurrentSong,
    setPushTime,
    setCurrentTime,
    updatePlayState,
    updatePlaylist,
    clearPlaylist,

    // 音频控制
    playAudio,
    setAudioCurrentTime,

    // 音频事件处理
    onAudioTimeUpdate,
    onAudioError,

    // 进度控制
    startProgressUpdate,
    stopProgressUpdate,

    // 音量控制
    volume,
    isMuted,
    setVolume,
    toggleMute,

    // 切歌功能
    skipSong,

    // 音频同步
    requestMusicSync,

    // 播放进度百分比
    progressPercentage,
  }
}
