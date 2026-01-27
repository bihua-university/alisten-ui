<template>
  <div class="notification-container fixed top-6 left-1/2 -translate-x-1/2 z-[70] space-y-3 pointer-events-none">
    <NotificationToast
      v-for="notification in notifications"
      :key="notification.id"
      :show="notification.show"
      :message="notification.message"
      :type="notification.type"
      :icon="notification.icon"
    />
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '@/composables/useNotification'
import NotificationToast from './NotificationToast.vue'

// 使用通知系统
const { notifications } = useNotification()
</script>

<style scoped>
.notification-container {
  width: calc(100% - 2rem);
  max-width: 480px;
}
</style>
