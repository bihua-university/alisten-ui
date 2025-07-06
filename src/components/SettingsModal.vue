<template>
  <Modal
    title="设置"
    header-icon="fa-solid fa-cog"
    size="lg"
    theme="primary"
    @close="$emit('close')"
  >
    <div class="space-y-6">
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

interface Props {}

interface Emits {
  close: []
}

defineProps<Props>()
defineEmits<Emits>()
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
</style>
