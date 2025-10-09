<template>
  <div
    class="desktop-top-title"
    :class="[
      additionalClasses,
      allowHeightIncrease ? 'height-increase' : 'height-fixed',
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
// 定义props，允许传入额外的CSS类和控制高度增加
interface Props {
  additionalClasses?: string
  allowHeightIncrease?: boolean
}

withDefaults(defineProps<Props>(), {
  additionalClasses: '',
  allowHeightIncrease: true,
})
</script>

<style scoped>
.desktop-top-title {
  /* 使用flex控制布局 */
  display: flex;
  align-items: flex-start; /* 小屏幕下内部元素靠左上排列 */

  /* 控制padding，匹配TopBar的p-3 sm:p-4，小屏幕增加上下padding */
  padding-left: 0.75rem; /* 相当于pl-3，匹配TopBar */
  padding-right: 0.75rem; /* 相当于pr-3，匹配TopBar */
  padding-top: 0.75rem; /* 小屏幕增加上padding 12px */
  padding-bottom: 0.75rem; /* 小屏幕增加下padding 12px */

  /* 响应式padding - 在sm及以上屏幕使用更大的值 */
  @media (min-width: 640px) {
    align-items: center; /* 大屏幕下垂直居中 */
    padding-left: 1rem; /* 相当于sm:pl-4，匹配TopBar */
    padding-right: 1rem; /* 相当于sm:pr-4，匹配TopBar */
    padding-top: 0; /* 大屏幕不需要额外的上padding */
    padding-bottom: 0; /* 大屏幕不需要额外的下padding */
  }

  /* 边框样式 */
  border-bottom: 1px solid var(--color-border-light);
}

/* 允许高度增加的样式 - 原有逻辑 */
.desktop-top-title.height-increase {
  /* 使用响应式高度匹配TopBar的padding效果 */
  /* 小屏幕计算：原高度104px + 增加24px = 128px */
  height: 8rem; /* 小屏幕：约128px，增加24px高度 */

  /* 响应式高度 - 在sm及以上屏幕使用更大的值 */
  @media (min-width: 640px) {
    height: 4.5rem; /* 大屏幕：约72px，相当于flex-row布局的高度 */
  }
}

/* 固定高度的样式 - 不随屏幕大小变化 */
.desktop-top-title.height-fixed {
  height: 4.5rem; /* 固定约72px高度 */
}
</style>
