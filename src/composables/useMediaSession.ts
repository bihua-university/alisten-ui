import type { Song } from '@/types'
import { onUnmounted } from 'vue'

export function useMediaSession() {
  // 检查浏览器是否支持 Media Session API
  const isSupported = () => {
    return 'mediaSession' in navigator && 'setActionHandler' in navigator.mediaSession
  }

  // 更新媒体会话元数据
  const updateMetadata = (song: Song | null) => {
    if (!isSupported() || !song) {
      return
    }

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: song.album || '未知专辑',
        artwork: [{ src: song.cover }],
      })
    }
    catch (error) {
      console.warn('更新媒体会话元数据失败:', error)
    }
  }

  // 更新播放状态
  const updatePlaybackState = (state: 'none' | 'paused' | 'playing') => {
    if (!isSupported()) {
      return
    }

    try {
      navigator.mediaSession.playbackState = state
    }
    catch (error) {
      console.warn('更新播放状态失败:', error)
    }
  }

  // 更新位置状态（进度）
  const updatePositionState = (duration: number, position: number, playbackRate: number = 1.0) => {
    if (!isSupported()) {
      return
    }

    try {
      if ('setPositionState' in navigator.mediaSession) {
        // 确保 position 不超过 duration
        const clampedPosition = Math.min(position, duration)

        navigator.mediaSession.setPositionState({
          duration,
          playbackRate,
          position: clampedPosition,
        })
      }
    }
    catch (error) {
      console.warn('更新位置状态失败:', error)
    }
  }

  // 设置媒体会话操作处理器
  const setupActionHandlers = (callbacks: {
    onPlay?: (() => void) | null
    onPause?: (() => void) | null
    onPreviousTrack?: (() => void) | null
    onNextTrack?: (() => void) | null
    onSeekBackward?: (() => void) | null
    onSeekForward?: (() => void) | null
    onStop?: (() => void) | null
  }) => {
    if (!isSupported()) {
      return
    }

    try {
      // 播放 - 如果传入 null 则明确禁用
      if (callbacks.onPlay === null) {
        navigator.mediaSession.setActionHandler('play', null)
      }
      else if (callbacks.onPlay) {
        navigator.mediaSession.setActionHandler('play', callbacks.onPlay)
      }

      // 暂停 - 如果传入 null 则明确禁用
      if (callbacks.onPause === null) {
        navigator.mediaSession.setActionHandler('pause', null)
      }
      else if (callbacks.onPause) {
        navigator.mediaSession.setActionHandler('pause', callbacks.onPause)
      }

      // 上一曲 - 如果传入 null 则明确禁用
      if (callbacks.onPreviousTrack === null) {
        navigator.mediaSession.setActionHandler('previoustrack', null)
      }
      else if (callbacks.onPreviousTrack) {
        navigator.mediaSession.setActionHandler('previoustrack', callbacks.onPreviousTrack)
      }

      // 下一曲（切歌）
      if (callbacks.onNextTrack === null) {
        navigator.mediaSession.setActionHandler('nexttrack', null)
      }
      else if (callbacks.onNextTrack) {
        navigator.mediaSession.setActionHandler('nexttrack', callbacks.onNextTrack)
      }

      // 快退 - 如果传入 null 则明确禁用
      if (callbacks.onSeekBackward === null) {
        navigator.mediaSession.setActionHandler('seekbackward', null)
      }
      else if (callbacks.onSeekBackward) {
        navigator.mediaSession.setActionHandler('seekbackward', callbacks.onSeekBackward)
      }

      // 快进 - 如果传入 null 则明确禁用
      if (callbacks.onSeekForward === null) {
        navigator.mediaSession.setActionHandler('seekforward', null)
      }
      else if (callbacks.onSeekForward) {
        navigator.mediaSession.setActionHandler('seekforward', callbacks.onSeekForward)
      }

      // 停止 - 如果传入 null 则明确禁用
      if (callbacks.onStop === null) {
        navigator.mediaSession.setActionHandler('stop', null)
      }
      else if (callbacks.onStop) {
        navigator.mediaSession.setActionHandler('stop', callbacks.onStop)
      }
    }
    catch (error) {
      console.warn('设置媒体会话操作处理器失败:', error)
    }
  }

  // 清除媒体会话
  const clearSession = () => {
    if (!isSupported()) {
      return
    }

    try {
      navigator.mediaSession.metadata = null
      navigator.mediaSession.playbackState = 'none'

      // 清除所有操作处理器
      const actions: MediaSessionAction[] = [
        'play',
        'pause',
        'previoustrack',
        'nexttrack',
        'seekbackward',
        'seekforward',
        'stop',
      ]

      actions.forEach((action) => {
        try {
          navigator.mediaSession.setActionHandler(action, null)
        }
        catch {
          // 忽略清除失败的操作
        }
      })
    }
    catch (error) {
      console.warn('清除媒体会话失败:', error)
    }
  }

  // 组件卸载时清理
  onUnmounted(() => {
    clearSession()
  })

  return {
    isSupported,
    updateMetadata,
    updatePlaybackState,
    updatePositionState,
    setupActionHandlers,
    clearSession,
  }
}
