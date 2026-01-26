<template>
  <div class="root-container overflow-x-hidden">
    <div class="h-screen flex flex-col items-center relative bg-gradient-to-br from-gray-900 to-black overflow-hidden font-sans text-white">
      <!-- Background Abstract Shapes -->
      <div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div class="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

      <!-- Dynamic Song Background -->
      <div v-if="currentSong?.cover && !isImmersiveMode" class="absolute inset-0 z-0">
        <img
          :key="currentSong.id"
          :src="currentSong.cover"
          :alt="currentSong.title"
          class="w-full h-full object-cover blur-3xl scale-110 opacity-30 transition-all duration-1000"
        >
        <div class="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/90" />
      </div>

      <!-- Main Layout Container -->
      <div class="z-10 w-full md:max-w-[95%] h-full flex flex-col gap-6 pt-4 pb-[80px] px-0 md:p-6 md:mt-0 md:pb-6 md:h-full overflow-hidden">
        <!-- Desktop Layout -->
        <div class="hidden md:flex md:flex-row gap-6 h-full">
          <!-- Left Panel: Player & Lyrics (Desktop) -->
          <div class="flex-1 flex flex-col min-h-0 relative">
            <!-- Lyrics Main View -->
            <div class="glass flex-1 rounded-3xl p-4 md:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group mb-4">
              <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 z-0 pointer-events-none" />

              <!-- Floating Mic Icon -->
              <div class="absolute top-6 right-6 text-white/20">
                <Mic2 :size="24" />
              </div>

              <!-- Lyrics Content -->
              <div ref="lyricsContainerDesktop" class="z-10 w-full max-w-2xl md:max-w-4xl overflow-y-auto max-h-full py-8 px-4 lyrics-scroll flex flex-col items-center">
                <template v-if="currentLyrics.length > 0">
                  <p
                    v-for="(line, index) in currentLyrics"
                    :key="index"
                    class="lyric-line text-center transition-all duration-500 ease-out cursor-default"
                    :class="[
                      index === currentLyricIndex
                        ? 'active-lyric text-white text-2xl md:text-4xl font-bold tracking-wide scale-105'
                        : index === currentLyricIndex - 1 || index === currentLyricIndex + 1
                          ? 'near-lyric text-white/50 text-xl md:text-2xl font-medium scale-100'
                          : 'far-lyric text-white/25 text-lg md:text-xl font-normal scale-95 blur-[0.5px]',
                    ]"
                  >
                    {{ line.text || ' ' }}
                  </p>
                </template>
                <template v-else>
                  <p class="text-white/40 text-xl">
                    暂无歌词
                  </p>
                </template>
              </div>
            </div>

            <!-- Player Controls -->
            <div class="glass rounded-3xl p-4 flex items-center gap-4 shrink-0">
              <!-- Album Art Small -->
              <div class="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                <img v-if="currentSong?.cover" :src="currentSong.cover" :alt="currentSong.title" class="w-full h-full object-cover">
                <span v-else class="text-2xl">🎵</span>
              </div>

              <!-- Info & Progress -->
              <div class="flex-1 min-w-0 flex flex-col justify-center gap-2">
                <div class="flex justify-between items-end">
                  <div class="min-w-0">
                    <h2 class="text-base md:text-lg font-bold text-white truncate">
                      {{ currentSong?.title || '暂无歌曲' }}
                    </h2>
                    <p class="text-xs md:text-sm text-white/60 truncate">
                      {{ currentSong?.artist || '未知艺术家' }}
                    </p>
                  </div>
                  <div class="text-[10px] md:text-xs text-white/40 font-mono mb-0.5">
                    {{ formatTime(playerState.currentTime || 0) }} / {{ formatTime((currentSong?.duration || 0) / 1000) }}
                  </div>
                </div>
                <!-- Small Progress Bar -->
                <div class="h-1.5 bg-white/10 rounded-full overflow-hidden relative cursor-pointer group/progress">
                  <div
                    class="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                    :style="{ width: `${progress}%` }"
                  />
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-2 pl-2 border-l border-white/10 ml-2">
                <!-- Skip Button -->
                <button
                  :disabled="isSkipping"
                  class="p-2 hover:bg-white/10 rounded-full transition-colors"
                  :class="isSkipping ? 'opacity-50 cursor-not-allowed' : ''"
                  title="切歌"
                  @click="handleSkipSong"
                >
                  <SkipForward :size="18" class="text-white/70" />
                </button>

                <!-- Volume Button -->
                <div class="relative">
                  <button class="p-2 hover:bg-white/10 rounded-full transition-colors" :class="showVolumePopup ? 'bg-white/10' : ''" @click="toggleVolumePopup">
                    <Volume2 :size="18" class="text-white/70" />
                  </button>
                  <!-- Volume Popup -->
                  <Transition name="volume-popup">
                    <div v-if="showVolumePopup" class="absolute bottom-full right-0 mb-2 bg-[#121214]/95 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl border border-white/10 z-50">
                      <VolumeSlider />
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Panel: Tabbed Interface (Desktop) -->
          <div class="w-full md:w-[560px] flex flex-col gap-4 md:gap-6 min-h-0 md:h-auto overflow-hidden relative">
            <!-- Tab Navigation -->
            <div class="glass rounded-2xl p-1.5 flex gap-1 shrink-0">
              <button
                class="flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all"
                :class="desktopRightTab === 'playlist' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'"
                @click="desktopRightTab = 'playlist'"
              >
                <div class="flex items-center justify-center gap-2">
                  <ListMusic :size="16" />
                  <span>播放列表</span>
                </div>
              </button>
              <button
                class="flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all"
                :class="desktopRightTab === 'chat' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'"
                @click="desktopRightTab = 'chat'"
              >
                <div class="flex items-center justify-center gap-2">
                  <MessageSquare :size="16" />
                  <span>聊天</span>
                </div>
              </button>
            </div>

            <!-- Tab Content Container with Slide Animation -->
            <div
              class="flex-1 flex transition-transform duration-300 ease-out overflow-hidden"
              :style="{ transform: desktopRightTab === 'playlist' ? 'translateX(0)' : 'translateX(-50%)' }"
              style="width: 200%;"
            >
              <!-- Playlist Tab -->
              <div class="w-1/2 shrink-0 px-2">
                <div class="glass rounded-3xl h-full flex flex-col overflow-hidden min-h-[200px]">
                  <div class="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
                    <h3 class="font-bold flex items-center gap-2 text-sm">
                      <ListMusic :size="18" class="text-indigo-400" />
                      待播列表
                    </h3>
                    <span class="text-xs bg-white/10 px-2 py-0.5 rounded-full">{{ playlist.length }} 首</span>
                  </div>
                  <div class="flex-1 overflow-y-auto space-y-1">
                    <PlaylistItem
                      v-for="(song, index) in playlist"
                      :key="song.id"
                      :song="song"
                      :index="index"
                      :is-current="index === 0"
                      :is-desktop="true"
                      @like="emit('songLike', index, song.title)"
                      @delete="emit('songDelete', song.title)"
                    />
                  </div>
                  <div class="p-3 border-t border-white/5 shrink-0">
                    <button class="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-medium transition-colors shadow-lg shadow-purple-600/20 active:scale-95 transform" @click="emit('showMusicSearch')">
                      点歌
                    </button>
                  </div>
                </div>
              </div>

              <!-- Chat Tab -->
              <div class="w-1/2 shrink-0 px-2 flex flex-col gap-3 relative">
                <!-- Room Info Card -->
                <div class="glass rounded-2xl p-3 shrink-0">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-sm shadow-lg shadow-purple-500/20">
                      {{ roomInfo.name?.slice(0, 1) || 'R' }}
                    </div>
                    <div>
                      <h3 class="font-bold text-sm leading-none">
                        {{ roomInfo.name || '音乐房间' }}
                      </h3>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex items-center gap-1 flex-wrap">
                    <button class="flex-1 py-2 px-3 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-1.5" @click="openOnlineUsers">
                      <span class="flex h-2 w-2 shrink-0 relative">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                      </span>
                      <span class="text-xs text-white/70 whitespace-nowrap">{{ onlineUsers.length }} 在线</span>
                    </button>
                    <button class="flex-1 py-2 px-3 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-1.5" @click="emit('showPlayHistory')">
                      <History :size="16" class="text-white/70" />
                      <span class="text-xs text-white/70">历史</span>
                    </button>
                    <button class="flex-1 py-2 px-3 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-1.5" @click="emit('shareRoom')">
                      <Share2 :size="16" class="text-white/70" />
                      <span class="text-xs text-white/70">分享</span>
                    </button>
                    <button class="flex-1 py-2 px-3 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-1.5" @click="emit('showSettings')">
                      <Settings :size="16" class="text-white/70" />
                      <span class="text-xs text-white/70">设置</span>
                    </button>
                    <button class="flex-1 py-2 px-3 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-1.5" @click="emit('showHelp')">
                      <CircleHelp :size="16" class="text-white/70" />
                      <span class="text-xs text-white/70">帮助</span>
                    </button>
                  </div>
                </div>

                <!-- Online Users Popup -->
                <Transition name="volume-popup">
                  <div v-if="showOnlineUsers" class="absolute top-0 left-2 right-2 mt-[120px] bg-[#121214]/95 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl border border-white/10 z-[100] max-h-[300px] overflow-hidden flex flex-col">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-2">
                        <Users :size="16" class="text-white/60" />
                        <span class="text-xs font-medium text-white/80">在线用户</span>
                      </div>
                      <button class="p-1 hover:bg-white/10 rounded-full transition-colors" @click="closeOnlineUsers">
                        <X :size="16" class="text-white/60" />
                      </button>
                    </div>
                    <div class="space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                      <div v-for="user in onlineUsers" :key="user.name" class="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] hover:bg-white/5 border border-white/5 transition-all">
                        <div class="relative">
                          <Avatar :name="user.name" :avatar="user.avatar" class="w-8 h-8 rounded-lg" />
                          <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="text-xs font-bold truncate">
                            {{ user.name }}
                          </div>
                          <div class="text-[10px] text-white/40 truncate">
                            在线
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>

                <!-- Chat Messages Card -->
                <div class="glass rounded-3xl flex-1 flex flex-col overflow-hidden min-h-[200px]">
                  <div class="p-3 border-b border-white/5 shrink-0">
                    <div class="flex items-center gap-2 text-xs font-bold text-white/60 uppercase tracking-wider">
                      <MessageSquare :size="14" />
                      聊天
                    </div>
                  </div>
                  <div class="flex-1 overflow-y-auto space-y-3 relative px-3 pt-3">
                    <div v-for="msg in chatMessages" :key="msg.timestamp" class="flex gap-2 items-start">
                      <Avatar :name="msg.user.name" :avatar="msg.user.avatar" class="w-8 h-8 rounded-full shrink-0 mt-0.5" />
                      <div class="flex-1 min-w-0">
                        <div class="flex items-baseline gap-2 mb-0.5">
                          <span class="font-bold text-sm text-purple-400">{{ msg.user.name }}</span>
                          <span class="text-[10px] text-white/30">{{ formatTimeHH_MM(msg.timestamp) }}</span>
                        </div>
                        <div class="text-sm text-white/80 leading-relaxed break-words">
                          {{ msg.content }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="p-3 bg-black/20 shrink-0">
                    <input
                      v-model="newMessage"
                      type="text"
                      placeholder="发送消息..."
                      class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:bg-white/10 transition-colors"
                      @keyup.enter="handleSendMessage"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Swipe Container (Player / Playlist / Chat) -->
        <div
          class="mobile-panels mobile-panels-safe flex w-[300vw] flex-1 min-h-0 transition-transform duration-300 ease-out md:hidden"
          :class="activeTab === 'lyrics' ? 'translate-x-0' : activeTab === 'playlist' ? '-translate-x-[100vw]' : '-translate-x-[200vw]'"
        >
          <!-- Mobile Panel: Player & Lyrics -->
          <div class="w-screen shrink-0 flex flex-col min-h-0 h-full relative px-4 pb-4">
            <!-- Lyrics Main View -->
            <div class="glass flex-1 rounded-3xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden group mb-4">
              <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 z-0 pointer-events-none" />

              <!-- Floating Mic Icon -->
              <div class="absolute top-6 right-6 text-white/20">
                <Mic2 :size="24" />
              </div>

              <!-- Lyrics Content -->
              <div ref="lyricsContainerMobile" class="z-10 w-full max-w-2xl overflow-y-auto max-h-full py-8 px-4 lyrics-scroll flex flex-col items-center">
                <template v-if="currentLyrics.length > 0">
                  <p
                    v-for="(line, index) in currentLyrics"
                    :key="index"
                    class="lyric-line text-center transition-all duration-500 ease-out cursor-default"
                    :class="[
                      index === currentLyricIndex
                        ? 'active-lyric text-white text-2xl font-bold tracking-wide scale-105'
                        : index === currentLyricIndex - 1 || index === currentLyricIndex + 1
                          ? 'near-lyric text-white/50 text-xl font-medium scale-100'
                          : 'far-lyric text-white/25 text-lg font-normal scale-95 blur-[0.5px]',
                    ]"
                  >
                    {{ line.text || ' ' }}
                  </p>
                </template>
                <template v-else>
                  <p class="text-white/40 text-xl">
                    暂无歌词
                  </p>
                </template>
              </div>
            </div>

            <!-- Player Controls -->
            <div class="glass rounded-3xl p-4 flex items-center gap-4 shrink-0">
              <!-- Album Art Small -->
              <div class="w-14 h-14 rounded-xl bg-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                <img v-if="currentSong?.cover" :src="currentSong.cover" :alt="currentSong.title" class="w-full h-full object-cover">
                <span v-else class="text-2xl">🎵</span>
              </div>

              <!-- Info & Progress -->
              <div class="flex-1 min-w-0 flex flex-col justify-center gap-2">
                <div class="flex justify-between items-end">
                  <div class="min-w-0">
                    <h2 class="text-base font-bold text-white truncate">
                      {{ currentSong?.title || '暂无歌曲' }}
                    </h2>
                    <p class="text-xs text-white/60 truncate">
                      {{ currentSong?.artist || '未知艺术家' }}
                    </p>
                  </div>
                  <div class="text-[10px] text-white/40 font-mono mb-0.5">
                    {{ formatTime(playerState.currentTime || 0) }} / {{ formatTime((currentSong?.duration || 0) / 1000) }}
                  </div>
                </div>
                <!-- Small Progress Bar -->
                <div class="h-1.5 bg-white/10 rounded-full overflow-hidden relative cursor-pointer group/progress">
                  <div
                    class="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    :style="{ width: `${progress}%` }"
                  />
                </div>
              </div>

              <!-- Skip Button -->
              <div class="pl-2 border-l border-white/10 ml-2">
                <button
                  :disabled="isSkipping"
                  class="p-2 hover:bg-white/10 rounded-full transition-colors"
                  :class="isSkipping ? 'opacity-50 cursor-not-allowed' : ''"
                  title="切歌"
                  @click="handleSkipSong"
                >
                  <SkipForward :size="18" class="text-white/70" />
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile Panel: Playlist -->
          <div class="w-screen shrink-0 flex flex-col gap-4 min-h-0 h-full px-4 pb-4">
            <!-- Playlist -->
            <div class="glass rounded-3xl flex-1 flex flex-col overflow-hidden min-h-[200px]">
              <div class="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
                <h3 class="font-bold flex items-center gap-2 text-sm">
                  <ListMusic :size="18" class="text-indigo-400" />
                  待播列表
                </h3>
                <span class="text-xs bg-white/10 px-2 py-0.5 rounded-full">{{ playlist.length }} 首</span>
              </div>
              <div class="flex-1 overflow-y-auto p-2 space-y-1">
                <PlaylistItem
                  v-for="(song, index) in playlist"
                  :key="song.id"
                  :song="song"
                  :index="index"
                  :is-current="index === 0"
                  :is-mobile="true"
                  @like="emit('songLike', index, song.title)"
                  @delete="emit('songDelete', song.title)"
                />
              </div>
              <div class="p-3 border-t border-white/5 shrink-0">
                <button class="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-sm font-medium transition-colors shadow-lg shadow-purple-600/20 active:scale-95 transform" @click="emit('showMusicSearch')">
                  点歌
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile Panel: Chat -->
          <div class="w-screen shrink-0 flex flex-col gap-4 min-h-0 h-full px-4 pb-4 relative">
            <!-- Room Info Card -->
            <div class="glass rounded-2xl p-3 shrink-0">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-sm shadow-lg shadow-purple-500/20">
                  {{ roomInfo.name?.slice(0, 1) || 'R' }}
                </div>
                <div>
                  <h3 class="font-bold text-sm leading-none">
                    {{ roomInfo.name || '音乐房间' }}
                  </h3>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="grid grid-cols-3 gap-1.5">
                <button class="py-2 px-2 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-1.5" @click="openOnlineUsers">
                  <span class="flex h-2 w-2 shrink-0 relative">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <span class="text-xs text-white/70 whitespace-nowrap">{{ onlineUsers.length }} 在线</span>
                </button>
                <button class="py-2 px-2 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-1.5" @click="emit('showSettings')">
                  <Settings :size="16" class="text-white/70" />
                  <span class="text-xs text-white/70">设置</span>
                </button>
                <button class="py-2 px-2 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-1.5" @click="emit('showHelp')">
                  <CircleHelp :size="16" class="text-white/70" />
                  <span class="text-xs text-white/70">帮助</span>
                </button>
              </div>
            </div>

            <!-- Online Users Popup -->
            <Transition name="volume-popup">
              <div v-if="showOnlineUsers" class="absolute top-0 left-4 right-4 mt-[140px] bg-[#121214]/95 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl border border-white/10 z-[100] max-h-[280px] overflow-hidden flex flex-col">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <Users :size="16" class="text-white/60" />
                    <span class="text-xs font-medium text-white/80">在线用户</span>
                  </div>
                  <button class="p-1 hover:bg-white/10 rounded-full transition-colors" @click="closeOnlineUsers">
                    <X :size="16" class="text-white/60" />
                  </button>
                </div>
                <div class="space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                  <div v-for="user in onlineUsers" :key="user.name" class="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] hover:bg-white/5 border border-white/5 transition-all">
                    <div class="relative">
                      <Avatar :name="user.name" :avatar="user.avatar" class="w-8 h-8 rounded-lg" />
                      <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-xs font-bold truncate">
                        {{ user.name }}
                      </div>
                      <div class="text-[10px] text-white/40 truncate">
                        在线
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>

            <!-- Chat Messages Card -->
            <div class="glass rounded-3xl flex-1 flex flex-col overflow-hidden">
              <div class="p-3 border-b border-white/5 shrink-0">
                <div class="flex items-center gap-2 text-xs font-bold text-white/60 uppercase tracking-wider">
                  <MessageSquare :size="14" />
                  聊天
                </div>
              </div>
              <div class="flex-1 overflow-y-auto space-y-3 relative px-3 pt-3">
                <div v-for="msg in chatMessages" :key="msg.timestamp" class="flex gap-2 items-start">
                  <Avatar :name="msg.user.name" :avatar="msg.user.avatar" class="w-8 h-8 rounded-full shrink-0 mt-0.5" />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-baseline gap-2 mb-0.5">
                      <span class="font-bold text-sm text-purple-400">{{ msg.user.name }}</span>
                      <span class="text-[10px] text-white/30">{{ formatTimeHH_MM(msg.timestamp) }}</span>
                    </div>
                    <div class="text-sm text-white/80 leading-relaxed break-words">
                      {{ msg.content }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="p-3 bg-black/20 shrink-0">
                <input
                  v-model="newMessage"
                  type="text"
                  placeholder="发送消息..."
                  class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:bg-white/10 transition-colors"
                  @keyup.enter="handleSendMessage"
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Bottom Navigation (Enhanced) - Outside overflow-hidden container -->
    <div class="mobile-nav fixed bottom-2 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-16 rounded-full flex items-center justify-between border border-white/10 shadow-2xl bg-black/80 backdrop-blur-2xl px-2 pointer-events-auto">
      <!-- Animated Background Indicator -->
      <div
        class="absolute top-1 bottom-1 w-[31%] bg-white/15 rounded-full transition-all duration-300 ease-out z-0"
        :class="activeTab === 'lyrics' ? 'left-1' : activeTab === 'playlist' ? 'left-[34.5%]' : 'left-[68%]'"
      />

      <button
        class="flex-1 flex flex-col items-center justify-center gap-0.5 h-full relative z-10 transition-all active:scale-95"
        :class="activeTab === 'lyrics' ? 'text-white' : 'text-white/40 hover:text-white/60'"
        @click="activeTab = 'lyrics'"
      >
        <Music2 :size="activeTab === 'lyrics' ? 22 : 20" class="transition-all duration-300" />
        <span class="text-[10px] font-bold tracking-wide">播放</span>
      </button>

      <button
        class="flex-1 flex flex-col items-center justify-center gap-0.5 h-full relative z-10 transition-all active:scale-95"
        :class="activeTab === 'playlist' ? 'text-white' : 'text-white/40 hover:text-white/60'"
        @click="activeTab = 'playlist'"
      >
        <ListMusic :size="activeTab === 'playlist' ? 22 : 20" class="transition-all duration-300" />
        <span class="text-[10px] font-bold tracking-wide">列表</span>
      </button>

      <button
        class="flex-1 flex flex-col items-center justify-center gap-0.5 h-full relative z-10 transition-all active:scale-95"
        :class="activeTab === 'room' ? 'text-white' : 'text-white/40 hover:text-white/60'"
        @click="activeTab = 'room'"
      >
        <MessageSquare :size="activeTab === 'room' ? 22 : 20" class="transition-all duration-300" />
        <span class="text-[10px] font-bold tracking-wide">聊天</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Song } from '@/types'
import { CircleHelp, History, ListMusic, MessageSquare, Mic2, Music2, Settings, Share2, SkipForward, Users, Volume2, X } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useChat } from '@/composables/useChat'
import { useLyrics } from '@/composables/useLyrics'
import { usePlayer } from '@/composables/usePlayer'
import { useRoom } from '@/composables/useRoom'
import { formatTime, formatTimeHH_MM } from '@/utils/time'
import { processUser } from '@/utils/user'
import Avatar from '../common/Avatar.vue'
import PlaylistItem from '../PlaylistItem.vue'
import VolumeSlider from '../VolumeSlider.vue'

// Props
interface Props {
  isImmersiveMode?: boolean
}
withDefaults(defineProps<Props>(), {
  isImmersiveMode: false,
})

// Emits
const emit = defineEmits<{
  showMusicSearch: []
  showHelp: []
  showSettings: []
  showPlayHistory: []
  toggleImmersive: []
  shareRoom: []
  songLike: [index: number, title: string]
  songDelete: [songName: string]
}>()

// Composables
const { currentLyrics, currentLyricIndex, registerLyricsContainer, unregisterLyricsContainer } = useLyrics()
const { playerState, progressPercentage, skipSong } = usePlayer()
const { chatMessages, sendMessage, onlineUsers } = useChat()
const { roomInfo } = useRoom()

// Local state
const activeTab = ref<'lyrics' | 'playlist' | 'room'>('lyrics')
const desktopRightTab = ref<'playlist' | 'chat'>('playlist')
const showOnlineUsers = ref(false)
const showVolumePopup = ref(false)
const newMessage = ref('')
const isSkipping = ref(false)
const lyricsContainerDesktop = ref<HTMLElement>()
const lyricsContainerMobile = ref<HTMLElement>()

// Computed
const currentSong = computed(() => playerState.currentSong)
const playlist = computed(() => playerState.playlist.map((song: Song) => ({
  ...song,
  requestedBy: song.requestedBy ? processUser(song.requestedBy) : undefined,
})))

const progress = computed(() => progressPercentage.value)

// Methods
function handleSendMessage() {
  if (newMessage.value.trim()) {
    sendMessage(newMessage.value)
    newMessage.value = ''
  }
}

function openOnlineUsers() {
  showOnlineUsers.value = true
}

function closeOnlineUsers() {
  showOnlineUsers.value = false
}

function toggleVolumePopup() {
  showVolumePopup.value = !showVolumePopup.value
}

async function handleSkipSong() {
  if (isSkipping.value)
    return
  isSkipping.value = true
  try {
    skipSong()
  } finally {
    setTimeout(() => {
      isSkipping.value = false
    }, 2000)
  }
}

// 注册桌面端歌词容器
watch(lyricsContainerDesktop, (newVal, oldVal) => {
  if (oldVal)
    unregisterLyricsContainer(ref(oldVal))
  if (newVal)
    registerLyricsContainer(ref(newVal))
})

// 注册移动端歌词容器
watch(lyricsContainerMobile, (newVal, oldVal) => {
  if (oldVal)
    unregisterLyricsContainer(ref(oldVal))
  if (newVal)
    registerLyricsContainer(ref(newVal))
})
</script>

<style scoped>
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.36);
}

/* Mobile Navigation - show only on mobile */
.mobile-nav {
  display: flex !important;
  position: fixed !important;
  z-index: 99999 !important;
  visibility: visible !important;
  opacity: 1 !important;
}

@media (min-width: 768px) {
  .mobile-nav {
    display: none !important;
    visibility: hidden !important;
  }
}

/* Mobile Panel Swipe */
.mobile-panels {
  will-change: transform;
}

.mobile-panels-safe {
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 95px);
}

@media (min-width: 768px) {
  .mobile-panels {
    transform: none !important;
    transition: none !important;
  }
}

/* Hide scrollbar for Chrome, Safari and Opera */
.overflow-y-auto::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.overflow-y-auto {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Custom Scrollbar for Modal */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

/* Volume Popup Transition */
.volume-popup-enter-active,
.volume-popup-leave-active {
  transition: all 0.2s ease;
}

.volume-popup-enter-from,
.volume-popup-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>
