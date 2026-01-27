<template>
  <div class="flex flex-col gap-3 h-full relative">
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
      <div :class="isDesktop ? 'flex items-center gap-1 flex-wrap' : 'grid grid-cols-3 gap-1.5'">
        <button class="py-2 px-2 md:px-3 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-1.5" :class="isDesktop ? 'flex-1' : ''" @click="openOnlineUsers">
          <span class="flex h-2 w-2 shrink-0 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span class="text-xs text-white/70 whitespace-nowrap">{{ onlineUsers.length }} 在线</span>
        </button>
        <button v-if="isDesktop" class="flex-1 py-2 px-3 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-1.5" @click="emit('showPlayHistory')">
          <History :size="16" class="text-white/70" />
          <span class="text-xs text-white/70">历史</span>
        </button>
        <button v-if="isDesktop" class="flex-1 py-2 px-3 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-1.5" @click="emit('shareRoom')">
          <Share2 :size="16" class="text-white/70" />
          <span class="text-xs text-white/70">分享</span>
        </button>
        <button class="py-2 px-2 md:px-3 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-1.5" :class="isDesktop ? 'flex-1' : ''" @click="emit('showSettings')">
          <Settings :size="16" class="text-white/70" />
          <span class="text-xs text-white/70">设置</span>
        </button>
        <button class="py-2 px-2 md:px-3 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-1.5" :class="isDesktop ? 'flex-1' : ''" @click="emit('showHelp')">
          <CircleHelp :size="16" class="text-white/70" />
          <span class="text-xs text-white/70">帮助</span>
        </button>
      </div>
    </div>

    <!-- Online Users Popup -->
    <Transition name="volume-popup">
      <div v-if="showOnlineUsers" class="absolute top-0 left-0 right-0 mt-[120px] md:mt-[120px] bg-[#121214]/95 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl border border-white/10 z-[100] max-h-[280px] md:max-h-[300px] overflow-hidden flex flex-col">
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
              <Avatar :name="user.name" :avatar="user.avatar" class="w-10 h-10 rounded-lg" />
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
      <div class="flex-1 overflow-y-auto space-y-3 relative px-3 pt-3 chat-messages-container">
        <TransitionGroup name="chat-message">
          <div
            v-for="msg in chatMessages"
            :key="msg.timestamp"
            class="flex gap-3 items-start"
            :class="isCurrentUser(msg.user.name) ? 'flex-row-reverse' : ''"
          >
            <Avatar :name="msg.user.name" :avatar="msg.user.avatar" class="w-10 h-12 pt-2 rounded-full shrink-0" />
            <div class="flex-1 min-w-0" :class="isCurrentUser(msg.user.name) ? 'text-right' : ''">
              <div class="flex items-center gap-2 mb-0.5" :class="isCurrentUser(msg.user.name) ? 'flex-row-reverse' : ''">
                <span class="font-bold text-sm leading-none py-2" :class="isCurrentUser(msg.user.name) ? 'text-indigo-400' : 'text-purple-400'">{{ msg.user.name }}</span>
              </div>
              <div class="flex items-end gap-2" :class="isCurrentUser(msg.user.name) ? 'flex-row-reverse' : ''">
                <div class="relative">
                  <div
                    class="chat-bubble text-sm leading-relaxed break-words inline-block text-left relative"
                    :class="[
                      isCurrentUser(msg.user.name) ? 'chat-bubble-self' : 'chat-bubble-other',
                      bubbleStyle === 'feibi' ? 'chat-bubble-feibi' : '',
                    ]"
                  >
                    {{ msg.content }}
                  </div>
                  <img
                    v-if="bubbleStyle === 'feibi' && isCurrentUser(msg.user.name)"
                    src="/feibi.png"
                    class="feibi-avatar"
                    alt="菲比"
                  >
                </div>
                <span class="text-[10px] text-white/30 pb-1">{{ formatTimeHH_MM(msg.timestamp) }}</span>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
      <div class="p-3 bg-black/20 shrink-0">
        <div class="relative">
          <input
            v-model="newMessage"
            type="text"
            placeholder="发送消息..."
            class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-purple-500/50 transition-all"
            @keyup.enter="handleSendMessage"
          >
          <button
            :disabled="!newMessage.trim()"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all duration-200"
            :class="newMessage.trim() ? 'text-purple-400 hover:bg-purple-500/20 hover:scale-110 active:scale-95' : 'text-white/20'"
            @click="handleSendMessage"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CircleHelp, History, MessageSquare, Settings, Share2, Users, X } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useChat } from '@/composables/useChat'
import { useRoom } from '@/composables/useRoom'
import { useUserSettings } from '@/composables/useUserSettings'
import { formatTimeHH_MM } from '@/utils/time'
import Avatar from './common/Avatar.vue'

interface Props {
  isDesktop?: boolean
}

withDefaults(defineProps<Props>(), {
  isDesktop: false,
})

const emit = defineEmits<{
  showHelp: []
  showSettings: []
  showPlayHistory: []
  shareRoom: []
}>()

const { chatMessages, sendMessage, onlineUsers } = useChat()
const { roomInfo } = useRoom()
const { currentUser, bubbleStyle } = useUserSettings()

// 判断消息是否来自当前用户
const isCurrentUser = computed(() => {
  return (userName: string) => userName === currentUser.value.name
})

const showOnlineUsers = ref(false)
const newMessage = ref('')

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
</script>

<style scoped>
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.36);
}

/* Hide scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  display: none;
}

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

/* Chat Message Animations */
.chat-message-enter-active {
  transition: all 0.3s ease-out;
}

.chat-message-leave-active {
  transition: all 0.2s ease-in;
}

.chat-message-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.chat-message-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.chat-message-move {
  transition: transform 0.3s ease;
}

/* Chat Bubble Styles */
.chat-bubble {
  padding: 8px 12px;
  border-radius: 12px;
  max-width: min(280px, calc(100vw - 140px));
  word-wrap: break-word;
}

@media (min-width: 768px) {
  .chat-bubble {
    max-width: 400px;
  }
}

/* Feibi Bubble Style */
.chat-bubble-feibi {
  background: #ffffff !important;
  color: #000000 !important;
  border-radius: 14px !important;
  box-shadow: 1px 1px 0 #3f3f3f !important;
  font-weight: 600;
}

.chat-bubble-feibi.chat-bubble-self {
  background: #ffffff !important;
  border-bottom-right-radius: 2px !important;
  z-index: 5;
  position: relative;
}

.chat-bubble-feibi.chat-bubble-other {
  background: #ffffff !important;
  border-bottom-left-radius: 2px !important;
}

.feibi-avatar {
  position: absolute;
  right: -25px;
  bottom: -20px;
  width: 40px;
  height: 40px;
  object-fit: contain;
  pointer-events: none;
  z-index: 0;
}

/* Self Message Bubble - Right side */
.chat-bubble-self {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(139, 92, 246, 0.9) 100%);
  color: white;
  border-bottom-right-radius: 4px;
  box-shadow:
    0 2px 8px rgba(99, 102, 241, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

/* Other Message Bubble - Left side */
.chat-bubble-other {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  border-bottom-left-radius: 4px;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  backdrop-filter: blur(10px);
}

/* Scrollbar Styling for Chat */
.chat-messages-container::-webkit-scrollbar {
  width: 4px;
}

.chat-messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.chat-messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Low and off performance mode - consistent with other components */
.performance-low .glass,
.performance-off .glass {
  background: #15171B !important;
  backdrop-filter: none !important;
  border-color: rgba(255, 255, 255, 0.05) !important;
  box-shadow: none !important;
}

/* Online users popup in low/off performance mode */
.performance-low .bg-\[\#121214\]\/95,
.performance-off .bg-\[\#121214\]\/95 {
  background: #15171B !important;
  backdrop-filter: none !important;
}
</style>
