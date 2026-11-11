---
name: skill-name
description: 一句话说明该 Skill 解决什么问题、适用于什么场景
risk: L2
version: 1.1.0
owner: 待填写
# 注意：allowed-paths 必须按本 Skill 实际职责填写，不要照抄 content/。
# 例如 media-manage 需加 static/images/、assets/images/；release 需加 .harness/reports/。
allowed-paths:
  - content/
denied-paths:
  - layouts/
  - hugo.toml
  - .harness/AGENTS.md
  - .harness/SKILL_TEMPLATE.md
  - .harness/skills/
required-checks:
  - python tools/ai_maint.py check
---

# Skill 名称

> 风险等级：L2（受控改动）
> 适用角色：内容运营 / 前端工程师 / 发布管理员（按实际填写）
> 适用范围：仅限本仓库的云际科技企业站点

## 1. 触发条件（When）

- 当用户提出「……」类请求时启用。
- 当用户提出「……」类请求时启用。
- 以下情况不启用：……

## 2. 允许的操作范围（白名单）

| 路径/对象 | 允许操作 | 说明 |
| --- | --- | --- |
| `content/` | 修改 | 仅限已有页面文案 |
| `.harness/reports/` | 新增 | 校验与变更记录 |

## 3. 禁止的操作范围（黑名单）

- 禁止改动：`layouts/`、`hugo.toml`、`assets/`、`tools/`、`.harness/AGENTS.md`、`.harness/skills/`。
- 禁止行为：删除页面、改写品牌信息、对外承诺未经验证的指标、绕过校验直接交付。
- 遇到黑名单需求时：停止执行，按 `rule-exception` Skill 提交例外申请。

## 4. 执行步骤（Steps）

1. 阅读 `.harness/AGENTS.md` 与本文件，确认风险等级与白名单。
2. 读取目标文件与相邻文件，确认现有结构与写作风格。
3. 用最小改动完成修改，不重构无关内容。
4. 核对品牌名、产品名、联系方式是否与 `hugo.toml` 一致。
5. 改完停下，明确提示管理员在本机运行 `python tools/ai_maint.py check`（AI 运行环境无 Python，无法自行校验），等待管理员回报结果。
6. 输出变更摘要、校验结果与待人工确认项。

## 5. 完成标准 + 强制校验（Verify）

### 完成标准

- 目标文件已按需求修改，未触碰白名单之外的文件。
- 改动文件清单、变更摘要、校验输出、待确认项四项齐全。
- 所有新增事实（数字、日期、客户、资质）有来源或标注「待确认」。

### 强制校验

- 校验由管理员本机执行（AI 环境无 Python/Hugo）。AI 改完必须停下，提示管理员运行 `python tools/ai_maint.py check`（无 Python 时用 `node tools/check.mjs`），并等待回报。
- 管理员回报「校验失败」时：AI 回退本次改动，不得带着失败结果交付；连续两次失败停止并上报。

### 审核门槛

- **校验通过后必须停下等待人工审核，管理员明确确认前不得继续，不得自行发布。**
- 在回复中附上校验输出摘要，再请求人工审核。