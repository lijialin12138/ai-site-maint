---
name: qa
description: 站点质量检查的只读入口，覆盖结构、链接、front matter、内容规范与 Skill 五段式，输出问题报告。
risk: L1
version: 1.1.0
owner: 质量保障组
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

# qa · 质量检查

> 风险等级：L1（只读，不产生任何站点改动）
> 适用角色：测试、质量保障、验收人员
> 边界：只检查与出报告，不修复、不发布、不发起外部网络请求

## 1. 触发条件（When）

- 用户要求做站点质量检查、发布前检查或整改验收。
- 用户要求检查链接、front matter、内容规范、Skill 五段式完整性。
- 用户要求输出问题清单、问题分级与责任 Skill。

以下情况不启用：

- 要求直接修复问题：按问题类型转 `content-edit`、`page-create`、`media-manage` 或人工。
- 要求执行生产构建或发布：转 `release`（L3）。
- 要求批量抓取外部网站状态码：涉及外网访问与合规风险，转人工评估。

## 2. 允许的操作范围（白名单）

| 路径 | 允许操作 | 约束 |
| --- | --- | --- |
| `.harness/reports/qa-report.md` | 新增/覆盖 | 质量检查报告 |
| 对话输出 | 输出 | 问题清单、分级、责任 Skill |

除报告外不写入任何文件；不执行 `curl`、`wget` 等外部请求。

## 3. 禁止的操作范围（黑名单）

- 禁止修改 `content/`、`data/`、`layouts/`、`assets/`、`static/`、`hugo.toml`、`tools/`、`.harness/AGENTS.md`、`.harness/skills/`。
- 禁止自动修复问题、自动删除「疑似失效」内容、自动改写链接。
- 禁止对外部站点发起批量请求或压力测试。
- 禁止访问内网地址、管理后台、带凭据的 URL。
- 禁止修改校验脚本以让结果通过。
- 需要修复时：停止，输出修复清单并指明责任 Skill。

## 4. 执行步骤（Steps）

1. 读取 `.harness/AGENTS.md`、`.harness/skills/` 清单与 `tools/ai_maint.py` 的检查项。
2. 运行 `python tools/ai_maint.py check`，记录通过/失败项。
3. 检查 front matter：每个内容文件是否有 `title`、`date`、`description`；`description` 是否在 40–120 字。
4. 检查文件名：内容文件是否符合小写短横线命名，是否有 `draft=true` 未发布稿件。
5. 检查链接：站内链接是否指向存在的页面，图片引用是否存在，菜单 `pageRef` 是否有效。
6. 检查内容规范：正文是否出现一级标题、绝对化表述、未标注的占位事实。
7. 检查 Skill：8 个核心 Skill 是否齐全，五段式标题是否完整，第 5 段是否含「不得自行发布」。
8. 生成 `.harness/reports/qa-report.md`，按阻断、重要、建议三级归类。
9. 输出结论：阻断项数量、重要项数量、建议项数量、责任 Skill。

## 5. 完成标准 + 强制校验（Verify）

### 完成标准

- 报告覆盖：结构、front matter、命名、链接、内容规范、Skill 规范六类。
- 每条问题含文件路径（链接问题含行号）、现状、等级、建议动作、责任 Skill。
- 结论明确：存在阻断项时不得给出「通过」结论。

### 强制校验

- 必跑：`python tools/ai_maint.py check`，退出码必须为 0 才能判定基线通过。
- 只读确认：除 `qa-report.md` 外无任何文件改动。
- 检查范围确认：8 个核心 Skill 名单逐一核对，不得以「数量够」代替名单核对。
- 失败处理：校验脚本自身失败时，先报告脚本错误，不得手工修改脚本绕过。

### 审核门槛

- **校验通过后必须停下等待人工审核，管理员明确确认前不得继续，不得自行发布。**
- 报告交质量负责人确认后，再按责任 Skill 安排修复并复检。