<template>
  <div
    id="app"
    class="bg-gradient-to-br from-dark to-gray-900 text-light min-h-screen font-inter overflow-hidden relative"
  >
    <!-- 确认加入房间模态框 -->
    <transition name="modal">
      <div v-if="showJoinRoomConfirm" class="fixed inset-0 z-[100] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-md" />
        <div
          class="relative bg-dark border border-white/20 rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl"
        >
          <!-- 房间信息展示 -->
          <div class="p-6 text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <i class="fa-solid fa-music text-primary text-2xl" />
            </div>
            <h2 class="text-xl font-semibold mb-2">
              确认加入房间
            </h2>
            <div class="bg-white/5 rounded-lg p-4 mb-6 text-left">
              <div class="flex items-center mb-3">
                <i class="fa-solid fa-door-open text-primary mr-2" />
                <span class="font-medium">{{ roomInfo.name }}</span>
              </div>
              <div class="flex items-center">
                <i class="fa-solid fa-users text-primary mr-2" />
                <span class="text-sm text-gray-300">房间ID：{{ roomInfo.id }}</span>
              </div>
            </div>
            <p class="text-sm text-gray-400 mb-6">
              加入后您将与其他用户一起听歌、聊天和互动
            </p>
            <div class="flex space-x-3">
              <button
                class="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-full py-3 px-4 transition-all"
                @click="cancelJoinRoom"
              >
                取消
              </button>
              <button
                class="flex-1 bg-primary hover:bg-primary/90 text-white rounded-full py-3 px-4 transition-all"
                @click="confirmJoinRoom"
              >
                加入房间
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 动态背景 -->
    <div v-if="!isImmersiveMode" class="fixed inset-0 z-0">
      <div class="absolute inset-0 bg-gradient-to-br from-dark to-gray-900" />
      <div v-if="playerState.currentSong" class="absolute inset-0 opacity-50 dynamic-bg">
        <img
          :key="playerState.currentSong.id" :src="playerState.currentSong.cover" :alt="playerState.currentSong.title"
          class="w-full h-full object-cover blur-3xl scale-110 transition-all duration-1000"
        >
        <div class="absolute inset-0 bg-overlay" />
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="relative z-10">
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
      <main class="flex" :class="[isImmersiveMode ? 'h-screen' : 'h-[calc(100vh)]']">
        <!-- 左侧播放列表 -->
        <PlaylistComponent
          :playlist="processedPlaylist"
          :is-immersive-mode="isImmersiveMode"
          @song-like="(index, title) => sendSongLike(index, title)"
          @song-delete="(songName: string) => sendDeleteSong(songName)"
        />

        <!-- 中间歌词区域 -->
        <section class="flex-1 flex flex-col overflow-hidden relative">
          <!-- 房间信息 -->
          <div
            v-if="!isImmersiveMode"
            class="p-3 sm:p-4 border-b border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-center glass-effect bg-dark/70 backdrop-blur-xl space-y-2 sm:space-y-0"
          >
            <div class="flex-1 min-w-0">
              <h2 class="text-base sm:text-lg font-semibold truncate flex items-center">
                {{ roomInfo.name }}
                <!-- 连接状态指示器 -->
                <div class="ml-2 flex items-center">
                  <div
                    class="w-2 h-2 rounded-full transition-all duration-300" :class="[connectionStatus === 'connected' ? 'bg-green-500'
                      : connectionStatus === 'connecting' || connectionStatus === 'reconnecting' ? 'bg-yellow-500 animate-pulse'
                        : connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-500']"
                    :title="getConnectionStatusText()"
                  />
                </div>
              </h2>
              <p class="text-xs text-gray-400 truncate">
                {{ onlineUsers.length }}人在线
              </p>
            </div>

            <div class="flex items-center space-x-2 sm:space-x-2 flex-shrink-0">
              <!-- 切歌 -->
              <button
                :disabled="playerState.isSkipping"
                class="bg-orange-500/20 hover:bg-orange-500/30 active:bg-orange-500/40 text-orange-400 rounded-full py-2 px-3 sm:px-4 flex items-center text-xs sm:text-sm transition-all touch-target"
                :class="[{ 'opacity-50 cursor-not-allowed': playerState.isSkipping }]" @click="skipSong"
              >
                <i
                  :class="playerState.isSkipping ? 'fa-solid fa-spinner fa-spin mr-1 sm:mr-2' : 'fa-solid fa-forward mr-1 sm:mr-2'"
                />
                <span class="hidden sm:inline">{{ playerState.isSkipping ? '切歌中...' : '切歌' }}</span>
                <span class="sm:hidden">{{ playerState.isSkipping ? '切歌中' : '切歌' }}</span>
              </button>

              <!-- 点歌台 -->
              <button
                class="bg-white/10 hover:bg-white/20 active:bg-white/30 text-white rounded-full py-2 px-3 sm:px-4 flex items-center text-xs sm:text-sm transition-all touch-target"
                @click="showMusicSearchModal = true"
              >
                <i class="fa-solid fa-music mr-1 sm:mr-2" />
                <span class="hidden sm:inline">点歌台</span>
                <span class="sm:hidden">点歌</span>
              </button>

              <!-- 分享 -->
              <button
                class="bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 text-blue-400 rounded-full py-2 px-3 sm:px-4 flex items-center text-xs sm:text-sm transition-all touch-target"
                @click="shareRoom"
              >
                <i class="fa-solid fa-share mr-1 sm:mr-2" />
                <span class="hidden sm:inline">分享</span>
                <span class="sm:hidden">分享</span>
              </button>

              <!-- 帮助 -->
              <button
                class="bg-green-500/20 hover:bg-green-500/30 active:bg-green-500/40 text-green-400 rounded-full py-2 px-3 sm:px-4 flex items-center text-xs sm:text-sm transition-all touch-target"
                @click="showHelp = true"
              >
                <i class="fa-solid fa-question-circle mr-1 sm:mr-2" />
                <span class="hidden sm:inline">帮助</span>
                <span class="sm:hidden">帮助</span>
              </button>

              <!-- 沉浸模式, 移动端隐藏 -->
              <div class="hidden md:block">
                <button
                  class="bg-purple-500/20 hover:bg-purple-500/30 active:bg-purple-500/40 text-purple-400 rounded-full py-2 px-3 sm:px-4 flex items-center text-xs sm:text-sm transition-all touch-target"
                  @click="toggleImmersiveMode"
                >
                  <i
                    :class="isImmersiveMode ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"
                    class="mr-1 sm:mr-2 hidden md:block"
                  />
                  <span class="hidden md:block">{{ isImmersiveMode ? '退出沉浸' : '沉浸模式' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 歌词显示区域 -->
          <div
            v-if="!isImmersiveMode" ref="lyricsContainer"
            class="lyrics-container overflow-y-auto p-2 sm:p-4 md:p-8 relative smooth-scroll scrollbar-hide flex-1"
          >
            <!-- 切歌提示消息 -->
            <transition name="modal">
              <div v-if="playerState.showSkipMessage" class="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div
                  class="bg-orange-500/90 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm message-bubble"
                >
                  <i class="fa-solid fa-forward mr-2" />{{ playerState.skipMessage }}
                </div>
              </div>
            </transition>

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
            ref="immersiveModeRef"
            :current-song="playerState.currentSong" :lyrics="currentLyrics"
            :current-lyric-index="currentLyricIndex"
            :progress-percentage="progressPercentage"
            :current-time="playerState.currentTime"
            @toggle-immersive="toggleImmersiveMode"
            @show-help="showHelp = true"
          />

          <!-- 进度条 - 仅非沉浸模式 -->
          <div
            v-if="!isImmersiveMode"
            class="h-3 md:h-1 bg-white/10 rounded-full overflow-hidden relative hidden md:block"
          >
            <div
              class="h-full immersive-progress rounded-full transition-all duration-300"
              :style="{ width: `${progressPercentage}%` }"
            />
          </div>

          <!-- 播放信息区域 - 仅非沉浸模式 -->
          <div v-if="!isImmersiveMode" class="glass-effect bg-dark/80 backdrop-blur-xl p-3 sm:p-4">
            <div class="flex items-center">
              <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden mr-3 sm:mr-4 flex-shrink-0">
                <img
                  :src="playerState.currentSong?.cover" :alt="playerState.currentSong?.title"
                  class="w-full h-full object-cover"
                >
              </div>
              <div class="flex-1 mr-2 sm:mr-4 min-w-0">
                <h3 class="font-medium text-sm sm:text-base truncate">
                  {{ playerState.currentSong?.title }}
                </h3>
                <p class="text-xs text-gray-400 truncate">
                  {{ playerState.currentSong?.artist }}{{
                    playerState.currentSong?.album
                      ? ` - ${playerState.currentSong?.album}` : '' }}
                </p>
              </div>
              <div class="flex flex-col items-center space-x-2 sm:space-x-3 flex-shrink-0">
                <div class="relative ml-auto">
                  <div class="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{{ formatTime(playerState.currentTime || 0) }} /
                      {{ formatTime((playerState.currentSong?.duration || 0) / 1000) }}</span>
                  </div>
                </div>

                <!-- 音量控制 -->
                <div class="hidden md:flex">
                  <VolumeSlider
                    v-model:volume="volume" v-model:is-muted="isMuted" @volume-change="handleVolumeChange"
                    @mute-toggle="handleMuteToggle"
                  />
                </div>
              </div>
            </div>
          </div>

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
          <div class="flex-1 flex flex-col overflow-hidden h-[calc(100vh-300px)]">
            <ChatComponent
              :messages="chatMessages"
              is-desktop
              @send-message="sendMessage"
            />
          </div>

          <!-- 在线用户列表 - 固定在底部 -->
          <UserListComponent
            :users="onlineUsers"
            is-desktop
            @refresh="refreshOnlineUsers"
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
            class="relative bg-dark border-t border-white/20 md:rounded-xl w-full max-w-4xl h-[85vh] md:max-h-[90vh] flex flex-col overflow-hidden"
          >
            <ChatComponent
              :messages="chatMessages"
              show-close-button
              @close="showMobileChat = false"
              @send-message="sendMessage"
            />
          </div>
        </div>
      </transition>

      <!-- 移动端用户列表模态框 -->
      <UserListComponent
        :users="onlineUsers"
        :show="showMobileUsers"
        @close="showMobileUsers = false"
        @refresh="refreshOnlineUsers"
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
          <div>状态: {{ getConnectionStatusText() }}</div>
          <div v-if="connectionStatus === 'reconnecting'">
            重连次数: {{ reconnectAttempts }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RoomInfo, Song } from '@/types'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import ChatComponent from '@/components/ChatComponent.vue'
import HelpModal from '@/components/HelpModal.vue'
import ImmersiveMode from '@/components/ImmersiveMode.vue'
import MusicSearchModal from '@/components/MusicSearchModal.vue'
import NotificationContainer from '@/components/NotificationContainer.vue'
import PlaylistComponent from '@/components/PlaylistComponent.vue'
import PWAUpdateModal from '@/components/PWAUpdateModal.vue'
import UserListComponent from '@/components/UserListComponent.vue'
import VolumeSlider from '@/components/VolumeSlider.vue'
import { useBackButton } from '@/composables/useBackButton'
import { useChat } from '@/composables/useChat'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useLyrics } from '@/composables/useLyrics'
import { useMediaSession } from '@/composables/useMediaSession'
import { useNotification } from '@/composables/useNotification'
import { usePlayer } from '@/composables/usePlayer'
import { usePWA } from '@/composables/usePWA'
import { useWebSocket } from '@/composables/useWebSocket'
import { getAppConfig, logConfig, validateConfig } from '@/utils/config'
import { formatTime } from '@/utils/time'
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
const showMusicSearchModal = ref(false)
const showHelp = ref(false)
const showMobileChat = ref(false)
const showMobileUsers = ref(false)
const showMobilePlaylist = ref(false)
const showJoinRoomConfirm = ref(true) // 初始显示确认窗口
const isImmersiveMode = ref(false) // 沉浸模式状态

// ===== DOM 引用 =====
const lyricsContainer = ref<HTMLElement>()
const immersiveModeRef = ref<any>()

// ===== 房间数据 =====
const roomInfo = ref<RoomInfo>({
  id: 'room_001',
  name: '听歌房',
  description: '欢迎来到听歌房！',
  population: 0,
  needPwd: false,
})

// ===== 组合式函数初始化 =====

// 1. WebSocket 连接管理
const websocket = useWebSocket()
const {
  connectionStatus,
  connect,
  disconnect,
  reconnectAttempts,
  send,
  sendSongLike,
  sendDeleteSong,
} = websocket

// 2. 聊天功能
const chat = useChat()
const {
  chatMessages,
  onlineUsers,
  sendMessage,
} = chat

// 4. 歌词功能
const {
  currentLyrics,
  currentLyricIndex,
  registerLyricsContainer,
  unregisterLyricsContainer,
  syncScrollAllContainers,
} = useLyrics()

// 5. 媒体会话控制
const {
  updateMetadata,
  setupActionHandlers,
  isSupported: isMediaSessionSupported,
} = useMediaSession()

// 6. 播放器核心功能
const {
  playerState,
  audioPlayer,
  volume,
  isMuted,
  showSkipSong,
  playAudio,
  startProgressUpdate,
  stopProgressUpdate,
  onAudioTimeUpdate,
  onAudioError,
} = usePlayer({
  updateMetadata,
})

// 7. 通知系统
const {
  showError,
  showInfo,
  showSuccess,
  showConnectionSuccess,
  showConnectionError,
  showConnectionWarning,
} = useNotification()

// 8. PWA 功能
const {
  showUpdateModal,
  handleUpdateApp,
  handleDismissUpdate,
} = usePWA()

// 9. UI 交互功能
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

// 播放进度百分比
const progressPercentage = computed(() => {
  if (playerState.currentSong?.duration) {
    return (playerState.currentTime / (playerState.currentSong.duration / 1000)) * 100
  }
  return 0
})

// ===== 工具方法 =====

// 获取连接状态文本描述
function getConnectionStatusText() {
  switch (connectionStatus.value) {
    case 'connected':
      return '已连接到服务器'
    case 'connecting':
      return '正在连接服务器...'
    case 'reconnecting':
      return '正在重新连接...'
    case 'error':
      return '连接错误'
    case 'disconnected':
      return '未连接'
    default:
      return '未知状态'
  }
}

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
  showJoinRoomConfirm.value = false
  initializeApp()
}

// 取消加入房间
function cancelJoinRoom() {
  alert('您已取消加入房间')
  // 这里可以添加跳转逻辑，比如：
  // window.location.href = '/rooms'
}

// 初始化应用
function initializeApp() {
  console.log('🚀 开始初始化应用')

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
      connect(roomId)
    } catch (error) {
      console.error('❌ 连接房间失败:', error)
      showError('连接房间失败，请稍后重试')
    }
  })
}

// 刷新在线用户列表
function refreshOnlineUsers() {
  send({
    action: '/house/houseuser',
    data: {},
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

// ===== 音乐播放控制 =====

// 切歌功能
function skipSong() {
  send({
    action: '/music/skip/vote',
    data: {},
  })
  showSkipSong()
}

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

// ===== 音量控制处理 =====

// 音量变化处理
function handleVolumeChange(newVolume: number) {
  volume.value = newVolume
}

// 静音状态切换处理
function handleMuteToggle(muted: boolean) {
  isMuted.value = muted
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
      playAudio()
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
      showSkipSong()
      skipSong()
    },
  })
}

// ===== 生命周期钩子 =====

onMounted(() => {
  console.log('📱 页面已加载，等待用户确认加入房间')

  // 注册歌词容器
  if (lyricsContainer.value) {
    registerLyricsContainer(lyricsContainer.value)
  }
})

onUnmounted(() => {
  console.log('🔌 页面卸载，清理资源')

  // 取消注册歌词容器
  if (lyricsContainer.value) {
    unregisterLyricsContainer(lyricsContainer.value)
  }

  // 断开连接并清理资源
  disconnect()
  stopProgressUpdate()
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

/* 模态框动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
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
