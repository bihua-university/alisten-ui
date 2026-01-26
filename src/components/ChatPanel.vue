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
</template>

<script setup lang="ts">
import { CircleHelp, History, MessageSquare, Settings, Share2, Users, X } from 'lucide-vue-next'
import { ref } from 'vue'
import { useChat } from '@/composables/useChat'
import { useRoom } from '@/composables/useRoom'
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
</style>
