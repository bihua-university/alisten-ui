docs: 文档更新
# AGENTS.md

本文件用于指导「人类贡献者」与「AI 编程代理」在本仓库内协作时的默认行为、工程约束与常用入口。

---

# 仓库协作指南

## 项目定位

Alisten 听歌房是一个实时在线听歌房应用：多人在同一房间同步播放、点歌、聊天，并支持歌词同步与 PWA 安装。

## 技术基线

- Vue 3 + TypeScript + Vite + TailwindCSS
- 状态管理：Pinia
- 图标：Lucide Vue Next
- Node.js：建议 >= 18

---

## 项目结构（重要入口）

- 主要应用：`src/`
- 入口：`src/main.ts`、`src/App.vue`
- 主布局（桌面端 + 移动端）：`src/components/layout/MainLayout.vue`
- 组合式能力（优先扩展的位置）：`src/composables/`

  - WebSocket：`useWebSocket.ts`
  - 房间：`useRoom.ts`
  - 播放：`usePlayer.ts`
  - 歌词：`useLyrics.ts`
  - 聊天：`useChat.ts`
- 通用组件：`src/components/common/`
- 工具与配置：`src/utils/`、`src/styles/`

---

## 开发 / 构建 / 检查命令

- 安装依赖：`npm install`
- 启动开发：`npm run dev`（Vite 默认 5173；可 `npm run dev -- --port 5174`）
- 类型检查：`npm run type-check`
- 代码检查：`npm run lint`
- 自动修复：`npm run lint:fix`
- 构建：`npm run build`
- 预览构建产物：`npm run preview`

如果在 VS Code 中工作，优先使用任务面板里的“开发服务器”。

---

## UI / 样式规范（紫色强调 + Glass UI）

- 统一强调色：紫色系（优先 `purple-500` / `purple-600`），避免引入一套新的主题色体系
- 交互态（active/选中）风格参考现有 `.play-mode-option.active`、`.radio-indicator.active`
- 样式优先级：Tailwind 类名优先；只有在复杂动画/性能敏感/需要复用的场景才落到 scoped CSS 或 `src/styles/`
- 保持 Glass UI 一致性：半透明、模糊、圆角、层级阴影不要“各写各的”，尽量复用现有组件与写法

---

## 代码与模块约定

- Vue：使用 Composition API；业务逻辑优先下沉到 `src/composables/`，组件尽量保持“渲染 + 触发动作”
- TypeScript：尽量写清类型，避免 `any`；不要为了赶进度牺牲类型边界
- 命名约定：

  - 组件文件：PascalCase
  - 组合式函数：`useXxx`
- 改动策略：优先小步、可验证的提交；不要在同一 PR 混入无关重构/大面积格式化

---

## 质量门槛（建议）

只要改动涉及逻辑/类型/样式，合并前至少跑：

- `npm run type-check`
- `npm run lint`

如果改动影响构建路径（PWA、Vite 配置、路由、产物相关），再补一次：

- `npm run build`

---

## 安全与隐私

- 不要提交任何密钥、Token、真实房间密码、真实服务器地址或包含个人信息的日志
- 示例与文档使用占位符（例如 `wss://example.com`、`roomId=demo`）
- 调试日志避免打印完整 payload（尤其是用户信息、鉴权字段）

---

## Git 约定

提交信息使用简洁的 Conventional Commits 风格（与仓库现有约定一致）：

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

- 先读后改：优先定位相关组件/组合式函数/样式入口，避免“猜位置写代码”
- 变更最小化：不做无关重命名、不做大面积格式化、不改动不相关文件
- UI 变更要对齐项目规范：紫色强调、Glass UI、一致的交互态
- 不编辑生成物或依赖目录：不要改 `dist/`、不要改 `node_modules/`

---

*最后更新：2026年1月27日*
