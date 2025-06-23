import { ref, computed } from 'vue'
import type { RepeatMode } from '@/types'
import { useRoomState } from '@/composables/useRoomState'

export const usePlayer = () => {
  const { 
    roomState, 
  } = useRoomState()
  
  const isShuffled = ref(false)
  const repeatMode = ref<RepeatMode>('none')
  const volume = ref(75)
  const isMuted = ref(false)
  const skipMessage = ref('')
  const showSkipMessage = ref(false)
  const isSkipping = ref(false)

  // 使用共享状态中的数据
  const currentSong = computed(() => roomState.currentSong)
  const currentTime = computed(() => roomState.currentTime)
  const progressPercentage = computed(() => {
    if (!currentSong.value) return 0
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

  const toggleShuffle = () => {
    isShuffled.value = !isShuffled.value
  }

  const toggleRepeat = () => {
    const modes: RepeatMode[] = ['none', 'all', 'one']
    const currentIndex = modes.indexOf(repeatMode.value)
    repeatMode.value = modes[(currentIndex + 1) % modes.length]
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
    isShuffled,
    repeatMode,
    volume,
    isMuted,
    currentSong,
    progressPercentage,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    toggleMute,
    showSkipSong,
    skipMessage,
    showSkipMessage,
    isSkipping,
  }
}
