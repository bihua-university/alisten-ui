<template>
  <div class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2 pointer-events-none">
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
