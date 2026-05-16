# 模块协作说明

## 推荐分支

- `feature/terminal`: 终端输入、消息列表、流式打字机效果。
- `feature/archives`: 纸质资料库条目、搜索、线索交叉验证。
- `feature/fsm`: 网格移动、状态转换、步数脉冲、阻塞事件。
- `feature/ai-adapter`: 真实 LLM structured outputs 接入。
- `feature/aigc-monitor`: 现场图像生成、低饱和噪点监视器。
- `feature/qte`: 异步 QTE、失败惩罚、行动恢复。
- `feature/visual-crt`: CRT 玻璃、扫描线、音效和动效。

## 协作约定

1. `src/core` 保持纯逻辑，不直接操作 DOM。
2. `src/ui` 只读写界面，复杂规则放回 `src/core`。
3. `src/services` 先保留 mock，后续替换真实 API 时保持返回结构不变。
4. 剧情、地图、资料优先改 `src/data`，避免硬编码到 UI。
5. 每个功能分支至少能独立启动页面，不破坏 `npm run check`。

## AI 响应结构

```json
{
  "text_response": "我正在往东边走，墙上的霉斑像一张脸。",
  "fsm_command": {
    "action_state": "Navigate_to_Target",
    "target_object": "古董梳妆台",
    "target_coordinates": [2, 8],
    "modify_sanity": -2
  }
}
```
