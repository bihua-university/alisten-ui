<template>
  <!-- 全屏背景装饰 -->
  <div v-if="show" class="fixed inset-0 pointer-events-none" style="z-index: 90;">
    <!-- 静态渐变背景 -->
    <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10" />

    <!-- 装饰性图标 - 覆盖整个屏幕 -->
    <div class="absolute top-20 left-1/4 text-blue-500/15 text-6xl">
      <i class="fa-solid fa-music" />
    </div>
    <div class="absolute bottom-32 right-1/4 text-purple-400/15 text-4xl">
      <i class="fa-solid fa-headphones" />
    </div>
    <div class="absolute top-1/2 left-10 text-pink-400/15 text-5xl">
      <i class="fa-solid fa-heart" />
    </div>
    <div class="absolute top-32 right-20 text-blue-400/10 text-3xl">
      <i class="fa-solid fa-compact-disc" />
    </div>
    <div class="absolute bottom-20 left-20 text-purple-300/10 text-4xl">
      <i class="fa-solid fa-microphone" />
    </div>
    <div class="absolute top-2/3 right-1/3 text-pink-300/10 text-2xl">
      <i class="fa-solid fa-musical-note" />
    </div>
  </div>

  <!-- 房间选择主弹窗 -->
  <Modal
    v-if="show" :z-index="100" size="md" title="选择房间" subtitle="选择或搜索要加入的音乐房间" header-icon="fa-solid fa-music"
    :enable-backdrop-transition="false" :allow-backdrop-close="false" @close="emit('cancel')"
  >
    <!-- 移除模态框内部的装饰 -->
    <!-- 房间搜索和选择 -->
    <div class="space-y-4">
      <!-- 搜索框和创建按钮 -->
      <div class="flex gap-3">
        <div class="relative flex-1">
          <input
            v-model="searchKeyword" type="text" placeholder="搜索房间名称..."
            class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-all"
            @input="handleSearch"
          >
          <i class="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <div v-if="isSearching" class="absolute right-3 top-1/2 transform -translate-y-1/2">
            <i class="fa-solid fa-spinner animate-spin text-blue-500" />
          </div>
        </div>
        <button
          class="bg-gradient-to-r from-blue-500 to-blue-500/80 hover:from-blue-500/90 hover:to-blue-500/70 text-white rounded-lg px-4 py-3 transition-all shadow-lg backdrop-blur-sm flex items-center gap-2 whitespace-nowrap"
          @click="showCreateRoomDialog"
        >
          <i class="fa-solid fa-plus" />
          创建房间
        </button>
      </div>

      <!-- 房间列表 -->
      <div class="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
        <div
          v-for="room in filteredRooms" :key="room.id" class="p-4 rounded-lg border transition-all cursor-pointer"
          :class="[
            selectedRoomId === room.id
              ? 'bg-blue-500/20 border-blue-500/50 shadow-lg'
              : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20',
          ]" @click="selectRoom(room)"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center mb-2">
                <span class="font-medium text-white">{{ room.name }}</span>
                <span v-if="room.needPwd" class="ml-2 text-yellow-400" title="需要密码">
                  <i class="fa-solid fa-lock text-xs" />
                </span>
              </div>
              <div class="flex items-center text-sm text-gray-300">
                <div class="flex items-center mr-4">
                  <i class="fa-solid fa-users mr-2" />
                  <span>{{ room.population }} 人</span>
                </div>
                <div class="flex items-center">
                  <i class="fa-solid fa-info-circle mr-2" />
                  <span class="truncate">{{ room.description || '暂无简介' }}</span>
                </div>
              </div>
            </div>
            <div v-if="selectedRoomId === room.id" class="text-blue-500">
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
  </Modal>

  <!-- 确认加入房间弹窗 -->
  <Modal
    v-if="dialogState.showConfirm && selectedRoom && show" :z-index="110" size="sm" title="确认加入房间"
    header-icon="fa-solid fa-music" decoration-variant="confirm" @close="handleCancel"
  >
    <!-- 房间信息卡片 -->
    <div
      class="bg-gradient-to-r from-white/15 to-white/8 rounded-lg p-4 mb-6 text-left backdrop-blur-sm border border-white/20 shadow-lg"
    >
      <div class="flex items-center mb-3">
        <i class="fa-solid fa-door-open text-blue-500 mr-2" />
        <span class="font-medium">{{ selectedRoom.name }}</span>
        <span v-if="selectedRoom.needPwd" class="ml-2 text-yellow-400" title="需要密码">
          <i class="fa-solid fa-lock text-xs" />
        </span>
      </div>
      <div class="flex items-center mb-2">
        <i class="fa-solid fa-users text-blue-500 mr-2" />
        <span class="text-sm text-gray-300">{{ selectedRoom.population }} 人在线</span>
      </div>
      <div class="flex items-center">
        <i class="fa-solid fa-info-circle text-blue-500 mr-2" />
        <span class="text-sm text-gray-300">{{ selectedRoom.description || '暂无简介' }}</span>
      </div>
    </div>

    <!-- 密码输入框 -->
    <div v-if="selectedRoom.needPwd" class="mb-6">
      <PasswordInput v-model="confirmPassword" placeholder="请输入房间密码" :show-counter="false" @enter="handleConfirm" />
    </div>

    <p class="text-sm text-gray-400 mb-6 text-center">
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
        class="flex-1 bg-gradient-to-r from-blue-500 to-blue-500/80 hover:from-blue-500/90 hover:to-blue-500/70 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-full py-3 px-4 transition-all shadow-lg backdrop-blur-sm"
        :disabled="selectedRoom.needPwd && !confirmPassword.trim()" @click="handleConfirm"
      >
        加入房间
      </button>
    </div>
  </Modal>

  <!-- 创建房间弹窗 -->
  <Modal
    v-if="dialogState.showCreate" :z-index="120" size="md" title="创建新房间" subtitle="创建属于您的音乐房间，与朋友一起享受音乐"
    header-icon="fa-solid fa-plus" theme="success" @close="hideCreateRoomDialog"
  >
    <!-- 创建房间表单 -->
    <div class="space-y-4">
      <!-- 房间名称 -->
      <div>
        <label class="block text-sm font-medium mb-2 text-gray-300">
          <i class="fa-solid fa-tag text-blue-500 mr-2" />
          房间名称 *
        </label>
        <input
          v-model="createForm.name" type="text" placeholder="请输入房间名称"
          class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-all"
          maxlength="50" @keyup.enter="handleCreateRoom"
        >
        <div class="text-xs text-gray-500 mt-1 text-right">
          {{ createForm.name.length }}/50
        </div>
      </div>

      <!-- 房间描述 -->
      <div>
        <label class="block text-sm font-medium mb-2 text-gray-300">
          <i class="fa-solid fa-info-circle text-blue-500 mr-2" />
          房间描述
        </label>
        <textarea
          v-model="createForm.description" placeholder="请输入房间描述（可选）"
          class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-all resize-none"
          rows="3" maxlength="200"
        />
        <div class="text-xs text-gray-500 mt-1 text-right">
          {{ (createForm.description || '').length }}/200
        </div>
      </div>

      <!-- 密码设置 -->
      <div>
        <div class="flex flex-row justify-between items-center mb-2">
          <label class="text-sm font-medium text-gray-300">
            <i class="fa-solid fa-lock text-blue-500 mr-2" />
            房间密码
          </label>
          <button
            type="button" class="text-xs text-blue-500 hover:text-blue-500/80 transition-colors"
            @click="createForm.enablePassword = !createForm.enablePassword"
          >
            {{ createForm.enablePassword ? '取消密码' : '设置密码' }}
          </button>
        </div>
        <div class="bg-white/5 rounded-lg p-4 border border-white/10">
          <div v-if="createForm.enablePassword" class="space-y-2">
            <PasswordInput v-model="createForm.password" placeholder="请输入房间密码" @enter="handleCreateRoom" />
          </div>
          <div v-else class="text-sm text-gray-500">
            <i class="fa-solid fa-info-circle text-blue-500 mr-2" />
            房间将对所有人开放，无需密码即可加入
          </div>
        </div>
      </div>

      <p class="text-sm text-gray-400 text-center">
        创建房间后您将成为房主，可以管理房间设置和播放列表
      </p>
    </div>

    <!-- 操作按钮 -->
    <div class="flex space-x-3 mt-6">
      <button
        class="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-full py-3 px-4 transition-all backdrop-blur-sm border border-white/10 shadow-lg"
        @click="hideCreateRoomDialog"
      >
        取消
      </button>
      <button
        class="flex-1 bg-gradient-to-r from-green-500 to-green-500/80 hover:from-green-500/90 hover:to-green-500/70 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-full py-3 px-4 transition-all shadow-lg backdrop-blur-sm flex items-center justify-center gap-2"
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
/* 自定义滚动条样式 */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: var(--color-scrollbar-thumb-primary) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-scrollbar-thumb-primary);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--color-scrollbar-thumb-primary-hover);
}
</style>
