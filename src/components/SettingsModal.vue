<template>
  <transition name="modal">
    <div v-if="isVisible" class="fixed inset-0 z-[60] bg-gray-900/95 backdrop-blur-md flex flex-col">
      <!-- 顶部导航栏 -->
      <div class="flex-none px-6 py-6 md:px-12 md:py-8 flex justify-between items-start md:items-center max-w-7xl w-full mx-auto">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center gap-3">
            <i class="fa-solid fa-gear text-blue-400" />
            设置
          </h1>
          <p class="text-gray-400 mt-2 text-sm md:text-base">
            调整你的个性化偏好与系统选项
          </p>
        </div>
        <div class="flex gap-4">
          <button
            class="group p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors"
            title="关闭"
            @click="handleClose"
          >
            <div class="relative w-8 h-8 flex items-center justify-center">
              <span class="absolute w-full h-0.5 bg-gray-400 rotate-45 group-hover:bg-white transition-colors" />
              <span class="absolute w-full h-0.5 bg-gray-400 -rotate-45 group-hover:bg-white transition-colors" />
            </div>
          </button>
        </div>
      </div>

      <!-- 内容滚动区 -->
      <div class="flex-1 overflow-y-auto w-full custom-scrollbar">
        <div class="max-w-3xl mx-auto px-6 pb-12 md:px-12">
          <div class="flex flex-col gap-6 md:gap-8">
            <!-- 个人资料与账户 -->
            <div class="space-y-6 md:space-y-8">
              <div class="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 hover:bg-white/[0.07] transition-colors duration-300">
                <div class="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
                  <div class="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 text-xl shadow-lg shadow-blue-500/10">
                    <i class="fa-solid fa-user-circle" />
                  </div>
                  <div>
                    <h2 class="text-xl font-bold text-white">
                      个人资料
                    </h2>
                    <p class="text-sm text-gray-400 mt-1">
                      管理你的公开信息
                    </p>
                  </div>
                </div>

                <div class="space-y-8">
                  <!-- 头像预览 -->
                  <div v-if="currentUser" class="flex items-center gap-5 p-4 bg-black/20 rounded-2xl border border-white/5">
                    <div class="relative group">
                      <img
                        :src="currentUser.avatar"
                        :alt="currentUser.name"
                        class="w-20 h-20 rounded-full border-4 border-white/10 shadow-xl group-hover:border-blue-500/30 transition-colors duration-300"
                      >
                      <div class="absolute inset-0 rounded-full ring-1 ring-inset ring-black/10" />
                    </div>
                    <div>
                      <div class="text-white font-bold text-xl mb-1">
                        {{ currentUser.name }}
                      </div>
                      <div class="text-blue-400 text-xs font-medium px-2 py-0.5 bg-blue-500/10 rounded-md inline-block">
                        当前预览
                      </div>
                    </div>
                  </div>

                  <!-- 表单 -->
                  <div class="space-y-5">
                    <div class="group">
                      <label class="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">用户名</label>
                      <div class="relative">
                        <input
                          v-model="userName"
                          type="text"
                          placeholder="请输入你的昵称"
                          class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-white placeholder-gray-500 focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300"
                          maxlength="30"
                        >
                        <i class="fa-solid fa-signature absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                      </div>
                      <p class="text-xs text-gray-500 mt-2 ml-1">
                        在聊天室和点歌列表中显示的名称
                      </p>
                    </div>

                    <div class="group">
                      <label class="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">邮箱地址</label>
                      <div class="relative">
                        <input
                          v-model="userEmail"
                          type="email"
                          placeholder="name@example.com"
                          class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-white placeholder-gray-500 focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-300"
                          :class="{ 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/10': !emailValidation.valid }"
                        >
                        <i class="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" :class="{ 'text-red-400 group-focus-within:text-red-400': !emailValidation.valid }" />
                      </div>
                      <div class="mt-2 ml-1 flex items-start gap-2">
                        <div v-if="!emailValidation.valid" class="text-xs text-red-400 flex items-center gap-1.5">
                          <i class="fa-solid fa-circle-exclamation" />
                          {{ emailValidation.message }}
                        </div>
                        <div v-else class="text-xs text-gray-500">
                          仅用于 <a href="https://gravatar.com" target="_blank" class="text-blue-400 hover:text-blue-300 underline underline-offset-2">Gravatar</a> 头像获取，保护隐私不会公开
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 系统设置 -->
            <div class="space-y-6 md:space-y-8">
              <!-- 房间与音频 -->
              <div class="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 hover:bg-white/[0.07] transition-colors duration-300">
                <div class="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
                  <div class="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 text-xl shadow-lg shadow-purple-500/10">
                    <i class="fa-solid fa-sliders" />
                  </div>
                  <div>
                    <h2 class="text-xl font-bold text-white">
                      通用设置
                    </h2>
                    <p class="text-sm text-gray-400 mt-1">
                      音频与房间偏好
                    </p>
                  </div>
                </div>

                <div class="space-y-8">
                  <!-- 音量 -->
                  <div>
                    <h3 class="text-lg font-semibold text-white mb-2">
                      音频控制
                    </h3>
                    <div class="bg-black/20 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                      <VolumeSlider />
                    </div>
                  </div>

                  <!-- 房间设置 -->
                  <div>
                    <h3 class="text-lg font-semibold text-white mb-2">
                      房间配置
                    </h3>
                    <div class="space-y-4">
                      <RoomSettings :show-advanced="true" />
                    </div>
                  </div>

                  <!-- 气泡样式选择 -->
                  <div>
                    <h3 class="text-lg font-semibold text-white mb-3">
                      聊天气泡样式
                    </h3>
                    <div class="bg-black/20 rounded-2xl p-4 border border-white/5">
                      <div class="grid grid-cols-2 gap-4">
                        <!-- 默认气泡选项 -->
                        <button
                          class="relative p-4 rounded-xl border-2 transition-all duration-300 text-left"
                          :class="bubbleStyle === 'default' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'"
                          @click="bubbleStyle = 'default'"
                        >
                          <div class="flex items-center gap-3 mb-3">
                            <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center" :class="bubbleStyle === 'default' ? 'border-purple-500' : 'border-white/30'">
                              <div v-if="bubbleStyle === 'default'" class="w-2 h-2 rounded-full bg-purple-500" />
                            </div>
                            <span class="font-medium text-white">默认</span>
                          </div>
                          <!-- 预览 -->
                          <div class="flex flex-col gap-2">
                            <div class="flex gap-2 items-start">
                              <div class="w-6 h-6 rounded-full bg-purple-500/30 shrink-0" />
                              <div class="px-3 py-2 rounded-lg text-xs" style="background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.9);">
                                你好！
                              </div>
                            </div>
                            <div class="flex gap-2 items-start flex-row-reverse">
                              <div class="w-6 h-6 rounded-full bg-indigo-500/30 shrink-0" />
                              <div class="px-3 py-2 rounded-lg text-xs text-white" style="background: linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.9));">
                                你好呀！
                              </div>
                            </div>
                          </div>
                        </button>

                        <!-- 菲比气泡选项 -->
                        <button
                          class="relative p-4 rounded-xl border-2 transition-all duration-300 text-left overflow-hidden"
                          :class="bubbleStyle === 'feibi' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'"
                          @click="bubbleStyle = 'feibi'"
                        >
                          <div class="flex items-center gap-3 mb-3">
                            <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center" :class="bubbleStyle === 'feibi' ? 'border-purple-500' : 'border-white/30'">
                              <div v-if="bubbleStyle === 'feibi'" class="w-2 h-2 rounded-full bg-purple-500" />
                            </div>
                            <span class="font-medium text-white">菲比</span>
                          </div>
                          <!-- 预览 -->
                          <div class="relative flex flex-col gap-2">
                            <div class="flex gap-2 items-start">
                              <div class="w-6 h-6 rounded-full bg-purple-500/30 shrink-0" />
                              <div class="px-3 py-2 rounded-xl text-xs bg-white text-black font-semibold" style="border-radius: 14px; box-shadow: 1px 1px 0 #3f3f3f; border-bottom-left-radius: 4px;">
                                你好！
                              </div>
                            </div>
                            <div class="flex gap-2 items-start flex-row-reverse" style="padding-bottom: 12px;">
                              <div class="w-6 h-6 rounded-full bg-indigo-500/30 shrink-0" />
                              <div class="relative">
                                <div class="relative px-3 py-2 text-xs bg-white text-black font-semibold" style="border-radius: 14px; box-shadow: 1px 1px 0 #3f3f3f; border-bottom-right-radius: 4px; z-index: 5; position: relative;">
                                  你好呀！
                                </div>
                                <img src="/feibi.png" class="absolute object-contain pointer-events-none" style="right: -25px; bottom: -20px; width: 40px; height: 40px; z-index: 0;" alt="菲比">
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 性能设置 -->
              <div class="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 hover:bg-white/[0.07] transition-colors duration-300">
                <div class="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                  <div class="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-400 text-xl shadow-lg shadow-green-500/10">
                    <i class="fa-solid fa-gauge-high" />
                  </div>
                  <div>
                    <h2 class="text-xl font-bold text-white">
                      性能与显示
                    </h2>
                    <p class="text-sm text-gray-400 mt-1">
                      优化使用体验
                    </p>
                  </div>
                </div>
                <PerformanceSettings :show-advanced="true" />
              </div>
            </div>
          </div>

          <!-- 底部 Slogan -->
          <div class="mt-12 text-center">
            <p class="text-white/20 text-sm font-medium tracking-widest uppercase">
              Designed for Music Lovers
            </p>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
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

// 内部控制显示状态以支持动画
const isVisible = ref(false)

onMounted(() => {
  // 组件挂载后触发进场动画
  isVisible.value = true
})

// 使用用户设置
const { userName, userEmail, currentUser, emailValidation, syncUserSettings, bubbleStyle } = useUserSettings()

// 关闭时保存设置
function handleClose() {
  syncUserSettings()

  // 触发离场动画
  isVisible.value = false
  // 等待动画结束后销毁 (对应 CSS transition 时间)
  setTimeout(() => {
    emit('close')
  }, 300)
}
</script>

<style scoped>
/* 模态框动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
  backdrop-filter: blur(0);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
