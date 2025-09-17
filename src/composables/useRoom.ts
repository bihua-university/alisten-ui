import type { RoomInfo } from '@/types'
import { ref } from 'vue'

// 房间信息状态
const roomInfo = ref<RoomInfo>({
  id: '733dbb38-31d0-419c-9019-5c12777246c8',
  name: '听歌房',
  description: '欢迎来到听歌房！',
  population: 0,
  needPwd: true,
  ultimate: false,
})

// 当前房间密码
let currentPassword: string | undefined

export function useRoom() {
  // 更新房间信息
  function updateRoomInfo(newInfo: Partial<RoomInfo>) {
    roomInfo.value = { ...roomInfo.value, ...newInfo }
  }

  // 设置房间ID
  function setRoomId(id: string) {
    roomInfo.value.id = id
  }

  // 设置房间名称
  function setRoomName(name: string) {
    roomInfo.value.name = name
  }

  // 重置房间信息
  function resetRoomInfo() {
    roomInfo.value = {
      id: 'room_001',
      name: '听歌房',
      description: '欢迎来到听歌房！',
      population: 0,
      needPwd: true,
      ultimate: false,
    }
  }

  // 设置当前房间密码
  function setCurrentPassword(password?: string) {
    currentPassword = password
  }

  // 获取当前房间密码
  function getCurrentPassword(): string | undefined {
    return currentPassword
  }

  // 清除当前房间密码
  function clearCurrentPassword() {
    currentPassword = undefined
  }

  return {
    roomInfo,
    updateRoomInfo,
    setRoomId,
    setRoomName,
    resetRoomInfo,
    setCurrentPassword,
    getCurrentPassword,
    clearCurrentPassword,
  }
}
