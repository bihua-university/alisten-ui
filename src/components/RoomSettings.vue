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

    <!-- 搜索记录设置 -->
    <div class="space-y-3 mb-4">
      <label class="block text-sm font-medium text-gray-300">搜索记录设置</label>
      <!-- 启用搜索记录 -->
      <div class="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-white/5">
        <div>
          <div class="font-medium text-white">
            启用搜索记录
          </div>
          <div class="text-sm text-gray-400">
            保存搜索历史以便快速重复搜索
          </div>
        </div>
        <label class="flex items-center cursor-pointer">
          <input
            v-model="enableSearchHistory"
            type="checkbox"
            class="sr-only"
            @change="updateSearchHistorySettings(enableSearchHistory, maxSearchHistoryCount)"
          >
          <div
            class="apple-toggle"
            :class="{ active: enableSearchHistory }"
          >
            <div class="apple-toggle-thumb" />
          </div>
        </label>
      </div>

      <!-- 搜索记录数量设置 -->
      <div
        v-if="enableSearchHistory"
        class="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-white/5"
      >
        <div>
          <div class="font-medium text-white">
            最大记录数量
          </div>
          <div class="text-sm text-gray-400">
            保存的搜索记录最大数量 (1-50)
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <input
            v-model.number="maxSearchHistoryCount"
            type="number"
            min="1"
            max="50"
            class="w-16 px-2 py-1 text-center bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-purple-500"
            @change="updateSearchHistorySettings(enableSearchHistory, maxSearchHistoryCount)"
          >
          <span class="text-sm text-gray-400">条</span>
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
import { useHistory } from '@/composables/useHistory'
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

const {
  enableSearchHistory,
  maxSearchHistoryCount,
  updateSearchHistorySettings,
} = useHistory()

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
  border: 1px solid var(--color-play-mode-border);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.play-mode-option:hover {
  border-color: var(--color-play-mode-border-hover);
  background: var(--color-play-mode-bg-hover);
}

.play-mode-option.active {
  border-color: var(--color-play-mode-border-active);
  background: var(--color-play-mode-bg-active);
}

.radio-indicator {
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--color-radio-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease;
}

.radio-indicator.active {
  border-color: var(--color-radio-active);
}

.radio-dot {
  width: 0.5rem;
  height: 0.5rem;
  background: var(--color-radio-active);
  border-radius: 50%;
}

/* Apple 风格 Toggle 开关 */
.apple-toggle {
  position: relative;
  width: 3rem;
  height: 1.75rem;
  background: var(--color-toggle-bg);
  border-radius: 0.875rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.apple-toggle:hover {
  background: var(--color-toggle-bg-hover);
}

.apple-toggle.active {
  background: var(--color-toggle-bg-active);
}

.apple-toggle.active:hover {
  background: var(--color-toggle-bg-active);
}

.apple-toggle-thumb {
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.25rem;
  height: 1.25rem;
  background: var(--color-toggle-thumb);
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px var(--color-toggle-shadow);
}

.apple-toggle.active .apple-toggle-thumb {
  transform: translateX(1.25rem);
}
</style>
