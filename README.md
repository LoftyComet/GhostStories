# 鬼宅事务所 Web Demo

这是一个用于展示 git 协作与 vibecoding 的沉浸式鬼故事小游戏前端框架。当前版本采用无依赖的 vanilla Web 技术，便于直接拆模块、建分支、演示增量提交。

## 运行

```bash
npm run dev
```

然后打开：

```text
http://localhost:5173
```

## 模块分工建议

| 模块 | 目录 | 适合负责人 |
| --- | --- | --- |
| 终端对话与打字机渲染 | `src/ui/terminal.js` | 前端交互 |
| 资料库内容与弹窗 | `src/data/archives.js`, `src/ui/archives.js` | 剧情/资料 |
| 鬼宅地图与实体配置 | `src/data/mansion.js`, `assets/mansion-map.svg` | 关卡设计 |
| FSM 行动逻辑 | `src/core/fsm.js` | 游戏逻辑 |
| 状态管理与事件广播 | `src/core/store.js`, `src/core/state.js` | 架构 |
| AI 接口适配 | `src/services/aiClient.js` | AI/后端 |
| 图像涌现流 | `src/services/imageClient.js`, `src/ui/monitor.js` | AIGC/视觉 |
| QTE 与资源管理 | `src/ui/qte.js`, `src/ui/hud.js` | 玩法系统 |
| CRT 视觉风格 | `src/styles/*` | UI/视觉 |

## Demo 指令

- `去检查古董梳妆台`
- `去厨房找钥匙`
- `打开配电箱`
- `冷静，播放安抚音频`

## 目录结构

```text
assets/                 静态视觉资产
docs/                   协作说明
src/core/               纯游戏逻辑与状态
src/data/               可配置剧情、地图、资料
src/services/           AI/STT/AIGC 等外部服务适配
src/ui/                 DOM 视图层
src/styles/             页面和 CRT 视觉
```
