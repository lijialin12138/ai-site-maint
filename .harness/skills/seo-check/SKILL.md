---
name: seo-check
description: 只读检查站点 SEO 基础项（标题、描述、H1、canonical、索引与图片 alt），输出报告不改文件。
risk: L1
version: 1.0.0
owner: 增长组
allowed-paths:
  - .harness/reports/
denied-paths:
  - content/
  - layouts/
  - assets/
  - static/
  - hugo.toml
  - tools/
  - AGENTS.md
required-checks:
  - python tools/ai_maint.py check
---

# seo-check · SEO 只读体检

> 风险等级：L1（只读，不产生任何站点改动）
> 适用角色：增长运营、内容运营
> 边界：只分析和出报告，所有修复建议交给对应 L2 Skill 或人工

## 1. 触发条件（When）

- 用户要求检查站点 SEO 状况、标题描述质量或索引配置。
- 用户要求在新页面上线前做发布前检查。
- 用户要求输出 SEO 问题清单与优先级。

以下情况不启用：

- 要求直接修改标题、描述、正文：转 `content-edit` 并走审核。
- 要求改动 `layouts/` 中的 meta 模板：属于高风险结构变更，直接上报。
- 要求提交搜索引擎收录、配置站长平台：涉及外部账号，转人工。

## 2. 白名单（Allowed）

| 路径 | 允许操作 | 约束 |
| --- | --- | --- |
| `.harness/reports/seo-report.md` | 新增/覆盖 | 仅报告文件 |
| 对话输出 | 输出 | 问题清单、优先级、修复建议 |

报告文件不进入站点构建，不影响线上页面。除报告外，不写入任何文件。

## 3. 黑名单（Denied）

- 禁止修改 `content/`、`layouts/`、`assets/`、`static/`、`hugo.toml`、`tools/`、`AGENTS.md`。
- 禁止为了「优化关键词」改写品牌名、产品名或公司事实。
- 禁止建议堆砌关键词、隐藏文字、购买外链等违规手段。
- 禁止输出未经验证的搜索排名、流量或收录数据。
- 禁止访问或修改任何搜索引擎后台、统计平台账号。
- 需要实际修复时：停止，说明应由哪个 Skill 处理，不自行执行。

## 4. 执行步骤（Steps）

1. 读取 `hugo.toml`，确认 `baseURL`、`title`、`enableRobotsTXT`、语言设置。
2. 扫描 `content/` 全部页面，提取 `title`、`description`、`date`、`draft`。
3. 检查模板：`layouts/_default/baseof.html` 的 title、description、canonical、OG 标签。
4. 检查每个页面的 H1 来源与唯一性，确认正文没有重复 H1。
5. 检查图片引用是否有 alt，检查是否有空链接或占位链接。
6. 检查 `draft: true` 页面、缺失描述的页面、标题过长的页面。
7. 按「阻断 / 重要 / 建议」三级归类问题。
8. 写入 `.harness/reports/seo-report.md`，附检查范围与结论。

## 5. 校验要求（Verify）

- 必跑：`python tools/ai_maint.py check`，确认站点基线未被破坏。
- 报告完整性：必须包含检查项、现状、问题等级、建议动作、责任 Skill。
- 数据真实性：所有结论来自仓库文件，不得推测排名或流量。
- 只读确认：`git status`（如可用）不得出现报告文件之外的改动。
- 交付审核：报告需由增长负责人确认优先级后再安排修复。