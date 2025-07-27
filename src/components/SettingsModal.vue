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
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/common/Modal.vue'
import PerformanceSettings from '@/components/PerformanceSettings.vue'
import VolumeSlider from '@/components/VolumeSlider.vue'
import { useUserSettings } from '@/composables/useUserSettings'

interface Props {}

interface Emits {
  close: []
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// 使用用户设置
const { userName, userEmail, currentUser, emailValidation, saveUserSettings } = useUserSettings()

// 关闭时保存设置
function handleClose() {
  saveUserSettings()
  emit('close')
}
</script>

<style scoped>
.setting-section {
  background: rgba(255, 255, 255, 0.05);
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
  background: rgba(255, 255, 255, 0.05);
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
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  background: rgba(255, 255, 255, 0.15);
}

.setting-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.setting-input-error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.setting-label-description {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
  margin-top: 2px;
}

.setting-error-message {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

.user-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
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

/* 移动端隐藏说明文字 */
@media (max-width: 768px) {
  .mobile-hidden {
    display: none !important;
  }
}
</style>
