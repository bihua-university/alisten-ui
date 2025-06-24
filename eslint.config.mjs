// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'no-console': 'off',
    'no-alert': 'off',
    'vue/block-order': ['error', {
      order: ['template', 'script', 'style'],
    }],
  },
})
