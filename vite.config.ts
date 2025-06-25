import { execSync } from 'node:child_process'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// 获取 Git 信息
function getGitInfo() {
  try {
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
    const shortHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
    const commitDate = execSync('git log -1 --format=%cd --date=iso', { encoding: 'utf8' }).trim()

    return {
      commitHash,
      shortHash,
      commitDate,
      buildTime: new Date().toISOString(),
    }
  } catch (error) {
    console.warn('无法获取 Git 信息:', error)
    return {
      commitHash: 'unknown',
      shortHash: 'unknown',
      commitDate: 'unknown',
      buildTime: new Date().toISOString(),
    }
  }
}

const gitInfo = getGitInfo()

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(gitInfo),
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: '壁画音乐厅',
        short_name: '壁画音乐厅',
        description: '壁画音乐厅 - 在线音乐同步播放应用',
        theme_color: '#1f2937',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
