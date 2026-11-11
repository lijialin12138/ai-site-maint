---
name: theme-change
description: 调整站点版面、主题、配色与导航结构的高风险流程，只输出方案与影响面，不执行任何改动。
risk: L3
version: 1.1.0
owner: 前端负责人
allowed-paths:
  - .harness/reports/
denied-paths:
  - content/
  - data/
  - layouts/
  - assets/
  - static/
  - hugo.toml
  - tools/
  - .harness/AGENTS.md
  - .harness/skills/
required-checks:
  - python tools/ai_maint.py check
---

# theme-change · 版面与主题调整（L3）

> 风险等级：L3（高风险：只出方案，不执行）
> 适用角色：前端负责人、设计负责人
> 硬约束：AI 不得修改模板、样式、配置，不得执行构建

## 1. 触发条件（When）

- 用户要求调整页面版式、栏栅、配色、字体、圆角、间距等视觉样式。
- 用户要求更换主题、增加页面区块或调整导航与页脚结构。
- 用户要求评估一次版面改版的影响面与回滚方案。

以下情况不启用：

- 只改文字内容：使用 `content-edit`。
- 只换图片素材：使用 `media-manage`。
- 生产发布：使用 `release`。
- 涉及品牌名、Logo、slogan 的视觉调整：先按品牌锁定红线上报，再走本流程。

## 2. 允许的操作范围（白名单）

| 路径 | 允许操作 | 约束 |
| --- | --- | --- |
| `.harness/reports/theme-plan-<日期>.md` | 新增 | 改版方案、影响面、回滚步骤 |
| 对话输出 | 输出 | 方案摘要、风险清单 |

只允许写方案文档，不得写入 `layouts/`、`assets/`、`static/`、`hugo.toml` 或任何站点源文件。

## 3. 禁止的操作范围（黑名单）

- 禁止修改 `layouts/`、`assets/`、`static/`、`hugo.toml`、`content/`、`data/`、`tools/`、`.harness/AGENTS.md`、`.harness/skills/`。
- 禁止执行 `hugo`、`hugo --minify`、`hugo server` 等构建或预览命令。
- 禁止修改品牌锁定字段与品牌视觉规范。
- 禁止在方案中写入未确认的第三方字体、图标库或外部 CDN 依赖。
- 禁止在未经管理员确认前把方案标记为「已实施」。
- 禁止删除页面、导航项或页脚信息来「简化改版」。
- 需要突破任一条：停止，转 `rule-exception`。

## 4. 执行步骤（Steps）

1. 读取 `.harness/AGENTS.md` 与现有 `layouts/`、`assets/css/main.css`，记录当前结构。
2. 运行 `python tools/ai_maint.py check`，记录基线结果。
3. 明确改版目标与范围：页面、组件、断点、交互，不接受「整体优化」这类模糊描述。
4. 输出影响面：受影响页面、导航、SEO、可访问性、品牌一致性、移动端表现。
5. 输出改版方案：文件清单、改动类型、关键样式变更、依赖变化。
6. 输出回滚方案：触发条件、恢复步骤、验证方式、责任人。
7. 标注风险等级、实施窗口、需确认的管理员。
8. 写入 `.harness/reports/theme-plan-<日期>.md`，等待管理员书面确认。
9. 确认后由人工执行改动，AI 不代为修改；执行完成后人工回填结果。

## 5. 完成标准 + 强制校验（Verify）

### 完成标准

- 方案文档包含：现状、目标、范围、文件清单、影响面、回滚方案、风险、窗口，八项齐全。
- 方案明确「AI 不执行改动」，所有命令标注「由人工执行」。
- 站点源文件零改动，工作区除方案文档外无变化。

### 强制校验

- 前置基线：`python tools/ai_maint.py check` 退出码 0，结果附在方案中。
- 只读确认：`git status` 不得出现方案文档之外的改动。
- 边界确认：方案中不得出现已执行的构建或部署命令。
- 失败处理：基线校验失败即中止方案，不给出改版建议。

### 审核门槛

- **校验通过后必须停下等待人工审核，管理员明确确认前不得继续，不得自行发布。**
- 管理员书面确认后，由人工实施；AI 只做方案复核，不直接改代码。