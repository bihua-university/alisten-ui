<template>
  <div class="room-settings">
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-white mb-2">
        房间播放设置
      </h3>
    </div>

    <!-- 播放模式选择 -->
    <div class="space-y-3 mb-4">
      <label class="block text-sm font-medium text-gray-300">播放模式</label>
      <div class="space-y-2">
        <div
          v-for="mode in playModes"
          :key="mode.value"
          class="play-mode-option"
          :class="{ active: playMode === mode.value }"
          @click="setPlayMode(mode.value)"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-white">
                <i :class="mode.icon" class="mr-2" />
                {{ mode.name }}
              </div>
              <div class="text-sm text-gray-400">
                {{ mode.description }}
              </div>
            </div>
            <div class="radio-indicator" :class="{ active: playMode === mode.value }">
              <div v-if="playMode === mode.value" class="radio-dot" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 房间信息 -->
    <div class="bg-white/5 border border-white/10 rounded-lg p-3">
      <div class="text-sm text-gray-400 space-y-1">
        <div>当前模式: <span class="text-white">{{ getCurrentModeDescription() }}</span></div>
        <div v-if="showAdvanced">
          <details class="mt-2">
            <summary class="cursor-pointer text-blue-400 hover:text-blue-300">
              房间信息
            </summary>
            <div class="mt-2 text-xs space-y-1">
              <div>房间ID: {{ roomInfo.id }}</div>
              <div>房间名称: {{ roomInfo.name }}</div>
              <div>当前人数: {{ roomInfo.population }}</div>
              <div>需要密码: {{ roomInfo.needPwd ? '是' : '否' }}</div>
            </div>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PlayMode } from '@/types'
import { onMounted } from 'vue'
import { useRoom } from '@/composables/useRoom'
import { useUserSettings } from '@/composables/useUserSettings'

// 显示高级信息的prop
defineProps<{
  showAdvanced?: boolean
}>()

// 使用房间设置
const {
  roomInfo,
} = useRoom()

const {
  playMode,
  setPlayMode,
  pullSetting,
} = useUserSettings()

onMounted(() => {
  pullSetting()
})

// 播放模式选项
const playModes = [
  {
    value: 'sequential' as PlayMode,
    name: '顺序播放',
    description: '按照播放列表顺序依次播放',
    icon: 'fa-solid fa-list-ol',
  },
  {
    value: 'random' as PlayMode,
    name: '随机播放',
    description: '随机选择播放列表中的歌曲',
    icon: 'fa-solid fa-shuffle',
  },
]

// 获取当前模式描述
function getCurrentModeDescription() {
  const mode = playModes.find(m => m.value === playMode.value)
  return mode ? mode.name : '未知模式'
}
</script>

<style scoped>
.play-mode-option {
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.play-mode-option:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
}

.play-mode-option.active {
  border-color: rgba(147, 51, 234, 0.5);
  background: rgba(147, 51, 234, 0.1);
}

.radio-indicator {
  width: 1rem;
  height: 1rem;
  border: 2px solid #9ca3af;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease;
}

.radio-indicator.active {
  border-color: #9333ea;
}

.radio-dot {
  width: 0.5rem;
  height: 0.5rem;
  background: #9333ea;
  border-radius: 50%;
}

/* 自定义checkbox样式 */
.custom-checkbox {
  width: 1rem;
  height: 1rem;
  border: 2px solid #6b7280;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background: transparent;
}

.custom-checkbox:hover {
  border-color: #9ca3af;
}

.custom-checkbox.checked {
  background: #9333ea;
  border-color: #9333ea;
}

.check-icon {
  width: 0.75rem;
  height: 0.75rem;
  color: white;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.15s ease;
}

.custom-checkbox.checked .check-icon {
  opacity: 1;
  transform: scale(1);
}

/* 隐藏原生checkbox但保持可访问性 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
