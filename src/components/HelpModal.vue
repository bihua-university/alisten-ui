<template>
  <transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('close')" />
      <div
        class="relative bg-dark border border-white/20 rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden shadow-2xl"
      >
        <!-- 弹窗头部 -->
        <div class="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 class="text-xl font-semibold flex items-center">
            <i class="fa-solid fa-question-circle text-green-400 mr-2" />
            使用帮助
          </h2>
          <button
            class="text-gray-400 hover:text-white transition-colors touch-target"
            @click="$emit('close')"
          >
            <i class="fa-solid fa-times text-lg" />
          </button>
        </div>

        <!-- 弹窗内容 -->
        <div class="p-6 overflow-y-auto max-h-[70vh] smooth-scroll scrollbar-hide">
          <!-- 基本操作 -->
          <div class="mb-6">
            <h3 class="text-lg font-medium mb-3 text-primary flex items-center">
              <i class="fa-solid fa-play-circle mr-2" />
              基本操作
            </h3>
            <div class="space-y-3 text-sm">
              <div class="flex items-start">
                <i class="fa-solid fa-music text-blue-400 mr-3 mt-0.5 w-4 text-center" />
                <div>
                  <div class="font-medium mb-1">
                    点歌
                  </div>
                  <div class="text-gray-300">
                    点击右下角的"点歌台"按钮，选择音乐平台搜索你喜欢的歌曲
                  </div>
                </div>
              </div>
              <div class="flex items-start">
                <i class="fa-solid fa-forward text-orange-400 mr-3 mt-0.5 w-4 text-center" />
                <div>
                  <div class="font-medium mb-1">
                    切歌
                  </div>
                  <div class="text-gray-300">
                    点击播放控制栏的"切歌"按钮，跳过当前歌曲
                  </div>
                </div>
              </div>
              <div class="flex items-start">
                <i class="fa-solid fa-heart text-red-400 mr-3 mt-0.5 w-4 text-center" />
                <div>
                  <div class="font-medium mb-1">
                    点赞
                  </div>
                  <div class="text-gray-300">
                    点击歌曲右侧的爱心按钮，为喜欢的歌曲点赞
                  </div>
                </div>
              </div>
              <div class="flex items-start">
                <i class="fa-solid fa-share text-blue-400 mr-3 mt-0.5 w-4 text-center" />
                <div>
                  <div class="font-medium mb-1">
                    分享房间
                  </div>
                  <div class="text-gray-300">
                    点击"分享"按钮，将房间链接分享给朋友
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 聊天功能 -->
          <div class="mb-6">
            <h3 class="text-lg font-medium mb-3 text-primary flex items-center">
              <i class="fa-solid fa-comments mr-2" />
              聊天功能
            </h3>
            <div class="space-y-3 text-sm">
              <div class="flex items-start">
                <i class="fa-solid fa-comment-dots text-green-400 mr-3 mt-0.5 w-4 text-center" />
                <div>
                  <div class="font-medium mb-1">
                    发送消息
                  </div>
                  <div class="text-gray-300">
                    在右侧聊天框输入消息，与其他用户实时交流
                  </div>
                </div>
              </div>
              <div class="flex items-start">
                <i class="fa-solid fa-search text-purple-400 mr-3 mt-0.5 w-4 text-center" />
                <div>
                  <div class="font-medium mb-1">
                    点歌指令
                  </div>
                  <div class="text-gray-300">
                    在聊天中输入"点歌 [歌曲名]"，快速搜索并点歌
                  </div>
                  <div class="text-xs text-gray-400 mt-1">
                    例如：点歌 青花瓷
                  </div>
                </div>
              </div>              <div class="flex items-start">
                <i class="fa-solid fa-user-edit text-teal-400 mr-3 mt-0.5 w-4 text-center" />
                <div>
                  <div class="font-medium mb-1">
                    设置昵称
                  </div>
                  <div class="text-gray-300">
                    在聊天框中输入"设置昵称 [新昵称]"来更改你在房间中显示的名称
                  </div>
                  <div class="text-xs text-gray-400 mt-1">
                    例如：设置昵称 音乐爱好者
                  </div>
                </div>
              </div>
              <div class="flex items-start">
                <i class="fa-solid fa-user-circle text-indigo-400 mr-3 mt-0.5 w-4 text-center" />
                <div>
                  <div class="font-medium mb-1">
                    设置头像
                  </div>
                  <div class="text-gray-300">
                    使用 "昵称&lt;邮箱&gt;" 格式，系统会自动从 Gravatar 获取您的头像
                  </div>
                  <div class="text-xs text-gray-400 mt-1">
                    例如：设置昵称 音乐爱好者&lt;user@example.com&gt;
                  </div>
                  <div class="text-xs text-gray-400 mt-1">
                    💡 先在 <a href="https://gravatar.com" target="_blank" class="text-indigo-300 hover:text-indigo-200 underline">gravatar.com</a> 注册并上传头像
                  </div>
                </div>
              </div>
            </div>
          </div><!-- 快捷键 -->
          <div class="mb-6">
            <h3 class="text-lg font-medium mb-3 text-primary flex items-center">
              <i class="fa-solid fa-keyboard mr-2" />
              快捷操作
            </h3>
            <div class="space-y-3 text-sm">
              <div class="flex items-start">
                <i class="fa-solid fa-eye text-purple-400 mr-3 mt-0.5 w-4 text-center" />
                <div>
                  <div class="font-medium mb-1">
                    沉浸模式
                  </div>
                  <div class="text-gray-300">
                    点击"沉浸模式"按钮或按 F 键，专注欣赏歌词和音乐
                  </div>
                  <div class="text-xs text-gray-400 mt-1">
                    按 ESC 键或点击浮动按钮退出沉浸模式
                  </div>
                </div>
              </div>
              <div class="flex items-start">
                <i class="fa-solid fa-mobile-screen text-blue-400 mr-3 mt-0.5 w-4 text-center" />
                <div>
                  <div class="font-medium mb-1">
                    移动端
                  </div>
                  <div class="text-gray-300">
                    点击底部菜单按钮，访问聊天、用户列表等功能
                  </div>
                </div>
              </div>
              <div class="flex items-start">
                <i class="fa-solid fa-desktop text-gray-400 mr-3 mt-0.5 w-4 text-center" />
                <div>
                  <div class="font-medium mb-1">
                    桌面端
                  </div>
                  <div class="text-gray-300">
                    使用左右侧边栏，享受更完整的音乐房体验
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 注意事项 -->
          <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
            <h4 class="text-yellow-400 font-medium mb-2 flex items-center">
              <i class="fa-solid fa-exclamation-triangle mr-2" />
              注意事项
            </h4>
            <ul class="text-sm text-gray-300 space-y-1">
              <li>• 请保持良好的聊天环境，友善交流</li>
              <li>• 由于版权限制，部分歌曲可能无法播放</li>
              <li>• 建议在WiFi环境下使用，避免消耗过多流量</li>
              <li>• 房间内的所有用户会同步听到相同的音乐</li>
            </ul>
          </div>

          <!-- 性能设置 -->
          <div class="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
            <h4 class="text-white font-medium mb-3 flex items-center">
              <i class="fa-solid fa-gauge mr-2" />
              性能设置
            </h4>
            <PerformanceSettings :show-advanced="true" />
          </div>

          <!-- 版本信息 -->
          <div class="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 class="text-gray-300 font-medium mb-3 flex items-center">
              <i class="fa-solid fa-info-circle mr-2" />
              版本信息
            </h4>
            <VersionInfo />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import PerformanceSettings from './PerformanceSettings.vue'
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

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 滚动条样式 */
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* 触摸目标 */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 平滑滚动 */
.smooth-scroll {
  scroll-behavior: smooth;
}
</style>
