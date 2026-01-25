# 🎵 Alisten 听歌房

> 一个现代化的在线听歌房应用，基于 Vue3 + TypeScript + Vite + TailwindCSS 构建。

---

## 📋 项目概述

Alisten 听歌房是一个实时在线音乐共享平台，允许多人同时在一个虚拟房间中共同听歌、点歌和聊天。项目采用现代化的 Glass UI 设计风格，支持桌面端和移动端的响应式布局。

### 核心功能

- 🎵 **实时音乐同步** - 房间内所有用户同步播放相同的音乐
- 📝 **歌词同步显示** - 逐行高亮显示当前播放歌词
- 💬 **实时聊天** - 房间内用户可以实时交流
- 🎤 **点歌功能** - 支持搜索和点播歌曲
- 👥 **在线用户** - 查看当前房间在线用户列表
- 📱 **跨平台支持** - 桌面端和移动端完整体验
- 🔔 **PWA 支持** - 可安装为本地应用

---

## 🏗️ 技术架构

### 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3.4+ (Composition API) |
| 开发语言 | TypeScript 5.3+ |
| 构建工具 | Vite 5.0+ |
| CSS 框架 | TailwindCSS 3.4+ |
| 图标库 | Lucide Vue Next |
| 状态管理 | Pinia |
| 工具库 | VueUse |
| PWA | Vite Plugin PWA + Workbox |

### 项目结构

```
src/
├── components/           # 组件目录
│   ├── layout/          # 布局组件
│   │   └── MainLayout.vue    # 主布局（桌面端+移动端）
│   ├── common/          # 通用组件
│   │   ├── Avatar.vue        # 用户头像
│   │   ├── Modal.vue         # 模态框基础组件
│   │   ├── MusicItem.vue     # 音乐项组件
│   │   └── ...
│   ├── MusicSearchModal.vue  # 点歌台模态框
│   ├── SettingsModal.vue     # 设置模态框
│   ├── HelpModal.vue         # 帮助模态框
│   ├── PlayHistoryModal.vue  # 播放历史模态框
│   ├── PlaylistItem.vue      # 播放列表项
│   ├── VolumeSlider.vue      # 音量控制滑块
│   ├── ImmersiveMode.vue     # 沉浸模式
│   └── ...
├── composables/         # 组合式函数
│   ├── useWebSocket.ts      # WebSocket 连接管理
│   ├── usePlayer.ts         # 播放器控制
│   ├── useLyrics.ts         # 歌词同步
│   ├── useChat.ts           # 聊天功能
│   ├── useRoom.ts           # 房间管理
│   ├── useSearch.ts         # 搜索功能
│   ├── useHistory.ts        # 播放历史
│   ├── useUserSettings.ts   # 用户设置
│   ├── useNotification.ts   # 通知系统
│   ├── useMediaSession.ts   # 媒体会话控制
│   ├── usePWA.ts            # PWA 功能
│   ├── useKeyboardShortcuts.ts  # 键盘快捷键
│   ├── useBackButton.ts     # 返回键处理
│   └── usePerformance.ts    # 性能优化
├── types/               # TypeScript 类型定义
│   └── index.ts
├── utils/               # 工具函数
│   ├── api.ts               # API 请求封装
│   ├── config.ts            # 配置管理
│   ├── lrcParser.ts         # 歌词解析
│   ├── mobile.ts            # 移动端工具
│   ├── time.ts              # 时间格式化
│   └── user.ts              # 用户处理
├── styles/              # 样式文件
├── App.vue              # 根组件
├── main.ts              # 入口文件
└── style.css            # 全局样式
```

---

## 🎨 UI 设计规范

### 设计风格

- **Glass UI** - 毛玻璃效果和半透明背景
- **圆角设计** - 大圆角卡片和按钮
- **渐变色彩** - 紫色/靛蓝色渐变作为强调色
- **深色主题** - 深灰到黑色的背景渐变

### 配色方案

| 用途 | 颜色 |
|------|------|
| 主强调色 | Purple (`purple-500`, `purple-600`) |
| 次强调色 | Indigo (`indigo-400`, `indigo-500`) |
| 背景色 | Gray-900 → Black 渐变 |
| 玻璃效果 | 5% 白色背景 + 20px 模糊 |
| 文字主色 | White |
| 文字次色 | White/60, White/40 |

### 响应式布局

**桌面端 (md+)**
- 双栏布局：左侧歌词 + 右侧可切换面板
- 右侧面板宽度：560px
- 播放控制栏在歌词区下方

**移动端**
- 三面板滑动布局（播放/列表/聊天）
- 底部浮动导航栏（圆角胶囊设计）
- 触摸优化的交互元素

---

## 📦 核心模块说明

### 1. WebSocket 通信 (`useWebSocket`)
处理与服务器的实时通信，包括：
- 连接建立和断线重连
- 消息收发
- 心跳保活

### 2. 播放器控制 (`usePlayer`)
管理音频播放状态：
- 播放/暂停控制
- 进度管理
- 播放列表管理
- 切歌功能

### 3. 歌词同步 (`useLyrics`)
实现歌词与音乐的同步：
- LRC 歌词解析
- 当前行高亮
- 自动滚动定位

### 4. 聊天功能 (`useChat`)
房间内实时聊天：
- 消息收发
- 在线用户列表
- 消息时间显示

### 5. 搜索功能 (`useSearch`)
歌曲搜索和点歌：
- 关键词搜索
- 歌单搜索
- 添加到播放列表

---

## ✅ TODO 列表

### 高优先级
- [ ] 主题切换（明/暗主题）
- [ ] UI 一致性

### 中优先级
- [ ] 移动端手势优化（滑动惯性效果）
- [ ] 音频可视化效果

### 低优先级
- [ ] 多语言国际化支持
- [ ] 自定义主题色彩
- [ ] 歌词字体大小调整
- [ ] 播放历史导出

### 已完成 ✓
- [x] Glass UI 风格重构
- [x] 桌面端双栏布局
- [x] 移动端滑动面板
- [x] 底部浮动导航栏
- [x] 在线用户弹窗
- [x] 音量控制弹窗
- [x] 操作按钮统一布局
- [x] 移动端切歌按钮
- [x] 房间创建和管理

---

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 代码检查
```bash
npm run lint
npm run lint:fix
```

### 类型检查
```bash
npm run type-check
```

---

## 📝 开发规范

### 代码风格
- 使用 ESLint + @antfu/eslint-config
- 提交前自动 lint (husky + lint-staged)

### 组件命名
- 组件文件使用 PascalCase
- 组合式函数使用 `use` 前缀

### 样式规范
- 优先使用 TailwindCSS 类名
- 复杂样式使用 scoped CSS
- 强调色统一使用紫色系

### Git 提交规范
```
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 样式调整
refactor: 代码重构
perf: 性能优化
```

---

## 📄 许可证

MIT License

---

*最后更新：2026年1月26日*
