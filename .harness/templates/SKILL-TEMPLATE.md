---
name: skill-name
description: 一句话说明该 Skill 解决什么问题、适用于什么场景
risk: L2
version: 1.0.0
owner: 待填写
allowed-paths:
  - content/
denied-paths:
  - layouts/
  - hugo.toml
  - tools/
  - AGENTS.md
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

## 2. 白名单（Allowed）

| 路径/对象 | 允许操作 | 说明 |
| --- | --- | --- |
| `content/` | 修改 | 仅限已有页面文案 |
| `.harness/reports/` | 新增 | 校验与变更记录 |

## 3. 黑名单（Denied）

- 禁止改动：`layouts/`、`hugo.toml`、`assets/`、`tools/`、`AGENTS.md`、`.harness/skills/`。
- 禁止行为：删除页面、改写品牌信息、对外承诺未经验证的指标、绕过校验直接交付。
- 遇到黑名单需求时：停止执行，按 `rule-exception` Skill 提交例外申请。

## 4. 执行步骤（Steps）

1. 阅读 `AGENTS.md` 与本文件，确认风险等级与白名单。
2. 读取目标文件与相邻文件，确认现有结构与写作风格。
3. 用最小改动完成修改，不重构无关内容。
4. 核对品牌名、产品名、联系方式是否与 `hugo.toml` 一致。
5. 运行 `python tools/ai_maint.py check`。
6. 输出变更摘要、校验结果与待人工确认项。

## 5. 校验要求（Verify）

- 必跑：`python tools/ai_maint.py check`，退出码必须为 0。
- 必须人工确认：文案事实、品牌表述、链接指向。
- 校验失败时：回退本次改动，不得带着失败结果交付。
- 校验通过后：在回复中附上校验输出摘要，再请求人工审核。