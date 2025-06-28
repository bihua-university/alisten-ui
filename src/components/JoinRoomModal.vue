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
        class="relative bg-dark/90 border border-white/20 rounded-2xl w-full max-w-2xl mx-4 overflow-hidden shadow-2xl backdrop-blur-xl glow-effect"
      >
        <!-- 房间选择和信息展示 -->
        <div class="p-6 relative">
          <!-- 内部装饰背景 -->
          <div class="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl" />

          <div class="relative z-10">
            <!-- 标题 -->
            <div class="text-center mb-6">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shadow-lg backdrop-blur-sm border border-primary/20">
                <i class="fa-solid fa-music text-primary text-2xl animate-pulse" />
              </div>
              <h2 class="text-xl font-semibold mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                选择房间
              </h2>
              <p class="text-sm text-gray-400">
                选择或搜索要加入的音乐房间
              </p>
            </div>

            <!-- 房间搜索和选择 -->
            <div class="space-y-4">
              <!-- 搜索框 -->
              <div class="relative">
                <input
                  v-model="searchKeyword"
                  type="text"
                  placeholder="搜索房间名称..."
                  class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white/15 transition-all"
                  @input="handleSearch"
                >
                <i class="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <div v-if="isSearching" class="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <i class="fa-solid fa-spinner animate-spin text-primary" />
                </div>
              </div>

              <!-- 房间列表 -->
              <div class="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                <div
                  v-for="room in filteredRooms"
                  :key="room.id"
                  class="p-4 rounded-lg border transition-all cursor-pointer"
                  :class="[
                    selectedRoomId === room.id
                      ? 'bg-primary/20 border-primary/50 shadow-lg'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20',
                  ]"
                  @click="selectRoom(room)"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <div class="flex items-center mb-2">
                        <i class="fa-solid fa-door-open text-primary mr-2" />
                        <span class="font-medium text-white">{{ room.name }}</span>
                        <span v-if="room.needPwd" class="ml-2 text-yellow-400" title="需要密码">
                          <i class="fa-solid fa-lock text-xs" />
                        </span>
                      </div>
                      <div class="flex items-center text-sm text-gray-300">
                        <i class="fa-solid fa-users text-primary mr-1" />
                        <span>{{ room.population }} 人在线</span>
                        <span v-if="room.description" class="ml-3 text-gray-400">
                          {{ room.description }}
                        </span>
                      </div>
                    </div>
                    <div v-if="selectedRoomId === room.id" class="text-primary">
                      <i class="fa-solid fa-check-circle" />
                    </div>
                  </div>
                </div>

                <!-- 无房间提示 -->
                <div v-if="!isSearching && filteredRooms.length === 0" class="text-center py-8 text-gray-400">
                  <i class="fa-solid fa-search text-2xl mb-2 opacity-50" />
                  <p>{{ searchKeyword ? '未找到匹配的房间' : '暂无可用房间' }}</p>
                </div>

                <!-- 加载中 -->
                <div v-if="isSearching" class="text-center py-8 text-gray-400">
                  <i class="fa-solid fa-spinner animate-spin text-2xl mb-2" />
                  <p>正在搜索房间...</p>
                </div>
              </div>

              <p class="text-sm text-gray-400 text-center">
                点击房间即可加入，享受与其他用户一起听歌、聊天和互动的乐趣
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <!-- 确认加入房间弹窗 -->
  <transition name="modal">
    <div v-if="showConfirm" class="fixed inset-0 z-[110] flex items-center justify-center">
      <!-- 背景层 -->
      <div class="absolute inset-0 bg-black/90 backdrop-blur-md" />

      <!-- 装饰性背景 -->
      <div class="absolute inset-0 overflow-hidden">
        <!-- 动态渐变背景 -->
        <div class="absolute inset-0 bg-gradient-to-br from-primary/15 via-purple-500/8 to-pink-500/15" />

        <!-- 装饰性圆圈 -->
        <div class="absolute -top-10 -left-10 w-32 h-32 bg-primary/25 rounded-full blur-xl animate-pulse" />
        <div class="absolute top-1/4 -right-16 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl animate-pulse" style="animation-delay: 1s;" />
        <div class="absolute -bottom-8 left-1/3 w-24 h-24 bg-pink-500/25 rounded-full blur-lg animate-pulse" style="animation-delay: 2s;" />
      </div>

      <div
        v-if="selectedRoom"
        class="relative bg-dark/95 border border-white/30 rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl backdrop-blur-xl glow-effect"
      >
        <!-- 确认信息展示 -->
        <div class="p-6 text-center relative">
          <!-- 内部装饰背景 -->
          <div class="absolute inset-0 bg-gradient-to-b from-primary/8 to-transparent rounded-2xl" />

          <div class="relative z-10">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/40 to-primary/15 flex items-center justify-center shadow-lg backdrop-blur-sm border border-primary/30">
              <i class="fa-solid fa-music text-primary text-2xl animate-pulse" />
            </div>
            <h2 class="text-xl font-semibold mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              确认加入房间
            </h2>

            <!-- 房间信息卡片 -->
            <div class="bg-gradient-to-r from-white/15 to-white/8 rounded-lg p-4 mb-6 text-left backdrop-blur-sm border border-white/20 shadow-lg">
              <div class="flex items-center mb-3">
                <i class="fa-solid fa-door-open text-primary mr-2" />
                <span class="font-medium">{{ selectedRoom.name }}</span>
                <span v-if="selectedRoom.needPwd" class="ml-2 text-yellow-400" title="需要密码">
                  <i class="fa-solid fa-lock text-xs" />
                </span>
              </div>
              <div class="flex items-center mb-2">
                <i class="fa-solid fa-users text-primary mr-2" />
                <span class="text-sm text-gray-300">{{ selectedRoom.population }} 人在线</span>
              </div>
              <div class="flex items-center">
                <i class="fa-solid fa-info-circle text-primary mr-2" />
                <span class="text-sm text-gray-300">{{ selectedRoom.description || '暂无简介' }}</span>
              </div>
            </div>

            <!-- 密码输入框 -->
            <div v-if="selectedRoom.needPwd" class="mb-6">
              <div class="relative">
                <input
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="请输入房间密码"
                  class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white/15 transition-all"
                  @keyup.enter="handleConfirm"
                >
                <button
                  type="button"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <i :class="showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" />
                </button>
              </div>
            </div>

            <p class="text-sm text-gray-400 mb-6">
              加入后您将与其他用户一起听歌、聊天和互动
            </p>

            <!-- 操作按钮 -->
            <div class="flex space-x-3">
              <button
                class="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-full py-3 px-4 transition-all backdrop-blur-sm border border-white/10 shadow-lg"
                @click="handleCancel"
              >
                取消
              </button>
              <button
                class="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-full py-3 px-4 transition-all shadow-lg backdrop-blur-sm"
                :disabled="selectedRoom.needPwd && !confirmPassword.trim()"
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
import type { RoomInfo } from '@/types'

import { computed, onMounted, ref, watch } from 'vue'

import { useRoom } from '@/composables/useRoom'
import { searchRooms } from '@/utils/api'
import { getLastJoinedRoom, getSavedRoomPassword, saveLastJoinedRoom, saveRoomPassword } from '@/utils/user'

interface Props {
  show: boolean
}

interface Emits {
  confirm: [roomId: string, password?: string]
  cancel: []
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// 使用 useRoom
const { updateRoomInfo, setCurrentPassword } = useRoom()

// 响应式数据
const password = ref('')
const searchKeyword = ref('')
const isSearching = ref(false)
const allRooms = ref<RoomInfo[]>([])
const selectedRoomId = ref<string>('')

// 确认弹窗相关
const showConfirm = ref(false)
const confirmPassword = ref('')
const showConfirmPassword = ref(false)

// 计算属性
const selectedRoom = computed(() =>
  allRooms.value.find(room => room.id === selectedRoomId.value) || null,
)

const filteredRooms = computed(() => {
  if (!searchKeyword.value.trim()) {
    return allRooms.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return allRooms.value.filter(room =>
    room.name.toLowerCase().includes(keyword)
    || room.description?.toLowerCase().includes(keyword),
  )
})

// 搜索防抖
let searchTimeout: number | null = null

function handleSearch() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout = window.setTimeout(() => {
    loadRooms()
  }, 300)
}

// 加载房间列表
async function loadRooms() {
  try {
    isSearching.value = true
    const response = await searchRooms(searchKeyword.value.trim() || undefined)
    allRooms.value = response || []

    // 如果还没有选择房间，尝试选择上次加入的房间
    if (!selectedRoomId.value) {
      const lastRoomId = getLastJoinedRoom()
      if (lastRoomId && allRooms.value.some(room => room.id === lastRoomId)) {
        selectedRoomId.value = lastRoomId

        // 找到上次进入的房间
        const lastRoom = allRooms.value.find(room => room.id === lastRoomId)
        if (lastRoom) {
          // 如果需要密码，尝试加载保存的密码
          if (lastRoom.needPwd) {
            const savedPassword = getSavedRoomPassword(lastRoom.id)
            password.value = savedPassword || ''
            confirmPassword.value = savedPassword || ''
          } else {
            password.value = ''
            confirmPassword.value = ''
          }

          // 直接显示确认弹窗
          showConfirm.value = true
        }
      }
    }
  } catch (error) {
    console.error('加载房间列表失败:', error)
    allRooms.value = []
  } finally {
    isSearching.value = false
  }
}

// 选择房间并直接显示确认弹窗
function selectRoom(room: RoomInfo) {
  selectedRoomId.value = room.id

  // 如果需要密码，尝试加载保存的密码
  if (room.needPwd) {
    const savedPassword = getSavedRoomPassword(room.id)
    password.value = savedPassword || ''
    confirmPassword.value = savedPassword || ''
  } else {
    password.value = ''
    confirmPassword.value = ''
  }

  // 直接显示确认弹窗
  showConfirm.value = true
}

// 隐藏确认弹窗
function hideConfirmDialog() {
  showConfirm.value = false
  confirmPassword.value = ''
  showConfirmPassword.value = false
}

// 监听选中房间变化，自动加载保存的密码
watch(() => selectedRoom.value, (newRoom) => {
  if (newRoom?.needPwd) {
    const savedPassword = getSavedRoomPassword(newRoom.id)
    password.value = savedPassword || ''
  } else {
    password.value = ''
  }
})

// 确认加入房间
function handleConfirm() {
  if (!selectedRoom.value) {
    return
  }

  // 如果需要密码且密码为空，不允许确认
  if (selectedRoom.value.needPwd && !confirmPassword.value.trim()) {
    return
  }

  // 保存密码到本地存储
  if (selectedRoom.value.needPwd && confirmPassword.value.trim()) {
    saveRoomPassword(selectedRoom.value.id, confirmPassword.value.trim())
  }

  // 保存上次进入的房间
  saveLastJoinedRoom(selectedRoom.value.id)

  // 更新房间信息到 useRoom
  updateRoomInfo(selectedRoom.value)

  // 设置当前房间密码
  setCurrentPassword(selectedRoom.value.needPwd ? confirmPassword.value.trim() : undefined)

  // 隐藏确认弹窗
  hideConfirmDialog()

  emit('confirm', selectedRoom.value.id, selectedRoom.value.needPwd ? confirmPassword.value.trim() : undefined)
}

function handleCancel() {
  // 如果确认弹窗正在显示，关闭确认弹窗并回到选择页面
  if (showConfirm.value) {
    hideConfirmDialog()
    // 不关闭整个模态框，让用户可以重新选择房间
  } else {
    // 如果在选择页面，关闭整个模态框
    emit('cancel')
  }
}

// 初始化
onMounted(() => {
  loadRooms()
})
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

/* 自定义滚动条样式 */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(79, 70, 229, 0.6) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(79, 70, 229, 0.6);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(79, 70, 229, 0.8);
}
</style>
