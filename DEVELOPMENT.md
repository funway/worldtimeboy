# 开发指南

## 开发工作流

### 方法 1: Watch 模式（推荐）

1. 启动开发模式：
```bash
npm run dev
```

这会启动 Vite 的 watch 模式，当你修改代码时会自动重新构建。

2. 在 Chrome 中：
   - 打开 `chrome://extensions/`
   - 启用"开发者模式"
   - 加载 `dist` 目录
   - **启用"重新加载扩展"选项**（在扩展卡片上）

每次代码更新后，Vite 会自动重新构建，然后你只需要点击扩展卡片上的"重新加载"按钮即可。

### 方法 2: 手动重新加载

1. 修改代码后运行：
```bash
npm run build
```

2. 在 Chrome 扩展页面点击"重新加载"按钮

### 方法 3: 使用 Chrome Extension Reloader（自动化）

安装 Chrome Extension Reloader 扩展：
- 在 Chrome 网上应用店搜索 "Extension Reloader"
- 安装后配置为监听 `dist` 目录
- 每次保存文件时会自动重新加载扩展

## 调试技巧

1. **查看 Popup 控制台**：
   - 右键点击扩展图标 → "检查弹出内容"

2. **查看 Storage**：
   - 在扩展的"检查弹出内容"中打开 DevTools
   - Application → Storage → Local Storage

## 常见问题

- **修改后没有生效**：确保运行了 `npm run build` 或 `npm run dev`
- **找不到文件**：确保加载的是 `dist` 目录，不是 `src` 目录
- **样式没有更新**：清除浏览器缓存或硬刷新（Ctrl+Shift+R）
