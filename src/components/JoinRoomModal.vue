<template>
  <transition name="modal">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center">
      <!-- 背景层 -->
      <div class="absolute inset-0 bg-black/80 backdrop-blur-md" />

      <!-- 装饰性背景 -->
      <div class="absolute inset-0 overflow-hidden">
        <!-- 动态渐变背景 -->
        <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/10" />

        <!-- 装饰性圆圈 -->
        <div class="absolute -top-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <div class="absolute top-1/3 -right-32 w-64 h-64 bg-purple-500/15 rounded-full blur-2xl animate-pulse" style="animation-delay: 1s;" />
        <div class="absolute -bottom-16 left-1/4 w-32 h-32 bg-pink-500/20 rounded-full blur-lg animate-pulse" style="animation-delay: 2s;" />

        <!-- 音乐相关装饰元素 -->
        <div class="absolute top-20 left-1/4 text-primary/10 text-6xl animate-float">
          <i class="fa-solid fa-music" />
        </div>
        <div class="absolute bottom-32 right-1/4 text-purple-400/10 text-4xl animate-float" style="animation-delay: 1.5s;">
          <i class="fa-solid fa-headphones" />
        </div>
        <div class="absolute top-1/2 left-10 text-pink-400/10 text-5xl animate-float" style="animation-delay: 0.8s;">
          <i class="fa-solid fa-heart" />
        </div>
      </div>

      <div
        class="relative bg-dark/90 border border-white/20 rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl backdrop-blur-xl glow-effect"
      >
        <!-- 房间信息展示 -->
        <div class="p-6 text-center relative">
          <!-- 内部装饰背景 -->
          <div class="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl" />

          <div class="relative z-10">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-lg backdrop-blur-sm border border-primary/20">
              <i class="fa-solid fa-music text-primary text-2xl animate-pulse" />
            </div>
            <h2 class="text-xl font-semibold mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              确认加入房间
            </h2>
            <div class="bg-gradient-to-r from-white/10 to-white/5 rounded-lg p-4 mb-6 text-left backdrop-blur-sm border border-white/10 shadow-lg">
              <div class="flex items-center mb-3">
                <i class="fa-solid fa-door-open text-primary mr-2" />
                <span class="font-medium">{{ roomInfo.name }}</span>
              </div>
              <div class="flex items-center">
                <i class="fa-solid fa-info-circle text-primary mr-2" />
                <span class="text-sm text-gray-300">{{ roomInfo.description || '暂无简介' }}</span>
              </div>
            </div>
            <!-- 密码输入框 -->
            <div v-if="roomInfo.needPwd" class="mb-6">
              <div class="relative">
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入房间密码"
                  class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white/15 transition-all"
                  @keyup.enter="handleConfirm"
                >
                <button
                  type="button"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" />
                </button>
              </div>
            </div>
            <p class="text-sm text-gray-400 mb-6">
              加入后您将与其他用户一起听歌、聊天和互动
            </p>
            <div class="flex space-x-3">
              <button
                class="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-full py-3 px-4 transition-all backdrop-blur-sm border border-white/10 shadow-lg"
                @click="handleCancel"
              >
                取消
              </button>
              <button
                class="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-full py-3 px-4 transition-all shadow-lg backdrop-blur-sm"
                :disabled="roomInfo.needPwd && !password.trim()"
                @click="handleConfirm"
              >
                加入房间
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import { useRoom } from '@/composables/useRoom'
import { getSavedRoomPassword, saveRoomPassword } from '@/utils/user'

interface Props {
  show: boolean
}

interface Emits {
  confirm: [password?: string]
  cancel: []
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// 使用 useRoom 获取房间信息
const { roomInfo } = useRoom()

// 响应式数据
const password = ref('')
const showPassword = ref(false)

// 监听 roomInfo 变化，自动加载保存的密码
watch(() => roomInfo.value.id, (newRoomId) => {
  if (newRoomId && roomInfo.value.needPwd) {
    const savedPassword = getSavedRoomPassword(newRoomId)
    password.value = savedPassword || ''
  }
}, { immediate: true })

function handleConfirm() {
  // 如果需要密码且密码为空，不允许确认
  if (roomInfo.value.needPwd && !password.value.trim()) {
    return
  }

  // 保存密码到本地存储
  if (roomInfo.value.needPwd && password.value.trim()) {
    saveRoomPassword(roomInfo.value.id, password.value.trim())
  }

  emit('confirm', roomInfo.value.needPwd ? password.value.trim() : undefined)
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped>
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

/* 自定义动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-10px) rotate(1deg);
  }
  66% {
    transform: translateY(-5px) rotate(-1deg);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* 增强的脉冲动画 */
@keyframes enhanced-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

.animate-pulse {
  animation: enhanced-pulse 3s ease-in-out infinite;
}

/* 发光效果 */
@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(79, 70, 229, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(79, 70, 229, 0.5);
  }
}

.glow-effect {
  animation: glow 4s ease-in-out infinite;
}
</style>
