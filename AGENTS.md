# AGENTS.md

本文件用于指导「人类贡献者」与「AI 编程代理」在本仓库内协作时的默认行为、工程约束与常用入口。

---

# 仓库协作指南

## 项目定位

**壁画音乐厅**（Alisten）是一个实时在线听歌房 Web 应用。多人在同一房间同步播放、点歌、聊天，并支持歌词同步与 PWA 安装。

---

## 技术基线

- **前端框架**：Lit 3.2+（Web Components）
- **开发语言**：TypeScript 5.3+
- **构建工具**：Vite 5.0+
- **CSS 框架**：TailwindCSS 3.4+
- **图标库**：`lucide`（vanilla，框架无关）
- **状态管理**：模块级 Store 类（EventTarget-based，零外部依赖）
- **工具库**：`crypto-js`
- **PWA**：`vite-plugin-pwa` + Workbox
- **Node.js 版本**：建议 >= 18（CI 使用 22.x）

---

## 项目结构（重要入口）

```
src/
├── main.ts                    # 应用入口：注册自定义元素 + 初始化性能设置
├── app-element.ts             # 根 <alisten-app> 组件
├── stores/                    # 模块级共享状态（替代原 composables）
│   ├── store-base.ts          # Store 基类 (EventTarget)
│   ├── websocket-store.ts     # WebSocket 连接、重连、消息路由
│   ├── player-store.ts        # 播放器状态、音频控制、播放列表、网络延迟同步
│   ├── chat-store.ts          # 聊天消息、在线用户列表
│   ├── room-store.ts          # 房间信息、密码管理
│   ├── lyrics-store.ts        # LRC 歌词解析、同步滚动、高亮
│   ├── search-store.ts        # 搜索/歌单结果处理
│   ├── notification-store.ts  # 全局 Toast 通知
│   ├── performance-store.ts   # 性能等级（high/medium/low/off）
│   ├── history-store.ts       # 播放历史、搜索历史（localStorage）
│   ├── user-settings-store.ts # 用户昵称、邮箱（Gravatar）、播放模式同步
│   ├── pwa-store.ts           # Service Worker 注册、更新检测
│   └── media-session-store.ts # 浏览器媒体会话控制
├── components/                # Lit 自定义元素组件
│   ├── common/
│   │   └── modal-element.ts   # 通用模态框壳
│   ├── layout/
│   │   └── main-layout-element.ts  # 主布局：桌面三栏 + 移动端三页滑动
│   ├── chat-panel-element.ts
│   ├── lyrics-panel-element.ts
│   ├── player-controls-element.ts
│   ├── playlist-panel-element.ts
│   ├── music-search-modal-element.ts
│   ├── settings-modal-element.ts
│   ├── help-modal-element.ts
│   ├── play-history-modal-element.ts
│   ├── notification-container-element.ts
│   └── notification-toast-element.ts
├── types/
│   └── index.ts               # 全局类型：Song、User、ChatMessage、RoomInfo 等
├── utils/
│   ├── config.ts              # 应用配置
│   ├── api.ts                 # HTTP API
│   ├── lrcParser.ts           # LRC 格式歌词解析器
│   ├── mobile.ts              # 移动设备检测、视口高度修复
│   ├── time.ts                # 时间格式化
│   ├── user.ts                # Gravatar 生成、用户处理
│   └── icons.ts               # lucide 图标 SVG 生成工具
└── styles/
    └── performance.css        # 四级性能模式的 CSS 覆盖规则
```

### 构建产物

- `dist/` — Vite 生产构建输出目录
- PWA 产物：`sw.js`、`workbox-*.js`、`manifest.webmanifest`

---

## 开发 / 构建 / 检查命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 代码检查并自动修复
npm run lint:fix

# 生产构建
npm run build

# 预览构建产物
npm run preview
```

**质量门槛**：只要改动涉及逻辑/类型/样式，合并前至少跑 `npm run type-check` 和 `npm run lint`。若改动影响构建路径（PWA、Vite 配置等），再补一次 `npm run build`。

---

## UI / 样式规范（深色主题 + Glass UI）

### 核心原则

所有 Lit 组件**禁用 Shadow DOM**（`createRenderRoot() { return this }`），以确保：
- TailwindCSS 全局工具类直接生效
- 全局 CSS（performance.css、style.css）无需穿透
- 移动端滚动控制机制正常工作
- 事件冒泡和 DOM 查询保持正常

### 色彩体系

**背景色**
- 主背景：`from-gray-900 to-black` 深灰到黑色的渐变背景
- 次级背景：`#121214` 近黑色（弹窗、浮层）
- 背景光晕：`purple-600/20` + `indigo-600/20` 紫罗兰/靛蓝色渐变模糊光晕

**Glass 毛玻璃效果**
- 背景：`rgba(255, 255, 255, 0.03)` 极淡白色半透明
- 模糊：`backdrop-filter: blur(20px)`
- 边框：`rgba(255, 255, 255, 0.05)` 极淡白色边框
- 阴影：`0 8px 32px 0 rgba(0, 0, 0, 0.36)`

**强调色**
- 核心紫色：`purple-600` / `purple-500` 主按钮、关键操作
- 靛蓝色：`indigo-500` / `indigo-400` 图标、次级强调

**文字色**
- 主文字：`text-white` 纯白
- 次级文字：`text-white/60` 60% 透明度白
- 辅助文字：`text-white/40` 40% 透明度白

### 圆角规范
- 大卡片：`rounded-3xl` (1.5rem)
- 中等卡片/按钮：`rounded-2xl` (1rem)
- 小元素/输入框：`rounded-xl` (0.75rem)

### 交互规范
- 悬浮：`hover:bg-white/10` 背景提亮
- 按下：`active:scale-95` 轻微缩小
- 过渡：`transition-colors` 颜色过渡

---

## 代码与模块约定

### Lit / Web Components
- **禁用 Shadow DOM**：所有组件重写 `createRenderRoot() { return this }`
- 使用 `@state()` 声明内部状态，`@property()` 声明外部属性
- 使用 `html` / `classMap` / `styleMap` / `unsafeSVG` 等 directives
- 事件处理使用 Lit 的 `@click` 等绑定语法
- 在 `connectedCallback()` 中订阅 Store，在 `disconnectedCallback()` 中取消订阅

### 状态管理（Store 模式）
- 所有全局状态通过 `src/stores/` 中的 Store 类管理
- Store 基类继承 `EventTarget`，通过 `dispatchEvent('change')` 通知订阅者
- 组件通过 `store.addEventListener('change', ...)` 订阅更新
- 避免在组件间直接传递复杂状态

### TypeScript
- 严格模式：`strict: true`、`noUnusedLocals: true`、`noUnusedParameters: true`
- 路径别名：`@/` 映射到 `src/`
- 装饰器配置：`experimentalDecorators: true`、`useDefineForClassFields: false`

### 命名约定
- 组件文件：kebab-case（如 `chat-panel-element.ts`）
- 自定义元素标签名：`alisten-` 前缀（如 `<alisten-chat-panel>`）
- 组合式函数/Store：`useXxx` / `XxxStore`（如 `playerStore`）
- 工具函数：camelCase

---

## WebSocket 通信架构

WebSocket 服务器地址通过环境变量 `VITE_WS_URL` 配置。

### 连接方式
- 连接 URL 格式：`${wsUrl}/server?houseId=${roomId}&housePwd=${password}`
- 自动重连：最多 5 次，间隔 3 秒
- 心跳间隔：30 秒

### 消息路由机制
`websocketStore.registerMessageHandler(type, handler)` 实现按消息类型分发。

### 主要 action 指令
- `/music/pick`、`/music/skip/vote`、`/music/sync`、`/music/good`、`/music/delete`
- `/chat`、`/house/houseuser`、`/setting/pull`、`/setting/user`、`/music/playmode`

---

## 播放器同步机制

- `pushTime`：服务器推送歌曲时的 Unix 时间戳（毫秒）
- `networkDelay`：通过 WebSocket `delay` 消息获取的网络延迟
- 客户端计算播放位置：`Date.now() - pushTime - networkDelay`
- 进度更新：使用 `requestAnimationFrame` + `audio.timeupdate` 双循环

---

## 移动端适配策略

- **设备检测**：`navigator.userAgent` + 屏幕宽度 <= 768px
- **视口高度修复**：通过 CSS 变量 `--vh` 动态设置
- **滚动控制**：全局阻止 `body` / `html` 滚动，仅允许特定容器滚动
- **三页滑动**：`MainLayout` 使用三页横向滑动容器（Player / Playlist / Chat）
- **返回键处理**：`AppElement` 维护 modal 堆栈，拦截 `popstate`

---

## 性能优化体系

### 四级性能模式
`performanceStore` 管理四级性能设置，通过 `document.body` 上的 class 控制全局样式：

| 级别 | 行为 |
|------|------|
| `high` | 所有动画、backdrop-blur、背景脉动全开 |
| `medium` | 平衡设置，移动端自动附加 `mobile-performance` 类 |
| `low` | 简化动画、降低模糊强度、禁用背景动画 |
| `off` | 极简模式：禁用所有动画/模糊/阴影/渐变 |

---

## PWA 配置

- `vite-plugin-pwa` 在 `vite.config.ts` 中配置
- Service Worker 策略：预缓存 + 运行时缓存 Google Fonts
- 更新检测：每 30 分钟检查一次（仅页面可见时）

---

## 环境变量

| 变量 | 说明 |
|------|------|
| `VITE_WS_URL` | WebSocket 服务器地址 |
| `VITE_API_URL` | REST API 基础地址 |
| `VITE_APP_NAME` | 应用显示名称 |

---

## Git 约定

提交信息使用简洁的 Conventional Commits 风格：
```
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 样式调整
refactor: 代码重构
perf: 性能优化
```

---

## AI 代理工作方式（默认行为）

- **先读后改**：优先定位相关组件/Store/样式入口
- **变更最小化**：不做无关重命名、不做大面积格式化
- **UI 变更要对齐项目规范**：紫色强调、Glass UI、一致的交互态
- **不编辑生成物或依赖目录**：不要改 `dist/`、不要改 `node_modules/`
- **状态管理注意**：全局状态分布在各 Store 中，修改时注意是否影响其他组件
- **性能敏感**：新增动画/效果时，考虑在 `performance.css` 中添加对应级别的降级规则
- **移动端优先**：任何 UI 改动需同时考虑桌面端和移动端体验

---

*最后更新：2026年4月25日*
