<template>
  <transition name="modal">
    <div v-if="show" class="fixed inset-0 z-[60] bg-gray-900/95 backdrop-blur-md flex flex-col">
      <!-- 顶部导航栏 -->
      <div class="flex-none px-6 py-6 md:px-12 md:py-8 flex justify-between items-start md:items-center max-w-7xl w-full mx-auto">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-3">
            <i class="fa-solid fa-book-open text-purple-400"></i>
            使用指南
          </h1>
          <p class="text-gray-400 mt-2 text-sm md:text-base">探索听歌房的所有功能，享受最佳音乐体验</p>
        </div>
        <button
          class="group p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors"
          @click="$emit('close')"
          title="关闭"
        >
          <div class="relative w-8 h-8 flex items-center justify-center">
            <span class="absolute w-full h-0.5 bg-gray-400 rotate-45 group-hover:bg-white transition-colors"></span>
            <span class="absolute w-full h-0.5 bg-gray-400 -rotate-45 group-hover:bg-white transition-colors"></span>
          </div>
        </button>
      </div>

      <!-- 内容滚动区 -->
      <div class="flex-1 overflow-y-auto w-full custom-scrollbar">
        <div class="max-w-7xl mx-auto px-6 pb-12 md:px-12">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <!-- 1. 核心体验 -->
            <div class="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors duration-300">
              <div class="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400 text-xl">
                <i class="fa-solid fa-music"></i>
              </div>
              <h3 class="text-xl font-semibold mb-4 text-white">核心体验</h3>
              <ul class="space-y-4">
                <li class="flex items-start gap-3">
                  <i class="fa-solid fa-search text-purple-400 mt-1"></i>
                  <div>
                    <strong class="block text-gray-200 text-sm">点歌</strong>
                    <span class="text-gray-400 text-sm">点击右下角"点歌台"，支持搜索多平台音乐。或在聊天栏输入"点歌 歌曲名"。</span>
                  </div>
                </li>
                <li class="flex items-start gap-3">
                  <i class="fa-solid fa-sync text-indigo-400 mt-1"></i>
                  <div>
                    <strong class="block text-gray-200 text-sm">实时同步</strong>
                    <span class="text-gray-400 text-sm">全员听歌进度同步，歌词逐行高亮显示，带来沉浸式听歌体验。</span>
                  </div>
                </li>
              </ul>
            </div>

            <!-- 2. 播放控制 -->
            <div class="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors duration-300">
              <div class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400 text-xl">
                <i class="fa-solid fa-sliders"></i>
              </div>
              <h3 class="text-xl font-semibold mb-4 text-white">播放控制</h3>
              <ul class="space-y-4">
                <li class="flex items-start gap-3">
                  <i class="fa-solid fa-forward text-blue-400 mt-1"></i>
                  <div>
                    <strong class="block text-gray-200 text-sm">切歌</strong>
                    <span class="text-gray-400 text-sm">不想听当前歌曲？点击控制栏"切歌"按钮直接跳过。</span>
                  </div>
                </li>
                 <li class="flex items-start gap-3">
                  <i class="fa-solid fa-list text-sky-400 mt-1"></i>
                  <div>
                    <strong class="block text-gray-200 text-sm">播放列表</strong>
                    <span class="text-gray-400 text-sm">查看待播清单，支持移除自己点的歌曲。</span>
                  </div>
                </li>
              </ul>
            </div>

            <!-- 3. 社交互动 -->
            <div class="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors duration-300">
              <div class="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4 text-green-400 text-xl">
                <i class="fa-solid fa-comments"></i>
              </div>
              <h3 class="text-xl font-semibold mb-4 text-white">社交互动</h3>
              <ul class="space-y-4">
                <li class="flex items-start gap-3">
                  <i class="fa-solid fa-paper-plane text-green-400 mt-1"></i>
                  <div>
                    <strong class="block text-gray-200 text-sm">即时聊天</strong>
                    <span class="text-gray-400 text-sm">与房间内的小伙伴畅聊，分享听歌心情。</span>
                  </div>
                </li>
                <li class="flex items-start gap-3">
                  <i class="fa-solid fa-heart text-red-400 mt-1"></i>
                  <div>
                    <strong class="block text-gray-200 text-sm">点赞收藏</strong>
                    <span class="text-gray-400 text-sm">遇到喜欢的歌，点击爱心收藏，表达你的喜爱。</span>
                  </div>
                </li>
                <li class="flex items-start gap-3">
                  <i class="fa-solid fa-user-plus text-emerald-400 mt-1"></i>
                  <div>
                    <strong class="block text-gray-200 text-sm">分享邀请</strong>
                    <span class="text-gray-400 text-sm">复制房间链接，邀请好友一起加入听歌房。</span>
                  </div>
                </li>
              </ul>
            </div>

            <!-- 4. 个性化设置 -->
            <div class="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors duration-300">
              <div class="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4 text-pink-400 text-xl">
                <i class="fa-solid fa-user-cog"></i>
              </div>
              <h3 class="text-xl font-semibold mb-4 text-white">个性化设置</h3>
              <ul class="space-y-4">
                 <li class="flex items-start gap-3">
                  <i class="fa-solid fa-id-card text-pink-400 mt-1"></i>
                  <div>
                    <strong class="block text-gray-200 text-sm">个人资料</strong>
                    <span class="text-gray-400 text-sm">设置昵称，绑定邮箱以通过 Gravatar 显示个性头像。</span>
                  </div>
                </li>
                 <li class="flex items-start gap-3">
                  <i class="fa-solid fa-volume-high text-rose-400 mt-1"></i>
                  <div>
                    <strong class="block text-gray-200 text-sm">音效设置</strong>
                    <span class="text-gray-400 text-sm">调整音量，开启性能模式以适配不同设备。</span>
                  </div>
                </li>
              </ul>
            </div>

            <!-- 5. 常见问题/注意事项 -->
            <div class="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-6 hover:bg-yellow-500/10 transition-colors duration-300 md:col-span-2 lg:col-span-1">
              <div class="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-4 text-yellow-400 text-xl">
                <i class="fa-solid fa-lightbulb"></i>
              </div>
              <h3 class="text-xl font-semibold mb-4 text-white">注意事项</h3>
              <ul class="space-y-3">
                <li class="flex items-start gap-3 text-sm text-gray-300">
                  <span class="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></span>
                  请保持友善交流，共同维护良好的社区氛围。
                </li>
                <li class="flex items-start gap-3 text-sm text-gray-300">
                  <span class="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></span>
                  部分歌曲因版权限制可能无法播放，系统会自动跳过。
                </li>
                <li class="flex items-start gap-3 text-sm text-gray-300">
                  <span class="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></span>
                  推荐使用 Chrome、Edge 等现代浏览器以获得最佳体验。
                </li>
                <li class="flex items-start gap-3 text-sm text-gray-300">
                  <span class="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></span>
                  移动端建议使用 WiFi 环境。
                </li>
              </ul>
            </div>

            <!-- 6. 关于项目 -->
            <div class="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors duration-300 md:col-span-2 lg:col-span-1">
               <div class="w-12 h-12 rounded-xl bg-gray-500/20 flex items-center justify-center mb-4 text-gray-400 text-xl">
                <i class="fa-solid fa-code-branch"></i>
              </div>
              <h3 class="text-xl font-semibold mb-4 text-white">关于项目</h3>
              <div class="text-sm text-gray-300 mb-4">
                Alisten 听歌房是一个开源的实时在线音乐共享平台。
              </div>
              <VersionInfo />
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
import VersionInfo from './VersionInfo.vue'

// 定义 props
defineProps<{
  show: boolean
}>()

// 定义 emits
defineEmits<{
  close: []
}>()
</script>

<style scoped>
/* 模态框动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
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
