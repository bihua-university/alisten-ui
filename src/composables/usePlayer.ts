import { computed, ref, watch } from 'vue'
import { useRoomState } from '@/composables/useRoomState'

// 从本地存储读取音量设置
function getStoredVolume(): number {
  try {
    const stored = localStorage.getItem('VOLUME')
    if (stored !== null) {
      const volume = Number.parseInt(stored, 10)
      return Number.isNaN(volume) ? 75 : Math.max(0, Math.min(100, volume))
    }
  }
  catch (error) {
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

export function usePlayer() {
  const {
    roomState,
  } = useRoomState()
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

  // 使用共享状态中的数据
  const currentSong = computed(() => roomState.currentSong)
  const currentTime = computed(() => roomState.currentTime)
  const progressPercentage = computed(() => {
    if (!currentSong.value)
      return 0
    return (currentTime.value / currentSong.value.duration) * 100
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
    currentTime,
    volume,
    isMuted,
    currentSong,
    progressPercentage,
    setVolume,
    toggleMute,
    showSkipSong,
    skipMessage,
    showSkipMessage,
    isSkipping,
  }
}
