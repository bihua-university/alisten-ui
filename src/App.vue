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
              <div class="flex items-center mb-3">
                <i class="fa-solid fa-user text-primary mr-2" />
                <span class="text-sm text-gray-300">房主：{{ roomInfo.creator }}</span>
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
    <div class="fixed inset-0 z-0">
      <div class="absolute inset-0 bg-gradient-to-br from-dark to-gray-900" />
      <div v-if="roomState.currentSong" class="absolute inset-0 opacity-50 dynamic-bg">
        <img
          :key="roomState.currentSong.id" :src="roomState.currentSong.cover" :alt="roomState.currentSong.title"
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
      >
        <source :src="roomState.currentSong?.url">
        您的浏览器不支持音频播放。
      </audio>

      <!-- 移动端侧边菜单 -->
      <transition name="slide">
        <div
          v-if="showMobileMenu"
          class="fixed inset-y-0 left-0 w-64 glass-effect bg-dark/95 backdrop-blur-md border-r border-white/10 z-50"
        >
          <div class="p-4 border-b border-white/10">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">
                菜单
              </h2>
              <button class="text-gray-400 hover:text-white transition-colors touch-target" @click="toggleMobileMenu">
                <i class="fa-solid fa-times text-lg" />
              </button>
            </div>
          </div>
          <div class="p-4 space-y-4">
            <div class="relative">
              <input
                v-model="searchQuery" type="text" placeholder="搜索歌曲"
                class="w-full bg-white/10 rounded-full py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400"
              >
              <i class="fa-solid fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button
              class="w-full bg-primary hover:bg-primary/90 active:bg-primary/80 text-white rounded-full py-3 px-4 flex items-center justify-center space-x-2 transition-all touch-target"
            >
              <i class="fa-solid fa-plus" />
              <span>创建房间</span>
            </button>
          </div>
        </div>
      </transition>
      <!-- 主内容区 -->
      <main class="flex" :class="[isImmersiveMode ? 'h-screen' : 'h-[calc(100vh)]']">
        <!-- 左侧播放列表 -->
        <aside
          v-if="!isImmersiveMode"
          class="w-72 bg-dark/60 backdrop-blur-xl border-r border-white/10 hidden md:block overflow-y-auto scrollbar-hide"
        >
          <div class="p-4 border-b border-white/10">
            <h2 class="text-lg font-semibold flex items-center">
              <i class="fa-solid fa-list-ul mr-2 text-primary" />播放列表
            </h2>
            <p class="text-xs text-gray-400 mt-1">
              共 {{ roomState.playlist.length }} 首歌曲
            </p>
          </div>
          <div class="playlist-container space-y-1">
            <div
              v-for="(song, index) in processedPlaylist" :key="song.id"
              class="playlist-item p-3 flex items-center hover:bg-white/5 cursor-pointer transition-all"
              :class="[{ 'bg-primary/20 hover:bg-primary/25 border-l-4 border-primary': index === 0 }]"
            >
              <div class="w-10 h-10 rounded bg-gray-700 overflow-hidden mr-3">
                <img :src="song.cover" :alt="song.title" class="w-full h-full object-cover">
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-medium truncate">
                  {{ song.title }}
                </h3>
                <p class="text-xs text-gray-400 truncate">
                  {{ song.artist }}
                </p>
                <div class="flex items-center mt-1 space-x-2">
                  <div class="requester-info">
                    <img :src="song.requestedBy?.avatar" :alt="song.requestedBy?.name" class="requester-avatar">
                    <span>{{ song.requestedBy?.name }}</span>
                  </div>
                  <span class="text-gray-400">·</span>
                  <span class="text-xs text-gray-400">{{ formatTime(song.duration) }}</span>
                </div>
              </div>
              <div v-if="index !== 0" class="flex items-center space-x-2 ml-2">
                <button
                  class="like-button flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-all bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  @click.stop="sendSongLike(index, song.title)"
                >
                  <i class="fa-solid fa-heart" />
                </button>
              </div>
            </div>
          </div>
        </aside> <!-- 中间歌词区域 -->
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
                {{ processedOnlineUsers.length }}人在线
              </p>
            </div>

            <div class="flex items-center space-x-2 sm:space-x-2 flex-shrink-0">
              <!-- 切歌 -->
              <button
                :disabled="isSkipping"
                class="bg-orange-500/20 hover:bg-orange-500/30 active:bg-orange-500/40 text-orange-400 rounded-full py-2 px-3 sm:px-4 flex items-center text-xs sm:text-sm transition-all touch-target"
                :class="[{ 'opacity-50 cursor-not-allowed': isSkipping }]" @click="skipSong"
              >
                <i
                  :class="isSkipping ? 'fa-solid fa-spinner fa-spin mr-1 sm:mr-2' : 'fa-solid fa-forward mr-1 sm:mr-2'"
                />
                <span class="hidden sm:inline">{{ isSkipping ? '切歌中...' : '切歌' }}</span>
                <span class="sm:hidden">{{ isSkipping ? '切歌中' : '切歌' }}</span>
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
              </button> <!-- 帮助 -->
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
              <div v-if="showSkipMessage" class="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div
                  class="bg-orange-500/90 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm message-bubble"
                >
                  <i class="fa-solid fa-forward mr-2" />{{ skipMessage }}
                </div>
              </div>
            </transition>

            <div
              class="lyrics-content mx-auto text-center space-y-1 transition-all duration-500 px-2 sm:px-4 max-w-2xl"
            >
              <div
                v-for="(line, index) in roomState.currentLyrics" :key="index"
                class="lyric-line transition-all duration-300" :class="[{
                  'active text-white font-medium mb-3 mt-3': index === roomState.currentLyricIndex,
                  'text-gray-400 mb-1': index !== roomState.currentLyricIndex,
                  'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl': index === roomState.currentLyricIndex,
                  'text-sm sm:text-base md:text-lg': index !== roomState.currentLyricIndex,
                }]"
              >
                {{ line.text }}
              </div>

              <!-- 当没有歌词时的占位符 -->
              <div v-if="roomState.currentLyrics.length === 0" class="text-gray-400 py-8">
                <i class="fa-solid fa-music text-4xl mb-4 opacity-50" />
                <p class="text-sm">
                  暂无歌词
                </p>
              </div>
            </div>
          </div> <!-- 沉浸模式 - 全新设计 -->
          <div
            v-if="isImmersiveMode"
            class="flex-1 flex items-center justify-center p-8 relative overflow-hidden immersive-mode"
          >
            <!-- 背景模糊效果 -->
            <div class="absolute inset-0 bg-gradient-to-br from-dark/90 via-dark/80 to-dark/90 backdrop-blur-3xl" />

            <!-- 专辑封面背景 -->
            <div class="absolute inset-0 opacity-30">
              <img
                :src="roomState.currentSong?.cover" :alt="roomState.currentSong?.title"
                class="w-full h-full object-cover blur-3xl scale-110 transform"
              >
            </div>

            <!-- 主要内容区域 -->
            <div class="relative z-10 w-full max-w-6xl mx-auto">
              <div class="immersive-grid grid lg:grid-cols-2 gap-12 items-center">
                <!-- 左侧：专辑信息区域 -->
                <div class="flex flex-col items-center lg:items-start space-y-8">
                  <!-- 专辑封面 -->
                  <div class="relative group">
                    <div
                      class="w-80 h-80 lg:w-96 lg:h-96 rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-500"
                    >
                      <img
                        :src="roomState.currentSong?.cover" :alt="roomState.currentSong?.title"
                        class="w-full h-full"
                      >
                    </div>
                  </div>

                  <!-- 歌曲信息 -->
                  <div class="text-center lg:text-left space-y-4 w-80 lg:w-96">
                    <div>
                      <h1 class="immersive-title text-2xl lg:text-4xl font-bold text-white mb-2 leading-tight">
                        {{ roomState.currentSong?.title || '暂无歌曲' }}
                      </h1>
                      <p class="immersive-artist relative py-3 text-xl lg:text-2xl text-gray-300">
                        {{ roomState.currentSong?.artist }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- 右侧：歌词区域 -->
                <div class="flex flex-col h-96 lg:h-[600px]">
                  <div
                    ref="immersiveLyricsContainer"
                    class="flex-1 overflow-y-auto immersive-lyrics-container mx-auto text-center space-y-1 sm:px-4 max-w-2xl"
                  >
                    <div class="pr-4">
                      <div
                        v-for="(line, index) in roomState.currentLyrics" :key="index"
                        class="lyric-line transition-all duration-300" :class="[{
                          'active space-y-6 text-white font-medium mb-4 mt-4': index === roomState.currentLyricIndex,
                          'text-gray-400 space-y-1': index !== roomState.currentLyricIndex,
                          'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl': index === roomState.currentLyricIndex,
                          'text-sm sm:text-base md:text-lg': index !== roomState.currentLyricIndex,
                        }]"
                      >
                        {{ line.text }}
                      </div>

                      <!-- 当没有歌词时的占位符 -->
                      <div v-if="roomState.currentLyrics.length === 0" class="text-center text-gray-400 py-16">
                        <i class="fa-solid fa-music text-6xl mb-6 opacity-50" />
                        <p class="text-xl">
                          暂无歌词
                        </p>
                        <p class="text-sm mt-2 opacity-75">
                          享受纯音乐的美好
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 进度条 -->
              <div h-3 />
              <div class="space-y-3 py-3">
                <div class="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    class="immersive-progress h-full rounded-full transition-all duration-300"
                    :style="{ width: `${calculatedProgressPercentage}%` }"
                  />
                </div>
                <div class="flex justify-between text-sm text-gray-400">
                  <span>{{ formatTime(roomState?.currentTime || 0) }}</span>
                  <span>{{ formatTime((roomState.currentSong?.duration || 0) / 1000) }}</span>
                </div>
              </div>
            </div>
          </div><!-- 沉浸模式下的浮动操作面板 -->
          <transition name="fade">
            <div v-if="isImmersiveMode" class="fixed top-6 right-6 z-30 flex flex-col space-y-3">
              <!-- 退出沉浸模式 -->
              <button
                class="w-12 h-12 bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-all shadow-xl touch-target group"
                title="退出沉浸模式 (F键或ESC键)" @click="toggleImmersiveMode"
              >
                <i class="fa-solid fa-compress text-lg group-hover:scale-110 transition-transform" />
              </button>

              <!-- 帮助按钮 -->
              <button
                class="w-12 h-12 bg-black/40 backdrop-blur-md border border-white/20 text-green-400 rounded-full flex items-center justify-center hover:bg-green-500/20 transition-all shadow-xl touch-target group"
                title="帮助" @click="showHelp = true"
              >
                <i class="fa-solid fa-question-circle text-lg group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </transition><!-- 进度条 - 仅非沉浸模式 -->
          <div
            v-if="!isImmersiveMode"
            class="h-3 md:h-1 bg-white/10 rounded-full overflow-hidden relative hidden md:block"
          >
            <div
              class="h-full immersive-progress rounded-full transition-all duration-300"
              :style="{ width: `${calculatedProgressPercentage}%` }"
            />
          </div>

          <!-- 播放信息 - 仅非沉浸模式 -->
          <div v-if="!isImmersiveMode" class="glass-effect bg-dark/80 backdrop-blur-xl p-3 sm:p-4">
            <div class="flex items-center">
              <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden mr-3 sm:mr-4 flex-shrink-0">
                <img
                  :src="roomState.currentSong?.cover" :alt="roomState.currentSong?.title"
                  class="w-full h-full object-cover"
                >
              </div>
              <div class="flex-1 mr-2 sm:mr-4 min-w-0">
                <h3 class="font-medium text-sm sm:text-base truncate">
                  {{ roomState.currentSong?.title }}
                </h3>
                <p class="text-xs text-gray-400 truncate">
                  {{ roomState.currentSong?.artist }}{{
                    roomState.currentSong?.album
                      ? ` - ${roomState.currentSong?.album}` : '' }}
                </p>
              </div>
              <div class="flex flex-col items-center space-x-2 sm:space-x-3 flex-shrink-0">
                <div class="relative ml-auto">
                  <div class="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{{ formatTime(roomState?.currentTime || 0) }} /
                      {{ formatTime((roomState.currentSong?.duration || 0) / 1000) }}</span>
                  </div>
                </div>
                <!-- 音量 -->
                <div class="hidden md:flex">
                  <VolumeSlider
                    v-model:volume="volume" v-model:is-muted="isMuted" @volume-change="handleVolumeChange"
                    @mute-toggle="handleMuteToggle"
                  />
                </div>
              </div>
            </div>
          </div> <!-- 移动端底部导航 -->
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
            <div class="p-4 border-b border-white/10 flex justify-between items-center">
              <h2 class="text-lg font-semibold flex items-center">
                <i class="fa-solid fa-comments mr-2 text-primary" />聊天
              </h2>
            </div>
            <div ref="chatMessages" class="chat-messages flex-1 overflow-y-auto p-3 space-y-4 scrollbar-hide">
              <div v-for="message in processedChatMessages" :key="message.timestamp" class="flex items-start">
                <div class="w-8 h-8 rounded-full overflow-hidden mr-2">
                  <img :src="message.user.avatar" :alt="message.user.name" class="w-full h-full object-cover">
                </div>
                <div>
                  <div class="flex items-center">
                    <span class="font-medium text-sm">{{ message.user.name }}</span>
                    <span class="text-xs text-gray-400 ml-2">{{ formatTimeHH_MM(message.timestamp) }}</span>
                  </div>
                  <p class="text-sm mt-1">
                    {{ message.content }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-auto">
            <div class="p-3 border-t border-white/10">
              <div class="relative">
                <input
                  v-model="newMessage" type="text" placeholder="发送消息..."
                  class="w-full bg-white/10 rounded-full py-2 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  @keyup.enter="sendMessage"
                >
                <button
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  @click="sendMessage"
                >
                  <i class="fa-solid fa-paper-plane" />
                </button>
              </div>
            </div>
          </div>

          <!-- 在线用户列表 - 固定在底部 -->
          <div class="mt-auto">
            <div class="flex flex-col">
              <div class="p-3 border-b border-white/10">
                <h2 class="text-lg font-semibold flex items-center justify-between">
                  <div class="flex items-center">
                    <i class="fa-solid fa-users mr-2 text-primary" />在线用户 <span
                      class="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full"
                    >{{
                      processedOnlineUsers.length }}</span>
                  </div>
                  <button
                    :disabled="isRefreshingUsers"
                    class="text-gray-400 hover:text-white transition-all duration-200 p-1 rounded"
                    :class="[{ 'opacity-50 cursor-not-allowed': isRefreshingUsers }]" title="刷新用户列表"
                    @click="refreshOnlineUsers"
                  >
                    <i
                      :class="isRefreshingUsers ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-refresh'"
                      class="text-sm"
                    />
                  </button>
                </h2>
              </div>
              <div class="users-list overflow-y-auto p-2 scrollbar-hide space-y-2 max-h-48">
                <div
                  v-for="user in processedOnlineUsers" :key="user.name"
                  class="flex items-center p-2 hover:bg-white/5 rounded-lg"
                >
                  <div class="w-8 h-8 rounded-full overflow-hidden relative mr-3">
                    <img :src="user.avatar" :alt="user.name" class="w-full h-full object-cover">
                    <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark" />
                  </div>
                  <span class="text-sm">{{ user.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main> <!-- 点歌台模态框 -->
      <MusicSearchModal
        :show="showMusicSearchModal" :search-results="roomState.searchResults"
        :music-sources="musicSources" @close="showMusicSearchModal = false"
      />

      <!-- 帮助弹窗 -->
      <HelpModal :show="showHelp" @close="showHelp = false" />

      <!-- 移动端播放列表模态框 -->
      <transition name="modal">
        <div v-if="showMobilePlaylist" class="fixed inset-0 z-50 flex w-full items-end md:items-center justify-center">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showMobilePlaylist = false" />
          <div
            class="relative bg-dark border-t border-white/20 md:rounded-xl w-full max-w-4xl h-[85vh] md:max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div class="p-4 border-b border-white/10 flex justify-between items-center">
              <h2 class="text-lg font-semibold flex items-center">
                <i class="fa-solid fa-list-ul mr-2 text-primary" />播放列表
              </h2>
              <button
                class="text-gray-400 hover:text-white transition-colors touch-target"
                @click="showMobilePlaylist = false"
              >
                <i class="fa-solid fa-times text-lg" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto smooth-scroll modal-scroll">
              <div class="p-3 text-xs text-gray-400 border-b border-white/5">
                共 {{ processedPlaylist.length }} 首歌曲
              </div>
              <div class="space-y-1">
                <div
                  v-for="(song, index) in processedPlaylist"
                  class="p-4 flex items-center active:bg-white/10 transition-all cursor-pointer border-b border-white/5 touch-feedback"
                  :class="[{ 'bg-primary/20 border-l-4 border-primary': 0 === index }]"
                >
                  <div class="w-12 h-12 rounded overflow-hidden mr-3 flex-shrink-0">
                    <img :src="song.cover" :alt="song.title" class="w-full h-full object-cover">
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-medium truncate mb-1">
                      {{ song.title }}
                    </h3>
                    <p class="text-xs text-gray-400 truncate">
                      {{ song.artist }}
                    </p>
                  </div>
                  <div class="text-gray-400 text-xs ml-2">
                    {{ formatTime(song.duration) }}
                  </div>
                  <div v-if="index !== 0" class="flex items-center space-x-2 ml-2">
                    <button
                      class="like-button flex items-center justify-center w-8 h-8 rounded-full text-xs transition-all bg-red-500/20 text-red-400 hover:bg-red-500/30 active:bg-red-500/40 touch-target"
                      @click.stop="sendSongLike(index, song.title)"
                    >
                      <i class="fa-solid fa-heart" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition> <!-- 移动端聊天模态框 -->
      <transition name="modal">
        <div v-if="showMobileChat" class="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showMobileChat = false" />
          <div
            class="relative bg-dark border-t border-white/20 md:rounded-xl w-full max-w-4xl h-[85vh] md:max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div class="p-4 border-b border-white/10 flex justify-between items-center">
              <h2 class="text-lg font-semibold flex items-center">
                <i class="fa-solid fa-comments mr-2 text-primary" />聊天
              </h2>
              <button
                class="text-gray-400 hover:text-white transition-colors touch-target"
                @click="showMobileChat = false"
              >
                <i class="fa-solid fa-times text-lg" />
              </button>
            </div>
            <div ref="mobileChatMessages" class="flex-1 overflow-y-auto p-3 space-y-3 smooth-scroll modal-scroll">
              <div v-for="message in processedChatMessages" :key="message.timestamp" class="flex items-start space-x-3">
                <div class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img :src="message.user.avatar" :alt="message.user.name" class="w-full h-full object-cover">
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2 mb-1">
                    <span class="font-medium text-sm truncate">{{ message.user.name }}</span>
                    <span class="text-xs text-gray-400 flex-shrink-0">{{ formatTimeHH_MM(message.timestamp)
                    }}</span>
                  </div>
                  <p class="text-sm break-words leading-relaxed">
                    {{ message.content }}
                  </p>
                </div>
              </div>
            </div>
            <div class="p-3 border-t border-white/10">
              <div class="relative">
                <input
                  v-model="newMessage" type="text" placeholder="发送消息..."
                  class="w-full bg-white/10 rounded-full py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400"
                  maxlength="200" @keyup.enter="sendMessage"
                >
                <button
                  :disabled="!newMessage.trim()"
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all touch-target"
                  :class="[newMessage.trim() ? 'text-primary hover:bg-primary/20 active:bg-primary/30' : 'text-gray-500']"
                  @click="sendMessage"
                >
                  <i class="fa-solid fa-paper-plane" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- 移动端用户列表模态框 -->
      <transition name="modal">
        <div v-if="showMobileUsers" class="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="showMobileUsers = false" />
          <div
            class="relative bg-dark border-t border-white/20 md:rounded-xl w-full max-w-4xl h-[85vh] md:max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div class="md:hidden flex justify-center py-2">
              <div class="w-8 h-1 bg-gray-500 rounded-full" />
            </div>
            <div class="p-4 border-b border-white/10 flex justify-between items-center">
              <h2 class="text-lg font-semibold flex items-center">
                <i class="fa-solid fa-users mr-2 text-primary" />在线用户 <span
                  class="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full"
                >{{
                  processedOnlineUsers.length }}</span>
              </h2>
              <div class="flex items-center space-x-2">
                <button
                  :disabled="isRefreshingUsers"
                  class="text-gray-400 hover:text-white transition-all duration-200 p-2 rounded-full touch-target"
                  :class="[{ 'opacity-50 cursor-not-allowed': isRefreshingUsers }]" title="刷新用户列表"
                  @click="refreshOnlineUsers"
                >
                  <i
                    :class="isRefreshingUsers ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-refresh'"
                    class="text-base"
                  />
                </button>
                <button
                  class="text-gray-400 hover:text-white transition-colors touch-target"
                  @click="showMobileUsers = false"
                >
                  <i class="fa-solid fa-times text-lg" />
                </button>
              </div>
            </div>
            <div class="flex-1 overflow-y-auto p-3 smooth-scroll modal-scroll">
              <div class="space-y-2">
                <div
                  v-for="user in processedOnlineUsers" :key="user.name"
                  class="flex items-center p-3 hover:bg-white/5 rounded-lg active:bg-white/10 transition-all cursor-pointer touch-feedback"
                >
                  <div class="w-10 h-10 rounded-full overflow-hidden relative mr-3 flex-shrink-0">
                    <img :src="user.avatar" :alt="user.name" class="w-full h-full object-cover">
                    <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <span class="text-sm font-medium truncate block">{{ user.name }}</span>
                    <span class="text-xs text-gray-400">在线</span>
                  </div>
                  <div class="flex items-center space-x-2 flex-shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- 通知容器 -->
      <NotificationContainer /> <!-- WebSocket 连接配置显示（开发环境） -->
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

      <!-- 移动端侧边菜单遮罩 -->
      <transition name="fade">
        <div
          v-if="showMobileMenu" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          @click="toggleMobileMenu"
        />
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MusicSource, RoomInfo } from '@/types'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import HelpModal from '@/components/HelpModal.vue'
import MusicSearchModal from '@/components/MusicSearchModal.vue'
import NotificationContainer from '@/components/NotificationContainer.vue'
import VolumeSlider from '@/components/VolumeSlider.vue'
import { useChat } from '@/composables/useChat'
import { useLyrics } from '@/composables/useLyrics'
import { useMediaSession } from '@/composables/useMediaSession'
import { useNotification } from '@/composables/useNotification'
import { usePlayer } from '@/composables/usePlayer'
import { useRoomState } from '@/composables/useRoomState'
import { useWebSocket } from '@/composables/useWebSocket'
import { getAppConfig, logConfig, validateConfig } from '@/utils/config'
import { formatTime, formatTimeHH_MM } from '@/utils/time'
import { processUser, processUsers } from '@/utils/user'

// 应用配置
const appConfig = getAppConfig()
const configErrors = validateConfig(appConfig)

// 如果配置有错误，在开发环境输出警告
if (configErrors.length > 0) {
  console.warn('⚠️ 配置错误:', configErrors)
}

// 初始化WebSocket连接
const websocket = useWebSocket()
const {
  connectionStatus,
  connect,
  disconnect,
  reconnectAttempts,
  on: onWebSocketEvent,
  send,
  sendSongLike,
} = websocket

// UI状态
const showMobileMenu = ref(false)
const showMusicSearchModal = ref(false)
const showHelp = ref(false)
const showMobileChat = ref(false)
const showMobileUsers = ref(false)
const showMobilePlaylist = ref(false)
const showJoinRoomConfirm = ref(true) // 初始显示确认窗口
const isImmersiveMode = ref(false) // 沉浸模式状态
const searchQuery = ref('')
const mobileChatMessages = ref<HTMLElement>()
const isRefreshingUsers = ref(false)
const isDevelopment = import.meta.env.DEV

// 音频播放器引用
const audioPlayer = ref<HTMLAudioElement>()

// 歌词容器引用
const lyricsContainer = ref<HTMLElement>()
const immersiveLyricsContainer = ref<HTMLElement>()

// 房间信息
const roomInfo = ref<RoomInfo>({
  name: '听歌房',
  creator: '音乐达人',
  id: 'room_001',
})

// 音乐来源
const musicSources = ref<MusicSource[]>([
  {
    id: 'wy',
    name: '网易云音乐',
    icon: 'fa-solid fa-music',
    color: '#d33a31',
    description: '歌曲 · 歌单',
  },
  {
    id: 'qq',
    name: 'QQ音乐',
    icon: 'fa-brands fa-qq',
    color: '#31c27c',
    description: '歌曲 · 歌单 · 用户',
  },
  {
    id: 'db',
    name: 'bilibili',
    icon: 'fa-solid fa-tv',
    color: '#00a2d8',
    description: '仅歌曲搜索',
  },
])

// 使用组合式函数
const {
  roomState,
  setCurrentTime,
} = useRoomState()

const {
  volume,
  isMuted,
  skipMessage,
  showSkipMessage,
  isSkipping,
  showSkipSong,
} = usePlayer()

const { chatMessages, newMessage, sendMessage } = useChat(websocket)
const {
  syncLyrics,
} = useLyrics()
const {
  showError,
  showInfo,
  showSuccess,
  showConnectionSuccess,
  showConnectionError,
  showConnectionWarning,
} = useNotification()

// 媒体会话控制
const {
  updateMetadata,
  updatePlaybackState,
  updatePositionState,
  setupActionHandlers,
  isSupported: isMediaSessionSupported,
} = useMediaSession()

// 处理后的用户数据计算属性
const processedOnlineUsers = computed(() => processUsers(roomState.onlineUsers))
const processedChatMessages = computed(() =>
  chatMessages.value.map(message => ({
    ...message,
    user: processUser(message.user),
  })),
)
const processedPlaylist = computed(() =>
  roomState.playlist.map(song => ({
    ...song,
    requestedBy: song.requestedBy ? processUser(song.requestedBy) : undefined,
  })),
)

// 歌词自动滚动功能
function scrollLyricsToCenter(container: HTMLElement | undefined, index: number, smooth: boolean = true) {
  if (!container)
    return

  const lyricLines = container.querySelectorAll('.lyric-line')
  if (lyricLines[index]) {
    const targetLine = lyricLines[index] as HTMLElement
    const containerHeight = container.clientHeight
    const targetTop = targetLine.offsetTop
    const targetHeight = targetLine.clientHeight

    // 计算目标滚动位置（让当前歌词居中）
    const targetScrollTop = targetTop - (containerHeight / 2) + (targetHeight / 2)

    // 根据参数决定是否平滑滚动
    container.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: smooth ? 'smooth' : 'instant',
    })
  }
}

// 基于pushTime计算的进度百分比
const calculatedProgressPercentage = ref(0)

// 方法
function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
}

// 切换沉浸模式
function toggleImmersiveMode() {
  isImmersiveMode.value = !isImmersiveMode.value

  // 切换模式后立即同步歌词位置（使用瞬间跳转，不使用平滑滚动）
  nextTick(() => {
    const currentIndex = roomState.currentLyricIndex
    if (currentIndex >= 0 && roomState.currentLyrics.length > 0) {
      if (isImmersiveMode.value) {
        scrollLyricsToCenter(immersiveLyricsContainer.value, currentIndex, false)
      }
      else {
        scrollLyricsToCenter(lyricsContainer.value, currentIndex, false)
      }
    }
  })
}

// 确认加入房间相关方法
function confirmJoinRoom() {
  showJoinRoomConfirm.value = false
  // 确认后进行WebSocket连接和初始化
  initializeApp()
}

function cancelJoinRoom() {
  // 取消加入房间，可以跳转到其他页面或显示房间列表
  alert('您已取消加入房间')
  // 这里可以添加跳转逻辑，比如：
  // window.location.href = '/rooms'
}

function initializeApp() {
  // 设置WebSocket事件监听
  setupWebSocketEvents()

  // 延迟连接WebSocket，确保页面加载完成
  setTimeout(() => {
    const roomId = roomInfo.value.id
    connect(roomId)
  }, 1000)

  // 确保音频播放器初始化后自动播放第一首歌
  setTimeout(() => {
    if (roomState.currentSong && audioPlayer.value) {
      playAudio()
    }
  }, 1500)
}

// 刷新在线用户列表
function refreshOnlineUsers() {
  send({
    action: '/house/houseuser',
    data: {},
  })
}

// 获取连接状态文本
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

// 监听计算出的当前时间变化，同步音频播放器
watch(() => roomState.pushTime, (pushTime) => {
  if (!pushTime || pushTime === 0)
    return // 如果pushTime为0，则不进行同步
  const delta = Date.now() - pushTime
  const newTime = delta / 1000 // 转换为秒
  if (audioPlayer.value) {
    setAudioCurrentTime(newTime)
    audioPlayer.value.play()
  }
}, { immediate: true })

// 监听当前歌曲变化，更新音频源并自动播放
watch(() => roomState.currentSong, (newSong) => {
  if (newSong && audioPlayer.value) {
    // 如果有新歌曲且有音频URL，则加载新音频
    if (newSong.url) {
      audioPlayer.value.load()
      // 自动播放
      setTimeout(() => {
        playAudio()
      }, 100) // 稍微延迟确保音频加载完成
    }
  }

  // 更新媒体会话元数据
  updateMetadata(newSong)
  if (newSong) {
    updatePlaybackState('playing')
  }
  else {
    updatePlaybackState('none')
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

// 监听当前歌词索引变化，实现自动滚动
watch(() => roomState.currentLyricIndex, (newIndex) => {
  if (newIndex >= 0 && roomState.currentLyrics.length > 0) {
    // 延迟执行滚动，确保DOM更新完成
    nextTick(() => {
      if (isImmersiveMode.value) {
        scrollLyricsToCenter(immersiveLyricsContainer.value, newIndex)
      }
      else {
        scrollLyricsToCenter(lyricsContainer.value, newIndex)
      }
    })
  }
})

// WebSocket 事件监听
function setupWebSocketEvents() {
  // 监听连接状态变化
  onWebSocketEvent('connected', () => {
    console.log('✅ WebSocket 连接成功')
    logConfig(appConfig)
  })

  onWebSocketEvent('disconnected', (data: any) => {
    console.log('❌ WebSocket 连接断开:', data.reason)
  })

  onWebSocketEvent('error', (data: any) => {
    console.error('🔥 WebSocket 错误:', data.message)
  })
}

// 连接状态监听
watch(connectionStatus, (status) => {
  console.log('连接状态变化:', status)

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

function skipSong() {
  send({
    action: '/music/skip/vote',
    data: {},
  })
  showSkipSong()
}

// 分享房间
function shareRoom() {
  const shareData = {
    title: `加入我的音乐房间 - ${roomInfo.value.name}`,
    text: `来和我一起听歌吧！房主：${roomInfo.value.creator}`,
    url: window.location.href,
  }

  // 检查是否支持 Web Share API
  if (navigator.share) {
    navigator.share(shareData).catch((error) => {
      console.log('分享失败:', error)
      // 降级到复制链接
      fallbackShare()
    })
  }
  else {
    // 降级到复制链接
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
  }
  else {
    // 兼容性处理：显示链接供用户手动复制
    prompt('请复制房间链接:', url)
  }
}

// 音频播放器事件处理方法
function onAudioTimeUpdate(event: Event) {
  const audio = event.target as HTMLAudioElement
  if (audio) {
    // 添加有效性检查
    if (Number.isNaN(audio.duration) || audio.duration <= 0)
      return
    // 根据audio的currentTime更新pushTime，使其与服务器保持同步
    const currentTimeFromAudio = audio.currentTime
    setCurrentTime(currentTimeFromAudio)
    syncLyrics(currentTimeFromAudio)

    if (roomState.currentSong?.duration) {
      const audioCurrentTime = audioPlayer.value?.currentTime ?? 0
      const percentage = (audioCurrentTime / (roomState.currentSong.duration / 1000)) * 100
      calculatedProgressPercentage.value = Math.min(Math.max(percentage, 0), 100)
    }
    // 更新媒体会话位置状态
    updatePositionState(audio.duration, audio.currentTime, audio.playbackRate)
  }
}

function onAudioError(event: Event) {
  const audio = event.target as HTMLAudioElement
  console.error('音频播放错误:', audio.error)
}

// 音频控制方法
function playAudio() {
  if (audioPlayer.value) {
    audioPlayer.value.volume = volume.value / 100
    audioPlayer.value.play().then(() => {
      updatePlaybackState('playing')
    }).catch(() => {
      updatePlaybackState('paused')
    })
  }
}

function setAudioCurrentTime(time: number) {
  if (audioPlayer.value) {
    audioPlayer.value.currentTime = time
  }
}

// 音量控制事件处理
function handleVolumeChange(newVolume: number) {
  // 音量变化时，同步到音频元素（在 watch 中处理）
  volume.value = newVolume
}

function handleMuteToggle(muted: boolean) {
  // 静音状态变化时，同步到音频元素（在 watch 中处理）
  isMuted.value = muted
}

// 生命周期
onMounted(() => {
  // 页面挂载时不立即初始化，等待用户确认
  console.log('页面已加载，等待用户确认加入房间')

  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeyDown)

  // 初始化媒体会话
  initializeMediaSession()
})

// 初始化媒体会话
function initializeMediaSession() {
  if (!isMediaSessionSupported()) {
    console.log('当前浏览器不支持 Media Session API')
    return
  }
  console.log('🎵 初始化媒体会话 - 仅启用切歌功能，禁用播放控制以保持同步播放')

  // 设置媒体会话操作处理器 - 只保留切歌功能，禁用其他控制
  setupActionHandlers({
    // 似乎没法禁用，所以还是实现一下基本功能
    onPlay: () => {
      playAudio()
    },
    onPause: () => {
      if (audioPlayer.value) {
        audioPlayer.value.pause()
        updatePlaybackState('paused')
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
      // 触发切歌功能
      showSkipSong()
      // 发送切歌请求到服务器
      skipSong()
    },
  })
}

// 键盘事件处理
function handleKeyDown(event: KeyboardEvent) {
  // 按 F 键切换沉浸模式（仅在没有聚焦输入框时）
  if (event.key === 'f' || event.key === 'F') {
    const activeElement = document.activeElement
    if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
      event.preventDefault()
      toggleImmersiveMode()
    }
  }

  // 按 Escape 键退出沉浸模式
  if (event.key === 'Escape' && isImmersiveMode.value) {
    event.preventDefault()
    isImmersiveMode.value = false
  }
}

// 页面卸载时断开连接
onUnmounted(() => {
  disconnect()
  // 移除键盘事件监听
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
/* 歌词样式 */
.lyric-line {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

/* 沉浸模式下的歌词特殊效果 */
.lyric-line.active {
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
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

/* 沉浸模式歌词容器样式 */
.immersive-lyrics-container {
  scroll-behavior: smooth;
  /* 隐藏滚动条 */
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE and Edge */
}

.immersive-lyrics-container::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari, Opera */
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

/* 沉浸模式下的播放信息样式 */
.immersive-player-info {
  backdrop-filter: blur(20px);
  background: rgba(0, 0, 0, 0.7);
}
</style>
