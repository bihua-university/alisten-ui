// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'no-console': 'off',
    'no-alert': 'off',
    'vue/block-order': ['error', {
      order: ['template', 'script', 'style'],
    }],
    'vue/require-v-for-key': 'off',
    'style/brace-style': ['error', '1tbs'],
  },
  stylistic: {
    'style/brace-style': 'off',
  },
})
