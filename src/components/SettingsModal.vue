<template>
  <Modal
    title="设置"
    header-icon="fa-solid fa-cog"
    size="lg"
    theme="primary"
    @close="handleClose"
  >
    <div class="space-y-6">
      <!-- 用户设置 -->
      <div class="setting-section">
        <h3 class="setting-section-title">
          <i class="fa-solid fa-user text-blue-400 mr-2" />
          用户设置
        </h3>
        <div class="setting-section-content">
          <div class="setting-item">
            <label class="setting-label">
              <span class="setting-label-text">用户名</span>
              <span class="setting-label-description mobile-hidden">用于在聊天和歌曲请求中显示</span>
            </label>
            <div class="setting-control">
              <input
                v-model="userName"
                type="text"
                placeholder="请输入用户名"
                class="setting-input"
                maxlength="30"
              >
            </div>
          </div>
          <div class="setting-item">
            <label class="setting-label">
              <span class="setting-label-text">邮箱地址</span>
              <span class="setting-label-description mobile-hidden">用于显示 Gravatar 头像（可选）</span>
            </label>
            <div class="setting-control">
              <input
                v-model="userEmail"
                type="email"
                placeholder="请输入邮箱地址"
                class="setting-input"
                :class="{ 'setting-input-error': !emailValidation.valid }"
              >
              <div v-if="!emailValidation.valid" class="setting-error-message">
                {{ emailValidation.message }}
              </div>
            </div>
          </div>
          <div v-if="currentUser" class="setting-item">
            <label class="setting-label">
              <span class="setting-label-text">预览</span>
              <span class="setting-label-description mobile-hidden">当前用户显示效果</span>
            </label>
            <div class="setting-control">
              <div class="user-preview">
                <img
                  :src="currentUser.avatar"
                  :alt="currentUser.name"
                  class="user-preview-avatar"
                >
                <span class="user-preview-name">{{ currentUser.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 音频设置 -->
      <div class="setting-section">
        <h3 class="setting-section-title">
          <i class="fa-solid fa-volume-up text-primary mr-2" />
          音频设置
        </h3>
        <div class="setting-section-content">
          <div class="setting-item">
            <label class="setting-label">
              <span class="setting-label-text">音量</span>
            </label>
            <div class="setting-control">
              <VolumeSlider />
            </div>
          </div>
        </div>
      </div>

      <!-- 房间设置 -->
      <div class="setting-section">
        <h3 class="setting-section-title">
          <i class="fa-solid fa-users text-purple-400 mr-2" />
          房间设置
        </h3>
        <div class="setting-section-content">
          <RoomSettings :show-advanced="true" />
        </div>
      </div>

      <!-- 性能设置 -->
      <div class="setting-section">
        <h3 class="setting-section-title">
          <i class="fa-solid fa-tachometer-alt text-green-400 mr-2" />
          性能设置
        </h3>
        <div class="setting-section-content">
          <PerformanceSettings :show-advanced="true" />
        </div>
      </div>

      <!-- 主题设置 -->
      <div class="setting-section">
        <h3 class="setting-section-title">
          <i class="fa-solid fa-palette text-pink-400 mr-2" />
          主题设置
        </h3>
        <div class="setting-section-content">
          <div class="theme-selector">
            <div
              class="theme-option"
              :class="{ active: userTheme === 'default' }"
              @click="handleThemeChange('default')"
            >
              <div class="theme-preview theme-preview-default">
                <div class="theme-preview-color" style="background: #1E293B" />
                <div class="theme-preview-color" style="background: #165DFF" />
                <div class="theme-preview-color" style="background: #a855f7" />
              </div>
              <div class="theme-info">
                <div class="theme-name">
                  默认深色
                </div>
                <div class="theme-description">
                  经典深色主题
                </div>
              </div>
              <div v-if="userTheme === 'default'" class="theme-check">
                <i class="fa-solid fa-check" />
              </div>
            </div>

            <div
              class="theme-option"
              :class="{ active: userTheme === 'light-pastels' }"
              @click="handleThemeChange('light-pastels')"
            >
              <div class="theme-preview theme-preview-light">
                <div class="theme-preview-color" style="background: #fce4ec" />
                <div class="theme-preview-color" style="background: #90caf9" />
                <div class="theme-preview-color" style="background: #ce93d8" />
              </div>
              <div class="theme-info">
                <div class="theme-name">
                  [实验] 浅色马卡龙
                </div>
                <div class="theme-description">
                  柔和的粉红与粉蓝
                </div>
              </div>
              <div v-if="userTheme === 'light-pastels'" class="theme-check">
                <i class="fa-solid fa-check" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/common/Modal.vue'
import PerformanceSettings from '@/components/PerformanceSettings.vue'
import RoomSettings from '@/components/RoomSettings.vue'
import VolumeSlider from '@/components/VolumeSlider.vue'
import { useUserSettings } from '@/composables/useUserSettings'

interface Props {}

interface Emits {
  close: []
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// 使用用户设置
const { userName, userEmail, currentUser, emailValidation, syncUserSettings, userTheme, applyTheme } = useUserSettings()

// 关闭时保存设置
function handleClose() {
  syncUserSettings()
  emit('close')
}

// 主题切换处理
function handleThemeChange(theme: 'default' | 'light-pastels') {
  applyTheme(theme)
}
</script>

<style scoped>
.setting-section {
  background: var(--color-setting-section-bg);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(4px);
}

.setting-section-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.setting-section-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.setting-item:hover {
  background: var(--color-setting-item-hover);
}

.setting-label {
  flex: 1;
  min-width: 0;
}

.setting-label-text {
  display: block;
  color: white;
  font-weight: 500;
}

.setting-control {
  flex-shrink: 0;
}

.setting-input {
  background: var(--color-setting-input-bg);
  border: 1px solid var(--color-setting-input-border);
  border-radius: 8px;
  padding: 8px 12px;
  color: white;
  font-size: 14px;
  transition: all 0.2s ease;
  min-width: 200px;
}

.setting-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--color-setting-input-focus-bg);
}

.setting-input::placeholder {
  color: var(--color-text-placeholder-light);
}

.setting-input-error {
  border-color: var(--color-error);
  background: var(--color-error-bg);
}

.setting-label-description {
  display: block;
  font-size: 12px;
  color: var(--color-text-description);
  font-weight: 400;
  margin-top: 2px;
}

.setting-error-message {
  font-size: 12px;
  color: var(--color-error);
  margin-top: 4px;
}

.user-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--color-setting-section-bg);
  border-radius: 8px;
  border: 1px solid var(--color-border-light);
}

.user-preview-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-preview-name {
  color: white;
  font-weight: 500;
  font-size: 14px;
}

/* 主题选择器 */
.theme-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  border: 2px solid var(--color-border-light);
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.theme-option:hover {
  border-color: var(--color-border-medium);
  background: var(--color-setting-item-hover);
}

.theme-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary-bg-light);
}

.theme-preview {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.theme-preview-color {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid var(--color-border-light);
}

.theme-info {
  flex: 1;
  min-width: 0;
}

.theme-name {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 14px;
  margin-bottom: 2px;
}

.theme-description {
  font-size: 12px;
  color: var(--color-text-description);
}

.theme-check {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  font-size: 14px;
}

/* 移动端样式 */
@media (max-width: 768px) {
  /* 在移动端隐藏说明文字，节省屏幕空间 */
  .mobile-hidden {
    display: none !important;
  }

  /* 设置项改为垂直布局，标签和控件分两行显示 */
  .setting-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  /* 输入框占满可用宽度，提升移动端使用体验 */
  .setting-input {
    min-width: unset;
    width: 100%;
  }

  /* 主题选择器移动端优化 */
  .theme-option {
    padding: 10px;
  }

  .theme-preview-color {
    width: 20px;
    height: 20px;
  }

  .theme-name {
    font-size: 13px;
  }

  .theme-description {
    font-size: 11px;
  }
}
</style>
