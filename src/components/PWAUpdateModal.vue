<template>
  <div v-if="showUpdateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 mx-4 max-w-md w-full shadow-xl">
      <div class="flex items-center mb-4">
        <svg class="w-6 h-6 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-900">
          应用更新
        </h3>
      </div>

      <p class="text-gray-600 mb-6">
        发现新版本，是否立即更新以获得最新功能和体验？
      </p>

      <div class="flex space-x-3">
        <button
          :disabled="isUpdating"
          class="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          @click="updateApp"
        >
          <span v-if="!isUpdating">立即更新</span>
          <span v-else class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            更新中...
          </span>
        </button>

        <button
          :disabled="isUpdating"
          class="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          @click="dismissUpdate"
        >
          稍后提醒
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  showUpdateModal: boolean
}>()

const emit = defineEmits<{
  updateApp: []
  dismissUpdate: []
}>()

const isUpdating = ref(false)

function updateApp() {
  isUpdating.value = true
  emit('updateApp')
}

function dismissUpdate() {
  emit('dismissUpdate')
}
</script>
