<template>
  <transition name="modal">
    <div v-if="isVisible" class="fixed inset-0 z-[60] bg-gray-900/95 backdrop-blur-md flex flex-col">
      <!-- 顶部导航栏 -->
      <div class="flex-none px-6 py-6 md:px-12 md:py-8 flex justify-between items-start md:items-center max-w-7xl w-full mx-auto">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center gap-3">
            <i class="fa-solid fa-gear text-blue-400"></i>
            设置
          </h1>
          <p class="text-gray-400 mt-2 text-sm md:text-base">调整你的个性化偏好与系统选项</p>
        </div>
        <div class="flex gap-4">
             <button
              class="group p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors"
              @click="handleClose"
              title="关闭"
            >
            <div class="relative w-8 h-8 flex items-center justify-center">
                <span class="absolute w-full h-0.5 bg-gray-400 rotate-45 group-hover:bg-white transition-colors"></span>
                <span class="absolute w-full h-0.5 bg-gray-400 -rotate-45 group-hover:bg-white transition-colors"></span>
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
                    <i class="fa-solid fa-user-circle"></i>
                  </div>
                  <div>
                    <h2 class="text-xl font-bold text-white">个人资料</h2>
                    <p class="text-sm text-gray-400 mt-1">管理你的公开信息</p>
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
                      <div class="absolute inset-0 rounded-full ring-1 ring-inset ring-black/10"></div>
                    </div>
                    <div>
                      <div class="text-white font-bold text-xl mb-1">{{ currentUser.name }}</div>
                      <div class="text-blue-400 text-xs font-medium px-2 py-0.5 bg-blue-500/10 rounded-md inline-block">当前预览</div>
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
                        <i class="fa-solid fa-signature absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors"></i>
                      </div>
                      <p class="text-xs text-gray-500 mt-2 ml-1">在聊天室和点歌列表中显示的名称</p>
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
                         <i class="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" :class="{ 'text-red-400 group-focus-within:text-red-400': !emailValidation.valid }"></i>
                       </div>
                      <div class="mt-2 ml-1 flex items-start gap-2">
                        <div v-if="!emailValidation.valid" class="text-xs text-red-400 flex items-center gap-1.5">
                           <i class="fa-solid fa-circle-exclamation"></i>
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
                    <i class="fa-solid fa-sliders"></i>
                  </div>
                  <div>
                    <h2 class="text-xl font-bold text-white">通用设置</h2>
                    <p class="text-sm text-gray-400 mt-1">音频与房间偏好</p>
                  </div>
                </div>

                <div class="space-y-8">
                   <!-- 音量 -->
                  <div>
                    <h3 class="text-lg font-semibold text-white mb-2">
        音频控制
      </h3>
                    <div class="bg-black/20 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                      <div class="flex items-center gap-4">
                        <div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                           <i class="fa-solid fa-volume-high text-sm"></i>
                        </div>
                        <div class="flex-1">
                          <VolumeSlider />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 房间设置 -->
                  <div>
                      <h3 class="text-lg font-semibold text-white mb-2">房间配置</h3>
                     <div class="space-y-4">
                        <RoomSettings :show-advanced="true" />
                     </div>
                  </div>
                </div>
              </div>

              <!-- 性能设置 -->
               <div class="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 hover:bg-white/[0.07] transition-colors duration-300">
                <div class="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                  <div class="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-400 text-xl shadow-lg shadow-green-500/10">
                    <i class="fa-solid fa-gauge-high"></i>
                  </div>
                  <div>
                    <h2 class="text-xl font-bold text-white">性能与显示</h2>
                    <p class="text-sm text-gray-400 mt-1">优化使用体验</p>
                  </div>
                </div>
                <PerformanceSettings :show-advanced="true" />
              </div>

            </div>
          </div>

                    <!-- 底部 Slogan -->
          <div class="mt-12 text-center">
            <p class="text-white/20 text-sm font-medium tracking-widest uppercase">Designed for Music Lovers</p>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PerformanceSettings from '@/components/PerformanceSettings.vue'
import RoomSettings from '@/components/RoomSettings.vue'
import VolumeSlider from '@/components/VolumeSlider.vue'
import { useUserSettings } from '@/composables/useUserSettings'

interface Props {}

interface Emits {
  close: []
  'settings-changed': []
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
const { userName, userEmail, currentUser, emailValidation, syncUserSettings } = useUserSettings()

// 关闭时保存设置
function handleClose() {
  syncUserSettings()
  emit('settings-changed') // 通知父组件可能有变动
  
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
