<template>
  <div class="flex items-center space-x-2">
    <button @click="handleMuteToggle"
      :class="['transition-colors', isMuted ? 'text-gray-400' : 'text-gray-400 hover:text-white']">
      <i :class="isMuted ? 'fa-solid fa-volume-mute' : 'fa-solid fa-volume-up'"></i>
    </button>
    <div class="w-32 h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group"
      @click="handleVolumeClick"
      @mousedown="handleVolumeMouseDown"
      ref="volumeBarContainer">
      <div class="h-full bg-gray-400 rounded-full transition-all"
        :style="{ width: (isMuted ? 0 : volume) + '%' }">
        <div
          class="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Props
interface Props {
  volume: number
  isMuted: boolean
}

const props = withDefaults(defineProps<Props>(), {
  volume: 50,
  isMuted: false
})

// Emits
interface Emits {
  'update:volume': [volume: number]
  'update:isMuted': [muted: boolean]
  'volumeChange': [volume: number]
  'muteToggle': [muted: boolean]
}

const emit = defineEmits<Emits>()

// 音量条容器引用
const volumeBarContainer = ref<HTMLElement>()

// 拖拽状态
const isDraggingVolume = ref(false)

// 音量控制方法
const handleVolumeClick = (event: MouseEvent) => {
  if (!volumeBarContainer.value) return
  
  const rect = volumeBarContainer.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const newVolume = Math.max(0, Math.min(100, (clickX / rect.width) * 100))
  
  setVolumeValue(newVolume)
}

const handleVolumeMouseDown = (event: MouseEvent) => {
  event.preventDefault()
  isDraggingVolume.value = true
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingVolume.value || !volumeBarContainer.value) return
    
    const rect = volumeBarContainer.value.getBoundingClientRect()
    const x = e.clientX - rect.left
    const newVolume = Math.max(0, Math.min(100, (x / rect.width) * 100))
    
    setVolumeValue(newVolume)
  }
  
  const handleMouseUp = () => {
    isDraggingVolume.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const setVolumeValue = (newVolume: number) => {
  // 更新音量值
  emit('update:volume', newVolume)
  emit('volumeChange', newVolume)
  
  // 如果设置了音量且当前是静音状态，则取消静音
  if (newVolume > 0 && props.isMuted) {
    emit('update:isMuted', false)
    emit('muteToggle', false)
  }
}

const handleMuteToggle = () => {
  const newMutedState = !props.isMuted
  emit('update:isMuted', newMutedState)
  emit('muteToggle', newMutedState)
}
</script>

<style scoped>
/* 音量条样式已在模板中通过 Tailwind CSS 类实现 */
</style>
