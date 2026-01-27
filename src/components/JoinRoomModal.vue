<template>
  <!-- 房间选择主弹窗 -->
  <Modal
    v-if="show" :z-index="100" size="md" title="选择房间" subtitle="选择或搜索要加入的音乐房间" header-icon="fa-solid fa-music"
    :enable-backdrop-transition="false" :allow-backdrop-close="false" @close="emit('cancel')"
  >
    <!-- 房间搜索和选择 -->
    <div class="space-y-6 modal-content-reveal">
      <!-- 搜索框和创建按钮 -->
      <div class="flex gap-3">
        <div class="relative flex-1 group">
          <input
            v-model="searchKeyword" type="text" placeholder="搜索房间名称..."
            class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 pl-11 text-white placeholder-white/40
                   focus:outline-none focus:border-purple-500/50 focus:bg-white/10
                   transition-all duration-300"
            @input="handleSearch"
          >
          <i class="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 group-focus-within:text-purple-400 transition-colors duration-300" />
          <div v-if="isSearching" class="absolute right-3 top-1/2 transform -translate-y-1/2">
            <i class="fa-solid fa-spinner animate-spin text-purple-500" />
          </div>
        </div>
        <button
          class="relative overflow-hidden bg-purple-600 hover:bg-purple-500 active:scale-95 text-white rounded-2xl px-6 py-3.5
                 transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 hover:-translate-y-0.5
                 flex items-center gap-2 whitespace-nowrap font-medium btn-shine"
          @click="showCreateRoomDialog"
        >
          <i class="fa-solid fa-plus" />
          创建房间
        </button>
      </div>

      <!-- 房间列表 - 无边框设计 -->
      <div class="max-h-72 overflow-y-auto room-list-container">
        <div class="space-y-3">
          <TransitionGroup name="room-list">
            <div
              v-for="(room, index) in filteredRooms" :key="room.id"
              class="group p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 cursor-pointer room-card"
              :class="[
                selectedRoomId === room.id ? 'selected-room' : '',
              ]"
              :style="{ animationDelay: `${index * 50}ms` }"
              @click="selectRoom(room)"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center mb-2">
                    <span class="font-semibold text-white text-sm truncate group-hover:text-purple-200 transition-colors">{{ room.name }}</span>
                    <span v-if="room.needPwd" class="ml-2 text-white/40 flex-shrink-0 group-hover:text-amber-400/80 transition-colors" title="需要密码">
                      <i class="fa-solid fa-lock text-xs" />
                    </span>
                  </div>
                  <div class="flex items-center text-xs text-white/40">
                    <div class="flex items-center mr-4 flex-shrink-0">
                      <i class="fa-solid fa-users mr-1.5 text-white/30 group-hover:text-purple-400/60 transition-colors" />
                      <span>{{ room.population }} 人</span>
                    </div>
                    <div class="flex items-center min-w-0">
                      <i class="fa-solid fa-info-circle mr-1.5 text-white/30 group-hover:text-purple-400/60 transition-colors" />
                      <span class="truncate">{{ room.description || '暂无简介' }}</span>
                    </div>
                  </div>
                </div>
                <div
                  class="ml-4 flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                  :class="selectedRoomId === room.id
                    ? 'bg-purple-600 border-purple-600 scale-110 check-bounce'
                    : 'border-white/20 group-hover:border-white/40 group-hover:scale-105'"
                >
                  <i v-if="selectedRoomId === room.id" class="fa-solid fa-check text-white text-xs" />
                </div>
              </div>
            </div>
          </TransitionGroup>

          <!-- 无房间提示 -->
          <Transition name="fade-scale">
            <div v-if="!isSearching && filteredRooms.length === 0" class="text-center py-10 text-white/40">
              <i class="fa-solid fa-search text-3xl mb-3 text-white/20" />
              <p class="text-sm">
                {{ searchKeyword ? '未找到匹配的房间' : '暂无可用房间' }}
              </p>
            </div>
          </Transition>

          <!-- 加载中 -->
          <Transition name="fade-scale">
            <div v-if="isSearching" class="text-center py-10 text-white/40">
              <i class="fa-solid fa-spinner animate-spin text-3xl mb-3 text-purple-500" />
              <p class="text-sm">
                正在搜索房间...
              </p>
            </div>
          </Transition>
        </div>
      </div>

      <p class="text-xs text-white/30 text-center">
        点击房间即可加入，与其他用户一起听歌互动
      </p>
    </div>
  </Modal>

  <!-- 确认加入房间弹窗 -->
  <Modal
    v-if="dialogState.showConfirm && selectedRoom && show" :z-index="110" size="sm" title="确认加入房间"
    header-icon="fa-solid fa-music" decoration-variant="confirm" @close="handleCancel"
  >
    <!-- 房间信息卡片 -->
    <div class="rounded-2xl p-5 mb-6 bg-white/[0.03] relative overflow-hidden">
      <div class="flex items-center mb-4">
        <div class="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center mr-4">
          <i class="fa-solid fa-door-open text-purple-400 text-lg" />
        </div>
        <div class="flex-1 min-w-0">
          <span class="font-semibold text-white text-base block truncate">{{ selectedRoom.name }}</span>
          <span v-if="selectedRoom.needPwd" class="text-white/40 text-xs flex items-center gap-1 mt-0.5">
            <i class="fa-solid fa-lock text-xs" />
            需要密码
          </span>
        </div>
      </div>
      <div class="flex items-center gap-6 text-sm text-white/40">
        <div class="flex items-center">
          <i class="fa-solid fa-users mr-2 text-white/30" />
          <span>{{ selectedRoom.population }} 人在线</span>
        </div>
        <div class="flex items-center min-w-0">
          <i class="fa-solid fa-info-circle mr-2 text-white/30" />
          <span class="truncate">{{ selectedRoom.description || '暂无简介' }}</span>
        </div>
      </div>
    </div>

    <!-- 密码输入框 -->
    <Transition name="slide-down">
      <div v-if="selectedRoom.needPwd" class="mb-6">
        <PasswordInput v-model="confirmPassword" placeholder="请输入房间密码" :show-counter="false" @enter="handleConfirm" />
      </div>
    </Transition>

    <p class="text-sm text-white/40 mb-6 text-center">
      加入后您将与其他用户一起听歌、聊天和互动
    </p>

    <!-- 操作按钮 -->
    <div class="flex gap-3">
      <button
        class="flex-1 bg-white/5 hover:bg-white/10 active:scale-95 text-white rounded-2xl py-3.5 px-4
               transition-all duration-300 border border-white/10 font-medium hover:border-white/20"
        @click="handleCancel"
      >
        取消
      </button>
      <button
        class="relative overflow-hidden flex-1 bg-purple-600 hover:bg-purple-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
               disabled:active:scale-100 text-white rounded-2xl py-3.5 px-4 transition-all duration-300
               shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 hover:-translate-y-0.5 font-medium btn-shine"
        :disabled="selectedRoom.needPwd && !confirmPassword.trim()" @click="handleConfirm"
      >
        <span class="flex items-center justify-center gap-2">
          <i class="fa-solid fa-right-to-bracket" />
          加入房间
        </span>
      </button>
    </div>
  </Modal>

  <!-- 创建房间弹窗 -->
  <Modal
    v-if="dialogState.showCreate" :z-index="120" size="md" title="创建新房间" subtitle="创建属于您的音乐房间，与朋友一起享受音乐"
    header-icon="fa-solid fa-plus" theme="success" @close="hideCreateRoomDialog"
  >
    <!-- 创建房间表单 -->
    <div class="space-y-5">
      <!-- 房间名称 -->
      <div class="form-field" style="--delay: 0ms">
        <label class="block text-sm font-medium mb-2.5 text-white/60">
          <i class="fa-solid fa-tag text-white/40 mr-2" />
          房间名称 *
        </label>
        <input
          v-model="createForm.name" type="text" placeholder="请输入房间名称"
          class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/30
                 focus:outline-none focus:border-purple-500/50 focus:bg-white/10
                 transition-all duration-300"
          maxlength="50" @keyup.enter="handleCreateRoom"
        >
        <div class="text-xs text-white/30 mt-2 text-right">
          <span :class="createForm.name.length > 40 ? 'text-amber-400/80' : ''">{{ createForm.name.length }}</span>/50
        </div>
      </div>

      <!-- 房间描述 -->
      <div class="form-field" style="--delay: 50ms">
        <label class="block text-sm font-medium mb-2.5 text-white/60">
          <i class="fa-solid fa-info-circle text-white/40 mr-2" />
          房间描述
        </label>
        <textarea
          v-model="createForm.description" placeholder="请输入房间描述（可选）"
          class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/30
                 focus:outline-none focus:border-purple-500/50 focus:bg-white/10
                 transition-all duration-300 resize-none"
          rows="3" maxlength="200"
        />
        <div class="text-xs text-white/30 mt-2 text-right">
          <span :class="(createForm.description || '').length > 180 ? 'text-amber-400/80' : ''">{{ (createForm.description || '').length }}</span>/200
        </div>
      </div>

      <!-- 密码设置 -->
      <div class="form-field" style="--delay: 100ms">
        <div class="flex flex-row justify-between items-center mb-2.5">
          <label class="text-sm font-medium text-white/60">
            <i class="fa-solid fa-lock text-white/40 mr-2" />
            房间密码
          </label>
          <button
            type="button" class="text-xs text-purple-400 hover:text-purple-300 transition-colors duration-300 hover:scale-105 transform"
            @click="createForm.enablePassword = !createForm.enablePassword"
          >
            <span class="flex items-center gap-1">
              <i :class="createForm.enablePassword ? 'fa-solid fa-lock-open' : 'fa-solid fa-lock'" />
              {{ createForm.enablePassword ? '取消密码' : '设置密码' }}
            </span>
          </button>
        </div>
        <div class="rounded-2xl p-4 bg-white/[0.03]">
          <Transition name="fade" mode="out-in">
            <div v-if="createForm.enablePassword" key="password-input" class="space-y-2">
              <PasswordInput v-model="createForm.password" placeholder="请输入房间密码" @enter="handleCreateRoom" />
            </div>
            <div v-else key="password-hint" class="text-sm text-white/40 flex items-center">
              <i class="fa-solid fa-info-circle text-white/30 mr-2" />
              房间将对所有人开放，无需密码即可加入
            </div>
          </Transition>
        </div>
      </div>

      <p class="text-xs text-white/30 text-center">
        创建房间后您将成为房主，可以管理房间设置和播放列表
      </p>
    </div>

    <!-- 操作按钮 -->
    <div class="flex gap-3 mt-7">
      <button
        class="flex-1 bg-white/5 hover:bg-white/10 active:scale-95 text-white rounded-2xl py-3.5 px-4
               transition-all duration-300 border border-white/10 font-medium hover:border-white/20"
        @click="hideCreateRoomDialog"
      >
        取消
      </button>
      <button
        class="relative overflow-hidden flex-1 bg-purple-600 hover:bg-purple-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
               disabled:active:scale-100 text-white rounded-2xl py-3.5 px-4 transition-all duration-300
               shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 hover:-translate-y-0.5
               flex items-center justify-center gap-2 font-medium btn-shine"
        :disabled="!createForm.name.trim() || isCreatingRoom" @click="handleCreateRoom"
      >
        <i v-if="isCreatingRoom" class="fa-solid fa-spinner animate-spin" />
        <i v-else class="fa-solid fa-plus" />
        {{ isCreatingRoom ? '创建中...' : '创建房间' }}
      </button>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import type { RoomInfo } from '@/types'
import type { CreateRoomRequest } from '@/utils/api'

import { computed, onMounted, ref } from 'vue'

import Modal from '@/components/common/Modal.vue'
import PasswordInput from '@/components/common/PasswordInput.vue'
import { useNotification } from '@/composables/useNotification'
import { useRoom } from '@/composables/useRoom'
import { createRoom, searchRooms } from '@/utils/api'
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

// 使用 useRoom 和 useNotification
const { updateRoomInfo, setCurrentPassword } = useRoom()
const { showNotification } = useNotification()

// 响应式数据 - 合并相关状态
const searchKeyword = ref('')
const isSearching = ref(false)
const allRooms = ref<RoomInfo[]>([])
const selectedRoomId = ref<string>('')

// 弹窗状态管理
const dialogState = ref({
  showConfirm: false,
  showCreate: false,
})

// 表单数据
const confirmPassword = ref('')

const createForm = ref({
  name: '',
  description: '',
  password: '',
  enablePassword: false,
})

const isCreatingRoom = ref(false)

// 辅助函数 - 统一密码设置逻辑
function setRoomPassword(room: RoomInfo) {
  if (room.needPwd) {
    const savedPassword = getSavedRoomPassword(room.id)
    confirmPassword.value = savedPassword || ''
  } else {
    confirmPassword.value = ''
  }
}

// 统一表单重置
function resetCreateForm() {
  createForm.value = {
    name: '',
    description: '',
    password: '',
    enablePassword: false,
  }
}

// 统一错误通知
function showError(message: string) {
  showNotification({
    message,
    type: 'error',
    icon: 'fa-solid fa-exclamation-triangle',
    duration: 4000,
  })
}

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
  searchTimeout = window.setTimeout(() => loadRooms(), 300)
}

// 加载房间列表
async function loadRooms() {
  try {
    isSearching.value = true
    const response = await searchRooms(searchKeyword.value.trim() || undefined)
    allRooms.value = response || []

    // 如果还没有选择房间，优先选择URL预设的房间，然后尝试选择上次加入的房间
    if (!selectedRoomId.value) {
      let targetRoomId: string | null = null

      // 检查 URL 参数是否包含房间信息
      const urlParams = new URLSearchParams(window.location.search)
      const houseIdFromUrl = urlParams.get('houseId') || urlParams.get('houseid') || urlParams.get('HOUSEID')
      const housePwdFromUrl = urlParams.get('housePwd') || urlParams.get('housepwd') || urlParams.get('HOUSEPWD')

      // 优先处理从URL传入的房间ID
      if (houseIdFromUrl) {
        targetRoomId = houseIdFromUrl
        console.log('🎯 使用URL预设的房间ID:', targetRoomId)

        let autoPassword = housePwdFromUrl

        // 如果 URL 中没有密码，尝试从 localStorage 获取
        if (!autoPassword) {
          const savedPassword = getSavedRoomPassword(houseIdFromUrl)
          if (savedPassword) {
            autoPassword = savedPassword
            console.log('🔑 从 localStorage 中找到房间密码')
          }
        }

        // 如果有房间 ID 和密码，直接加入房间
        if (autoPassword) {
          console.log('✅ 直接跳转到房间:', houseIdFromUrl)
          // 查找房间信息，如果找到则设置并直接确认
          selectedRoomId.value = houseIdFromUrl
          confirmPassword.value = autoPassword
          handleConfirm()
          return
        }
      } else {
        // 没有URL房间ID时，使用上次加入的房间
        targetRoomId = getLastJoinedRoom()
        console.log('🔄 使用上次加入的房间ID:', targetRoomId)
      }

      if (targetRoomId && allRooms.value.some(room => room.id === targetRoomId)) {
        selectedRoomId.value = targetRoomId

        // 找到目标房间
        const targetRoom = allRooms.value.find(room => room.id === targetRoomId)
        if (targetRoom) {
          // 设置密码并显示确认弹窗
          setRoomPassword(targetRoom)
          dialogState.value.showConfirm = true
        }
      } else if (houseIdFromUrl) {
        // 如果URL指定的房间ID在搜索结果中没有找到，记录警告但仍显示房间列表
        console.warn('⚠️ URL中指定的房间在搜索结果中未找到:', houseIdFromUrl)
      }
    }
  } catch (error) {
    console.error('加载房间列表失败:', error)
    allRooms.value = []
    showNotification({
      message: '加载房间列表失败，请检查网络连接后重试',
      type: 'error',
      icon: 'fa-solid fa-exclamation-triangle',
      duration: 4000,
    })
  } finally {
    isSearching.value = false
  }
}

// 选择房间并直接显示确认弹窗
function selectRoom(room: RoomInfo) {
  selectedRoomId.value = room.id
  setRoomPassword(room)
  dialogState.value.showConfirm = true
}

// 隐藏确认弹窗
function hideConfirmDialog() {
  dialogState.value.showConfirm = false
  confirmPassword.value = ''
}

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
  if (dialogState.value.showConfirm) {
    hideConfirmDialog()
  } else {
    emit('cancel')
  }
}

// 创建房间相关函数
function showCreateRoomDialog() {
  // 隐藏确认弹窗，避免重叠
  dialogState.value.showConfirm = false
  dialogState.value.showCreate = true
  resetCreateForm()
}

function hideCreateRoomDialog() {
  dialogState.value.showCreate = false
  isCreatingRoom.value = false
  resetCreateForm()
}

async function handleCreateRoom() {
  if (!createForm.value.name.trim() || isCreatingRoom.value) {
    return
  }

  try {
    isCreatingRoom.value = true

    const roomData: CreateRoomRequest = {
      name: createForm.value.name.trim(),
      desc: createForm.value.description?.trim() || '',
      needPwd: createForm.value.enablePassword,
      password: createForm.value.enablePassword ? createForm.value.password?.trim() || '' : '',
    }

    const response = await createRoom(roomData)

    if (response.code === '20000' && response.data) {
      const newRoomId = response.data
      const newRoom: RoomInfo = {
        id: newRoomId,
        name: roomData.name,
        description: roomData.desc || '',
        population: 1,
        needPwd: roomData.needPwd,
        ultimate: false, // 新创建的房间默认不是高级房间
      }

      // 保存密码和房间信息
      if (roomData.needPwd && roomData.password) {
        saveRoomPassword(newRoomId, roomData.password)
      }
      saveLastJoinedRoom(newRoomId)
      updateRoomInfo(newRoom)
      setCurrentPassword(roomData.needPwd ? roomData.password : undefined)

      showNotification({
        message: response.message || `房间 "${newRoom.name}" 创建成功，正在进入房间...`,
        type: 'success',
        icon: 'fa-solid fa-check-circle',
        duration: 2000,
      })

      hideCreateRoomDialog()
      emit('confirm', newRoomId, roomData.needPwd ? roomData.password : undefined)
    } else {
      showError(response.message || '创建房间失败，请重试')
    }
  } catch (error) {
    console.error('创建房间失败:', error)
    showError('创建房间失败，请检查网络连接后重试')
  } finally {
    isCreatingRoom.value = false
  }
}

// 初始化
onMounted(() => {
  loadRooms()
})
</script>

<style scoped>
/* 房间列表容器 - 隐藏滚动条 */
.room-list-container {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.room-list-container::-webkit-scrollbar {
  display: none;
}

/* 房间列表进入动画 */
.room-list-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.room-list-leave-active {
  transition: all 0.3s ease;
}

.room-list-enter-from {
  opacity: 0;
  transform: translateX(-20px) scale(0.95);
}

.room-list-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}

/* 淡入淡出动画 */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 淡入动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滑下动画 */
.slide-down-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-15px);
  max-height: 0;
  margin-bottom: 0;
}

/* 模态框内容揭示动画 */
@keyframes modal-reveal {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content-reveal {
  animation: modal-reveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* 选中房间样式 */
.selected-room {
  background: rgba(168, 85, 247, 0.15);
  border: 1px solid rgba(168, 85, 247, 0.4);
  box-shadow: 0 0 25px rgba(168, 85, 247, 0.15);
}

/* 按钮闪光扫过效果 */
@keyframes btn-shine-sweep {
  0% { left: -100%; }
  100% { left: 200%; }
}

.btn-shine::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transform: skewX(-25deg);
  animation: btn-shine-sweep 3s ease-in-out infinite;
}

/* 勾选图标弹跳动画 */
@keyframes check-bounce {
  0% { transform: scale(0) rotate(-45deg); }
  50% { transform: scale(1.3) rotate(10deg); }
  100% { transform: scale(1.1) rotate(0deg); }
}

.check-bounce {
  animation: check-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* 房间卡片悬停光效 */
.room-card {
  position: relative;
  overflow: hidden;
}

.room-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.05),
    transparent
  );
  transition: left 0.5s ease;
}

.room-card:hover::before {
  left: 100%;
}

/* 表单字段依次进入动画 */
.form-field {
  opacity: 0;
  animation: form-field-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: var(--delay, 0ms);
}

@keyframes form-field-enter {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 按钮悬浮 lift 效果 */
button:not(:disabled):hover {
  transform: translateY(-2px);
}

button:not(:disabled):active {
  transform: translateY(0) scale(0.98);
}
</style>
