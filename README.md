# Vue3 + TypeScript 音乐共享空间

一个基于 Vue3 + TypeScript + Vite + TailwindCSS 构建的现代化音乐共享应用。

## 项目特性

- 🎵 **现代化UI**：使用 TailwindCSS 构建响应式界面
- 🔧 **Vue3 + TypeScript**：完整的类型安全开发体验
- ⚡ **Vite构建**：快速的开发和构建工具
- 📱 **响应式设计**：支持桌面端和移动端
- 🎭 **组合式API**：使用 Vue3 Composition API
- 🎨 **现代化设计**：玻璃拟态效果和流畅动画

## 功能模块

- **音乐播放器**：
- **播放列表**：歌曲管理
- **歌词同步**：实时歌词显示
- **聊天功能**：实时聊天交流
- **用户管理**：在线用户列表
- **点歌台**：
- **移动端适配**：完整的移动端体验

## 技术栈

- **前端框架**：Vue 3.4+
- **开发语言**：TypeScript 5.3+
- **构建工具**：Vite 5.0+
- **CSS框架**：TailwindCSS 3.4+
- **图标库**：Font Awesome 6.7+
- **字体**：Inter

## 快速开始

### 方式一：使用启动脚本（推荐）

#### Windows用户
```bash
# 双击运行 start.bat 文件
start.bat
```

#### Linux/Mac用户
```bash
# 运行启动脚本
chmod +x start.sh
./start.sh
```

### 方式二：手动安装

1. **安装依赖**
```bash
npm install
```

2. **启动开发服务器**
```bash
npm run dev
```

3. **构建生产版本**
```bash
npm run build
```

4. **预览生产构建**
```bash
npm run preview
```

5. **类型检查**
```bash
npm run type-check
```

## 开发说明

### 类型定义

项目使用 TypeScript 提供完整的类型安全，主要类型定义在 `src/types/index.ts`：

- `Song`: 歌曲信息接口
- `User`: 用户信息接口  
- `ChatMessage`: 聊天消息接口
- `RoomInfo`: 房间信息接口
- `LyricLine`: 歌词行接口

### 组合式函数

使用 Vue3 Composition API 将业务逻辑模块化：

- `usePlayer`: 播放器控制逻辑
- `useChat`: 聊天功能逻辑
- `useLyrics`: 歌词同步逻辑
- `useSongQueue`: 点歌队列逻辑

### 响应式设计

使用 TailwindCSS 实现响应式设计：
- 桌面端：完整的三栏布局
- 移动端：模态框形式的交互界面

## 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 开发环境要求

- Node.js 18+
- npm 9+ 或 yarn 1.22+

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 更新日志

### v1.0.0 (2024-06-22)
- 🎉 项目初始化
- ✨ 完整的 Vue3 + TypeScript 重构
- 🎨 现代化 UI 设计
- 📱 响应式移动端适配
- 🔧 完整的开发工具链配置
