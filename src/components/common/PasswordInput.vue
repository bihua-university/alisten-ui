<template>
  <div class="relative">
    <input
      :value="modelValue"
      :type="showPassword ? 'text' : 'password'"
      :placeholder="placeholder"
      :maxlength="maxLength"
      class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white/15 transition-all"
      :class="inputClass"
      @input="handleInput"
      @keyup.enter="$emit('enter')"
    >
    <button
      type="button"
      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
      @click="togglePasswordVisibility"
    >
      <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" />
    </button>
  </div>

  <!-- 字符计数器 -->
  <div v-if="showCounter && maxLength" class="text-xs text-gray-500 mt-1 text-right">
    {{ (modelValue || '').length }}/{{ maxLength }}
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
  maxLength?: number
  showCounter?: boolean
  inputClass?: string
}

interface Emits {
  'update:modelValue': [value: string]
  'enter': []
}

withDefaults(defineProps<Props>(), {
  placeholder: '请输入密码',
  maxLength: 20,
  showCounter: true,
  inputClass: '',
})

const emit = defineEmits<Emits>()

const showPassword = ref(false)

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}
</script>
