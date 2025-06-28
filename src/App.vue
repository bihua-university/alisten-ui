<template>
  <div
    id="app"
    class="bg-gradient-to-br from-dark to-gray-900 text-light h-screen-mobile font-inter overflow-hidden relative touch-none"
    style="scrollbar-width: none; -ms-overflow-style: none;"
  >
    <!-- 确认加入房间模态框 -->
    <JoinRoomModal
      :show="showJoinRoomConfirm"
      @confirm="confirmJoinRoom"
      @cancel="cancelJoinRoom"
    />

    <!-- 动态背景 -->
    <div v-if="!isImmersiveMode && initialized" class="fixed inset-0 z-0">
      <div class="absolute inset-0 bg-gradient-to-br from-dark to-gray-900" />
      <div v-if="playerState.currentSong" class="absolute inset-0 opacity-50">
        <img
          :key="playerState.currentSong.id" :src="playerState.currentSong.cover" :alt="playerState.currentSong.title"
          class="w-full h-full object-cover blur-3xl scale-110 transition-all duration-1000"
        >
        <div class="absolute inset-0 bg-overlay" />
      </div>
    </div>

    <!-- 主要内容 -->
    <div v-if="initialized" class="relative z-10 h-full overflow-hidden" style="scrollbar-width: none; -ms-overflow-style: none;">
      <!-- 音频播放器 - 隐藏但可控制 -->
      <audio
        ref="audioPlayer" preload="auto" @canplay="true" @autoplay="true"
        @timeupdate="onAudioTimeUpdate" @error="onAudioError"
        @play="startProgressUpdate" @pause="stopProgressUpdate" @ended="stopProgressUpdate"
      >
        <source :src="playerState.currentSong?.url">
        您的浏览器不支持音频播放。
      </audio>

      <!-- 主内容区 -->
      <main class="flex h-screen-mobile" style="scrollbar-width: none; -ms-overflow-style: none;">
        <!-- 左侧播放列表 -->
        <PlaylistComponent
          :playlist="processedPlaylist"
          :is-immersive-mode="isImmersiveMode"
          @song-like="(index, title) => sendSongLike(index, title)"
          @song-delete="(songName: string) => sendDeleteSong(songName)"
        />

        <!-- 中间歌词区域 -->
        <section class="flex-1 flex flex-col overflow-hidden relative">
          <!-- 顶部栏 -->
          <TopBar
            v-if="!isImmersiveMode"
            :room-info="roomInfo"
            :connection-status="connectionStatus"
            @show-music-search="showMusicSearchModal = true"
            @share-room="shareRoom"
            @show-help="showHelp = true"
            @toggle-immersive="toggleImmersiveMode"
          />

          <!-- 歌词显示区域 -->
          <div
            v-if="!isImmersiveMode" ref="lyricsContainer"
            class="lyrics-container overflow-y-auto p-2 sm:p-4 md:p-8 relative smooth-scroll scrollbar-hide flex-1"
          >
            <div
              class="lyrics-content mx-auto text-center space-y-1 transition-all duration-500 px-2 sm:px-4 max-w-2xl"
            >
              <div
                v-for="(line, index) in currentLyrics" :key="index"
                class="lyric-line transition-all duration-300" :class="[{
                  'active text-white font-medium mb-3 mt-3': index === currentLyricIndex,
                  'text-gray-400 mb-1': index !== currentLyricIndex,
                  'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl': index === currentLyricIndex,
                  'text-sm sm:text-base md:text-lg': index !== currentLyricIndex,
                }]"
              >
                {{ line.text }}
              </div>

              <!-- 当没有歌词时的占位符 -->
              <div v-if="currentLyrics.length === 0" class="text-gray-400 py-8">
                <i class="fa-solid fa-music text-4xl mb-4 opacity-50" />
                <p class="text-sm">
                  暂无歌词
                </p>
              </div>
            </div>
          </div>
          <!-- 沉浸模式组件 -->
          <ImmersiveMode
            v-if="isImmersiveMode"
            @toggle-immersive="toggleImmersiveMode"
            @show-help="showHelp = true"
          />

          <!-- 播放信息组件 - 仅非沉浸模式 -->
          <PlayerInfo v-if="!isImmersiveMode" />

          <!-- 移动端底部导航 -->
          <div v-if="!isImmersiveMode" class="left-0 right-0 bg-dark/50 backdrop-blur-md z-30 md:hidden">
            <div class="flex justify-around items-center py-2 px-2">
              <button
                class="flex flex-col items-center text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all min-w-0 flex-1 py-2 px-1 rounded-lg touch-target"
                @click="showMusicSearchModal = true"
              >
                <i class="fa-solid fa-music text-lg" />
                <span class="text-xs mt-1 truncate">点歌</span>
              </button>
              <button
                class="flex flex-col items-center text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all min-w-0 flex-1 py-2 px-1 rounded-lg touch-target"
                @click="showMobilePlaylist = true"
              >
                <i class="fa-solid fa-list-ul text-lg" />
                <span class="text-xs mt-1 truncate">列表</span>
              </button>
              <button
                class="flex flex-col items-center text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all min-w-0 flex-1 py-2 px-1 rounded-lg touch-target"
                @click="showMobileChat = true"
              >
                <i class="fa-solid fa-comments text-lg" />
                <span class="text-xs mt-1 truncate">聊天</span>
              </button>
              <button
                class="flex flex-col items-center text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all min-w-0 flex-1 py-2 px-1 rounded-lg touch-target"
                @click="showMobileUsers = true"
              >
                <i class="fa-solid fa-users text-lg" />
                <span class="text-xs mt-1 truncate">用户</span>
              </button>
            </div>
          </div>
        </section>
        <!-- 右侧聊天和用户列表 -->
        <aside
          v-if="!isImmersiveMode"
          class="w-72 glass-effect bg-dark/60 backdrop-blur-xl border-l border-white/10 hidden lg:flex overflow-hidden flex-col"
        >
          <!-- 聊天区域 -->
          <div class="flex-1 flex flex-col overflow-hidden">
            <ChatComponent
              is-desktop
            />
          </div>

          <!-- 在线用户列表 - 固定在底部 -->
          <UserListComponent
            is-desktop
          />
        </aside>
      </main>

      <!-- 点歌台模态框 -->
      <MusicSearchModal
        v-if="showMusicSearchModal"
        @close="showMusicSearchModal = false"
      />

      <!-- 帮助弹窗 -->
      <HelpModal :show="showHelp" @close="showHelp = false" />

      <!-- 移动端播放列表模态框 -->
      <PlaylistComponent
        :playlist="processedPlaylist"
        :show="showMobilePlaylist"
        :is-mobile="true"
        @close="showMobilePlaylist = false"
        @song-like="(index, title) => sendSongLike(index, title)"
        @song-delete="(songName: string) => sendDeleteSong(songName)"
      />

      <!-- 移动端聊天模态框 -->
      <transition name="modal">
        <div v-if="showMobileChat" class="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showMobileChat = false" />
          <div
            class="relative bg-dark border-t border-white/20 md:rounded-xl w-full max-w-4xl h-[calc(var(--vh,1vh)*85)] md:max-h-[calc(var(--vh,1vh)*90)] flex flex-col overflow-hidden"
          >
            <ChatComponent
              show-close-button
              @close="showMobileChat = false"
            />
          </div>
        </div>
      </transition>

      <!-- 移动端用户列表模态框 -->
      <UserListComponent
        :show="showMobileUsers"
        @close="showMobileUsers = false"
      />

      <!-- 通知容器 -->
      <NotificationContainer />
      <!-- PWA 更新提示 -->
      <PWAUpdateModal
        :show-update-modal="showUpdateModal"
        @update-app="handleUpdateApp"
        @dismiss-update="handleDismissUpdate"
      />

      <!-- WebSocket 连接配置显示（开发环境） -->
      <div v-if="isDevelopment && !isImmersiveMode" class="fixed bottom-4 right-4 z-40">
        <div class="bg-black/80 text-white text-xs p-2 rounded backdrop-blur-sm max-w-xs">
          <div class="font-medium mb-1">
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
import type { Song } from '@/types'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import ChatComponent from '@/components/ChatComponent.vue'
import HelpModal from '@/components/HelpModal.vue'
import ImmersiveMode from '@/components/ImmersiveMode.vue'
import JoinRoomModal from '@/components/JoinRoomModal.vue'
import MusicSearchModal from '@/components/MusicSearchModal.vue'
import NotificationContainer from '@/components/NotificationContainer.vue'
import PlayerInfo from '@/components/PlayerInfo.vue'
import PlaylistComponent from '@/components/PlaylistComponent.vue'
import PWAUpdateModal from '@/components/PWAUpdateModal.vue'
import TopBar from '@/components/TopBar.vue'
import UserListComponent from '@/components/UserListComponent.vue'
import { useBackButton } from '@/composables/useBackButton'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useLyrics } from '@/composables/useLyrics'
import { useMediaSession } from '@/composables/useMediaSession'
import { useNotification } from '@/composables/useNotification'
import { usePlayer } from '@/composables/usePlayer'
import { usePWA } from '@/composables/usePWA'
import { useRoom } from '@/composables/useRoom'
import { useWebSocket } from '@/composables/useWebSocket'
import { getAppConfig, logConfig, validateConfig } from '@/utils/config'
import {
  createPreventScrollHandler,
  createPreventTouchMoveHandler,
  createPreventTouchStartHandler,
  isMobileDevice,
  setViewportHeight,
} from '@/utils/mobile'
import { processUser } from '@/utils/user'

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
const showMobileChat = ref(false)
const showMobileUsers = ref(false)
const showMobilePlaylist = ref(false)
const showJoinRoomConfirm = ref(true) // 初始显示确认窗口
const isImmersiveMode = ref(false) // 沉浸模式状态

// ===== DOM 引用 =====
const lyricsContainer = ref<HTMLElement>()

// ===== 组合式函数初始化 =====

// 房间管理
const { roomInfo } = useRoom()

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
  currentLyrics,
  currentLyricIndex,
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

// 返回键处理 - 集中管理所有模态框
useBackButton([
  showMusicSearchModal,
  showMobilePlaylist,
  showMobileChat,
  showMobileUsers,
  showHelp,
])

// ===== 计算属性 =====

// 处理后的播放列表数据
const processedPlaylist = computed(() =>
  playerState.playlist.map((song: Song) => ({
    ...song,
    requestedBy: song.requestedBy ? processUser(song.requestedBy) : undefined,
  })),
)

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
function confirmJoinRoom() {
  console.log('✅ 用户确认加入房间')
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

// ===== 分享功能 =====

// 分享房间
function shareRoom() {
  const shareData = {
    title: `加入我的音乐房间 - ${roomInfo.value.name}`,
    text: `来和我一起听歌吧！`,
    url: window.location.href,
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
  const url = window.location.href

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

// ===== 移动端适配 =====

// ===== 移动端适配 =====

// 用于存储事件监听器引用，便于清理
let viewportResizeHandler: ((this: Window, ev: UIEvent) => any) | null = null
let viewportOrientationHandler: ((this: Window, ev: Event) => any) | null = null
let preventScrollHandler: ((e: Event) => void) | null = null
let preventTouchMoveHandler: ((e: TouchEvent) => void) | null = null

// 修复移动端视口高度变化问题
function setupMobileViewportFix() {
  // 总是设置初始值
  setViewportHeight()

  // 检查是否需要移动端适配
  if (!isMobileDevice()) {
    return
  }

  // 创建事件处理器
  const preventScroll = createPreventScrollHandler()
  const preventTouchMove = createPreventTouchMoveHandler()
  const preventTouchStart = createPreventTouchStartHandler()

  // 存储事件处理器引用
  preventScrollHandler = preventScroll
  preventTouchMoveHandler = preventTouchMove

  // 添加事件监听器
  document.addEventListener('wheel', preventScrollHandler, { passive: false, capture: true })
  document.addEventListener('touchmove', preventTouchMoveHandler, { passive: false, capture: true })
  document.addEventListener('touchstart', preventTouchStart, { passive: false, capture: true })

  // 视口变化处理
  viewportResizeHandler = setViewportHeight
  viewportOrientationHandler = () => {
    setTimeout(setViewportHeight, 200)
  }

  window.addEventListener('resize', viewportResizeHandler, { passive: true })
  window.addEventListener('orientationchange', viewportOrientationHandler, { passive: true })
}

// 清理移动端视口适配的事件监听器
function cleanupMobileViewportFix() {
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
}

// ===== 生命周期钩子 =====

onMounted(() => {
  console.log('📱 页面已加载，等待用户确认加入房间')
  console.log('🔍 当前用户代理:', navigator.userAgent)
  console.log('🔍 当前视口尺寸:', window.innerWidth, 'x', window.innerHeight)

  // 注册歌词容器
  registerLyricsContainer(lyricsContainer)

  // 移动端视口高度适配
  setupMobileViewportFix()
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

  // 清理移动端适配的事件监听器
  cleanupMobileViewportFix()
})
</script>

<style scoped>
/* 歌词样式 */
.lyric-line {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
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
