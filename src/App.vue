<template>
  <div
    id="app"
    class="text-white h-screen-mobile font-inter overflow-hidden relative touch-none scrollbar-hide"
  >
    <!-- PWA 更新提示 -->
    <PWAUpdateModal
      :show-update-modal="showUpdateModal"
      @update-app="handleUpdateApp"
      @dismiss-update="handleDismissUpdate"
    />

    <!-- 确认加入房间模态框 -->
    <JoinRoomModal
      :show="showJoinRoomConfirm"
      @confirm="confirmJoinRoom"
      @cancel="cancelJoinRoom"
    />

    <!-- 手动开始播放模态框 -->
    <ManualStartPlayModal
      :show="needManualStartPlay"
      @close="needManualStartPlay = false"
      @start-play="() => { playAudio(); needManualStartPlay = false; }"
    />

    <!-- 主要内容 -->
    <div v-if="initialized" class="relative z-10 h-full overflow-hidden scrollbar-hide">
      <!-- 音频播放器 - 隐藏但可控制 -->
      <audio
        ref="audioPlayer" preload="auto" @canplay="true" @autoplay="true"
        @timeupdate="onAudioTimeUpdate" @error="onAudioError"
        @play="startProgressUpdate" @pause="stopProgressUpdate"
      >
        <source :src="playerState.currentSong?.url">
        您的浏览器不支持音频播放。
      </audio>

      <!-- 沉浸模式组件 -->
      <ImmersiveMode
        v-if="isImmersiveMode"
        @toggle-immersive="toggleImmersiveMode"
        @show-help="showHelp = true"
      />

      <!-- 主布局组件 - 新 UI -->
      <MainLayout
        v-else
        :is-immersive-mode="isImmersiveMode"
        @show-music-search="showMusicSearchModal = true"
        @show-help="showHelp = true"
        @show-settings="showSettings = true"
        @show-play-history="showPlayHistory = true"
        @toggle-immersive="toggleImmersiveMode"
        @share-room="shareRoom"
        @song-like="(index, title) => sendSongLike(index, title)"
        @song-delete="(songName: string) => sendDeleteSong(songName)"
      />

      <!-- 点歌台模态框 -->
      <transition name="modal">
        <MusicSearchModal
          v-if="showMusicSearchModal"
          @close="showMusicSearchModal = false"
        />
      </transition>

      <!-- 帮助弹窗 -->
      <HelpModal :show="showHelp" @close="showHelp = false" />

      <!-- 设置弹窗 -->
      <SettingsModal v-if="showSettings" @close="showSettings = false" @settings-changed="handleSettingsChanged" />

      <!-- 播放历史弹窗 -->
      <PlayHistoryModal v-if="showPlayHistory" @close="showPlayHistory = false" />

      <!-- 通知容器 -->
      <NotificationContainer />

      <!-- WebSocket 连接配置显示（开发环境） -->
      <div v-if="isDevelopment && !isImmersiveMode && showDebugInfo" class="fixed bottom-4 right-4 z-40">
        <div class="bg-black/80 text-white text-xs p-2 rounded backdrop-blur-sm max-w-xs relative">
          <button
            class="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded hover:bg-white/20 transition-colors"
            @click="showDebugInfo = false"
          >
            <i class="fa-solid fa-times text-xs" />
          </button>
          <div class="font-medium mb-1 pr-5">
            WebSocket 配置
          </div>
          <div>URL: {{ appConfig.websocket.url }}</div>
          <div>状态: {{ connectionStatus }}</div>
          <div v-if="connectionStatus === 'reconnecting'">
            重连次数: {{ reconnectAttempts }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import HelpModal from '@/components/HelpModal.vue'
import ImmersiveMode from '@/components/ImmersiveMode.vue'
import JoinRoomModal from '@/components/JoinRoomModal.vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import ManualStartPlayModal from '@/components/ManualStartPlayModal.vue'
import MusicSearchModal from '@/components/MusicSearchModal.vue'
import NotificationContainer from '@/components/NotificationContainer.vue'
import PlayHistoryModal from '@/components/PlayHistoryModal.vue'
import PWAUpdateModal from '@/components/PWAUpdateModal.vue'
import SettingsModal from '@/components/SettingsModal.vue'
import { useBackButton } from '@/composables/useBackButton'
import { useHistory } from '@/composables/useHistory'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useLyrics } from '@/composables/useLyrics'
import { useMediaSession } from '@/composables/useMediaSession'
import { useNotification } from '@/composables/useNotification'
import { usePlayer } from '@/composables/usePlayer'
import { usePWA } from '@/composables/usePWA'
import { useRoom } from '@/composables/useRoom'
import { useUserSettings } from '@/composables/useUserSettings'
import { useWebSocket } from '@/composables/useWebSocket'
import { getAppConfig, logConfig, validateConfig } from '@/utils/config'
import {
  createPreventScrollHandler,
  createPreventTouchMoveHandler,
  createPreventTouchStartHandler,
  isMobileDevice,
  setViewportHeight,
} from '@/utils/mobile'

// ===== 应用配置 =====
const appConfig = getAppConfig()
const configErrors = validateConfig(appConfig)
const isDevelopment = import.meta.env.DEV

// 配置验证
if (configErrors.length > 0) {
  console.warn('⚠️ 配置错误:', configErrors)
}

// ===== UI 状态管理 =====
const initialized = ref(false) // 应用是否已初始化
const showMusicSearchModal = ref(false)
const showHelp = ref(false)
const showSettings = ref(false)
const showPlayHistory = ref(false)
const showJoinRoomConfirm = ref(true) // 初始显示确认窗口
const isImmersiveMode = ref(false) // 沉浸模式状态
const showDebugInfo = ref(true) // 调试信息显示状态

// ===== DOM 引用 =====
const lyricsContainer = ref<HTMLElement>()

// ===== 组合式函数初始化 =====

// 房间管理
const { roomInfo, setRoomId, setCurrentPassword } = useRoom()

// 1. WebSocket 连接管理
const websocket = useWebSocket()
const {
  connectionStatus,
  connect,
  disconnect,
  reconnectAttempts,
  sendSongLike,
  sendDeleteSong,
} = websocket

// 2. 歌词功能
const {
  registerLyricsContainer,
  unregisterLyricsContainer,
  syncScrollAllContainers,
} = useLyrics()

// 3. 媒体会话控制
const {
  setupActionHandlers,
  clearSession,
  isSupported: isMediaSessionSupported,
} = useMediaSession()

// 4. 播放器核心功能
const {
  playerState,
  audioPlayer,
  skipSong,
  startProgressUpdate,
  stopProgressUpdate,
  onAudioTimeUpdate,
  onAudioError,
  requestMusicSync,
  needManualStartPlay,
  playAudio,
} = usePlayer()

// 5. 通知系统
const {
  showError,
  showInfo,
  showSuccess,
  showConnectionSuccess,
  showConnectionError,
  showConnectionWarning,
} = useNotification()

// 6. PWA 功能
const {
  showUpdateModal,
  handleUpdateApp,
  handleDismissUpdate,
} = usePWA()

// 7. UI 交互功能
// 键盘快捷键处理
useKeyboardShortcuts(isImmersiveMode, toggleImmersiveMode)

const { syncUserSettings } = useUserSettings()
const { addToPlayHistory } = useHistory()

// 返回键处理 - 集中管理所有模态框
useBackButton([
  showMusicSearchModal,
  showHelp,
  showSettings,
  showPlayHistory,
  needManualStartPlay,
])

// ===== UI 交互方法 =====

// 切换沉浸模式
function toggleImmersiveMode() {
  isImmersiveMode.value = !isImmersiveMode.value

  // 切换模式后立即同步歌词位置（使用瞬间跳转，不使用平滑滚动）
  nextTick(() => {
    syncScrollAllContainers(false)
  })
}

// ===== 房间管理方法 =====

// 确认加入房间
function confirmJoinRoom(roomId?: string, password?: string) {
  console.log('✅ 用户确认加入房间', roomId ? `房间ID: ${roomId}` : '')

  // 如果提供了房间ID和密码，更新房间信息
  if (roomId) {
    setRoomId(roomId)
    if (password) {
      setCurrentPassword(password)
    }
  }

  showJoinRoomConfirm.value = false
  initializeApp()
}

// 取消加入房间
function cancelJoinRoom() {
  console.log('❌ 用户取消加入房间')
  alert('您已取消加入房间')
  // 这里可以添加跳转逻辑，比如：
  // window.location.href = '/rooms'
}

// 初始化应用
function initializeApp() {
  console.log('🚀 开始初始化应用')

  initialized.value = true

  // 输出配置信息
  logConfig(appConfig)

  // 初始化媒体会话
  initializeMediaSession()

  // 设置动态标题
  setupDynamicTitle()

  // 启动进度更新
  startProgressUpdate()

  // 使用 nextTick 确保 Vue 完成初始化后再连接
  nextTick(async () => {
    try {
      const roomId = roomInfo.value.id
      console.log('🔗 开始连接房间:', roomId)
      connect()
    } catch (error) {
      console.error('❌ 连接房间失败:', error)
      showError('连接房间失败，请稍后重试')
    }
  })
}

// ===== 响应式监听器 =====

// 监听连接状态变化
watch(connectionStatus, (status) => {
  console.log('🔗 连接状态变化:', status)

  // 根据连接状态显示不同的提示
  switch (status) {
    case 'connecting':
      console.log('⏳ 正在连接服务器...')
      showInfo('正在连接服务器...', { icon: 'fa-solid fa-spinner fa-spin' })
      break
    case 'connected':
      console.log('✅ 已连接到服务器')
      showConnectionSuccess()
      syncUserSettings()
      break
    case 'disconnected':
      console.log('❌ 与服务器断开连接')
      showError('与服务器断开连接', { icon: 'fa-solid fa-wifi' })
      break
    case 'reconnecting':
      console.log('🔄 正在重新连接...')
      showConnectionWarning('正在重新连接...')
      break
    case 'error':
      console.log('🔥 连接错误')
      showConnectionError('连接错误')
      break
  }
})

// 处理设置变更
function handleSettingsChanged(settings: any) {
  console.log('🔧 设置已更新:', settings)
  // 这里可以根据设置变更调整应用行为
  // 例如：应用音频设置、界面设置等
}

// ===== 播放历史记录功能 =====

// 监听歌曲变化，记录播放历史
watch(() => playerState.currentSong, (newSong) => {
  // 记录新歌曲开始播放的时间
  if (newSong) {
    addToPlayHistory(newSong)
  }
})

// ===== 分享功能 =====

// 分享房间
function shareRoom() {
  // 构建包含房间ID的分享链接
  const baseUrl = `${window.location.origin}${window.location.pathname}`
  const shareUrl = `${baseUrl}?houseId=${roomInfo.value.id}&housePwd=`

  const shareData = {
    title: `加入我的音乐房间 - ${roomInfo.value.name}`,
    text: `来和我一起听歌吧！`,
    url: shareUrl,
  }

  // 检查是否支持 Web Share API
  if (navigator.share) {
    navigator.share(shareData).catch((error) => {
      console.log('🚫 分享失败:', error)
      fallbackShare()
    })
  } else {
    fallbackShare()
  }
}

// 降级分享方法：复制链接到剪贴板
function fallbackShare() {
  // 构建包含房间ID的分享链接
  const baseUrl = `${window.location.origin}${window.location.pathname}`
  const url = `${baseUrl}?houseId=${roomInfo.value.id}&housePwd=`

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url).then(() => {
      showSuccess('房间链接已复制到剪贴板！', { icon: 'fa-solid fa-copy' })
    }).catch(() => {
      // 如果复制失败，显示链接供用户手动复制
      prompt('请复制房间链接:', url)
    })
  } else {
    // 兼容性处理：显示链接供用户手动复制
    prompt('请复制房间链接:', url)
  }
}

// ===== 页面功能初始化 =====

// 动态更新页面标题
function setupDynamicTitle() {
  watch(
    () => playerState.currentSong,
    (newSong) => {
      if (newSong) {
        // 有歌曲播放时，显示歌曲信息
        document.title = `${newSong.title} - ${newSong.artist} | ${appConfig.app.name}`
      } else {
        // 没有歌曲播放时，显示默认标题
        document.title = appConfig.app.name
      }
    },
    { immediate: true },
  )
}

// 初始化媒体会话
function initializeMediaSession() {
  if (!isMediaSessionSupported()) {
    console.log('⚠️ 当前浏览器不支持 Media Session API')
    return
  }

  console.log('🎵 初始化媒体会话')

  // 设置媒体会话操作处理器
  setupActionHandlers({
    // 基本播放控制
    // 似乎没法禁用，所以还是实现一下基本功能
    onPlay: () => {
      // 请求重新同步音乐
      requestMusicSync()
    },
    onPause: () => {
      if (audioPlayer.value) {
        audioPlayer.value.pause()
      }
    },
    // 禁用快进快退控制 - 避免用户破坏同步
    onSeekBackward: null,
    onSeekForward: null,
    // 禁用停止控制
    onStop: null,
    // 禁用上一曲（应用不支持）
    onPreviousTrack: null,
    // 只保留下一曲（切歌）功能
    onNextTrack: () => {
      console.log('🎵 媒体会话：用户请求切歌')
      skipSong()
    },
  })
}

// ===== 响应式布局适配 =====

// 响应式移动设备状态
const isMobile = ref(isMobileDevice())

// 用于存储事件监听器引用，便于清理
let viewportResizeHandler: ((this: Window, ev: UIEvent) => any) | null = null
let viewportOrientationHandler: ((this: Window, ev: Event) => any) | null = null
let preventScrollHandler: ((e: Event) => void) | null = null
let preventTouchMoveHandler: ((e: TouchEvent) => void) | null = null
let preventTouchStartHandler: ((e: TouchEvent) => void) | null = null

// 处理窗口大小变化
function handleResize() {
  // 更新视口高度
  setViewportHeight()

  // 检查设备类型是否改变
  const newIsMobile = isMobileDevice()
  if (isMobile.value !== newIsMobile) {
    isMobile.value = newIsMobile
    console.log('📱 设备类型变化:', newIsMobile ? '移动端' : '桌面端')

    // 设备类型变化时更新滚动防护
    updateScrollPrevention()
  }
}

// 更新滚动防护设置
function updateScrollPrevention() {
  // 先清理现有的滚动防护
  if (preventScrollHandler) {
    document.removeEventListener('wheel', preventScrollHandler)
    preventScrollHandler = null
  }
  if (preventTouchMoveHandler) {
    document.removeEventListener('touchmove', preventTouchMoveHandler)
    preventTouchMoveHandler = null
  }
  if (preventTouchStartHandler) {
    document.removeEventListener('touchstart', preventTouchStartHandler)
    preventTouchStartHandler = null
  }

  // 如果是移动设备，添加滚动防护
  if (isMobile.value) {
    preventScrollHandler = createPreventScrollHandler()
    preventTouchMoveHandler = createPreventTouchMoveHandler()
    preventTouchStartHandler = createPreventTouchStartHandler()

    document.addEventListener('wheel', preventScrollHandler, { passive: false, capture: true })
    document.addEventListener('touchmove', preventTouchMoveHandler, { passive: false, capture: true })
    document.addEventListener('touchstart', preventTouchStartHandler, { passive: false, capture: true })
  }
}

// 修复移动端视口高度变化问题和响应式布局
function setupResponsiveLayout() {
  // 设置初始值
  setViewportHeight()
  updateScrollPrevention()

  // 视口变化处理 - 始终监听，不只是移动端
  viewportResizeHandler = handleResize
  viewportOrientationHandler = () => {
    setTimeout(handleResize, 200)
  }

  window.addEventListener('resize', viewportResizeHandler, { passive: true })
  window.addEventListener('orientationchange', viewportOrientationHandler, { passive: true })
}

// 清理响应式布局适配的事件监听器
function cleanupResponsiveLayout() {
  if (viewportResizeHandler) {
    window.removeEventListener('resize', viewportResizeHandler)
    viewportResizeHandler = null
  }

  if (viewportOrientationHandler) {
    window.removeEventListener('orientationchange', viewportOrientationHandler)
    viewportOrientationHandler = null
  }

  if (preventScrollHandler) {
    document.removeEventListener('wheel', preventScrollHandler)
    preventScrollHandler = null
  }

  if (preventTouchMoveHandler) {
    document.removeEventListener('touchmove', preventTouchMoveHandler)
    preventTouchMoveHandler = null
  }

  if (preventTouchStartHandler) {
    document.removeEventListener('touchstart', preventTouchStartHandler)
    preventTouchStartHandler = null
  }
}

// ===== 生命周期钩子 =====

onMounted(() => {
  console.log('📱 页面已加载，等待用户确认加入房间')
  console.log('🔍 当前用户代理:', navigator.userAgent)
  console.log('🔍 当前视口尺寸:', window.innerWidth, 'x', window.innerHeight)

  // 注册歌词容器
  registerLyricsContainer(lyricsContainer)

  // 响应式布局适配
  setupResponsiveLayout()
})

onUnmounted(() => {
  console.log('🔌 页面卸载，清理资源')

  // 取消注册歌词容器
  unregisterLyricsContainer(lyricsContainer)

  // 清除媒体会话
  clearSession()

  // 断开连接并清理资源
  disconnect()
  stopProgressUpdate()

  // 清理响应式布局适配的事件监听器
  cleanupResponsiveLayout()
})
</script>

<style scoped>
/* 歌词样式 */
.lyric-line {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.lyrics-container {
  mask-image: linear-gradient(to bottom,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0) 5%,
    white 30%,
    white 70%,
    rgba(255, 255, 255, 0) 95%,
    rgba(255, 255, 255, 0) 100%
  );
}

/* 歌词容器滚动条样式 */
.lyrics-container {
  scroll-behavior: smooth;
}

.lyrics-container::-webkit-scrollbar {
  width: 4px;
}

.lyrics-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.lyrics-container::-webkit-scrollbar-thumb {
  background: rgba(79, 70, 229, 0.6);
  border-radius: 2px;
}

.lyrics-container::-webkit-scrollbar-thumb:hover {
  background: rgba(79, 70, 229, 0.8);
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
