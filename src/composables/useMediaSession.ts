import type { Song } from '@/types'

// 全局媒体会话状态管理
const actionHandlers: Map<MediaSessionAction, (() => void) | null> = new Map()

// 检查浏览器是否支持 Media Session API
function isSupported() {
  return 'mediaSession' in navigator && 'setActionHandler' in navigator.mediaSession
}

// 更新媒体会话元数据（全局函数）
function updateMetadata(song: Song | null) {
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
  } catch (error) {
    console.warn('更新媒体会话元数据失败:', error)
  }
}

// 设置媒体会话操作处理器（全局函数）
function setupActionHandlers(callbacks: {
  onPlay?: (() => void) | null
  onPause?: (() => void) | null
  onPreviousTrack?: (() => void) | null
  onNextTrack?: (() => void) | null
  onSeekBackward?: (() => void) | null
  onSeekForward?: (() => void) | null
  onStop?: (() => void) | null
}) {
  if (!isSupported()) {
    return
  }

  try {
    // 播放 - 如果传入 null 则明确禁用
    if (callbacks.onPlay !== undefined) {
      actionHandlers.set('play', callbacks.onPlay)
      navigator.mediaSession.setActionHandler('play', callbacks.onPlay)
    }

    // 暂停 - 如果传入 null 则明确禁用
    if (callbacks.onPause !== undefined) {
      actionHandlers.set('pause', callbacks.onPause)
      navigator.mediaSession.setActionHandler('pause', callbacks.onPause)
    }

    // 上一曲 - 如果传入 null 则明确禁用
    if (callbacks.onPreviousTrack !== undefined) {
      actionHandlers.set('previoustrack', callbacks.onPreviousTrack)
      navigator.mediaSession.setActionHandler('previoustrack', callbacks.onPreviousTrack)
    }

    // 下一曲（切歌）
    if (callbacks.onNextTrack !== undefined) {
      actionHandlers.set('nexttrack', callbacks.onNextTrack)
      navigator.mediaSession.setActionHandler('nexttrack', callbacks.onNextTrack)
    }

    // 快退 - 如果传入 null 则明确禁用
    if (callbacks.onSeekBackward !== undefined) {
      actionHandlers.set('seekbackward', callbacks.onSeekBackward)
      navigator.mediaSession.setActionHandler('seekbackward', callbacks.onSeekBackward)
    }

    // 快进 - 如果传入 null 则明确禁用
    if (callbacks.onSeekForward !== undefined) {
      actionHandlers.set('seekforward', callbacks.onSeekForward)
      navigator.mediaSession.setActionHandler('seekforward', callbacks.onSeekForward)
    }

    // 停止 - 如果传入 null 则明确禁用
    if (callbacks.onStop !== undefined) {
      actionHandlers.set('stop', callbacks.onStop)
      navigator.mediaSession.setActionHandler('stop', callbacks.onStop)
    }
  } catch (error) {
    console.warn('设置媒体会话操作处理器失败:', error)
  }
}

// 清除媒体会话（全局函数）
function clearSession() {
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
        actionHandlers.delete(action)
      } catch {
        // 忽略清除失败的操作
      }
    })
  } catch (error) {
    console.warn('清除媒体会话失败:', error)
  }
}

export function useMediaSession() {
  return {
    isSupported,
    updateMetadata,
    setupActionHandlers,
    clearSession,
  }
}
