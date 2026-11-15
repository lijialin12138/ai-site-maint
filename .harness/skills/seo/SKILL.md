---
name: seo
description: 只读检查站点 SEO 基础项（标题、描述、H1、canonical、索引与图片 alt），输出报告不改文件。
risk: L1
version: 1.2.0
owner: 增长组
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

# seo · SEO 只读体检

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

## 2. 允许的操作范围（白名单）

| 路径 | 允许操作 | 约束 |
| --- | --- | --- |
| `.harness/reports/seo-report.md` | 新增/覆盖 | 仅报告文件 |
| 对话输出 | 输出 | 问题清单、优先级、修复建议 |

报告文件不进入站点构建，不影响线上页面。除报告外，不写入任何文件。

## 3. 禁止的操作范围（黑名单）

- 禁止修改 `content/`、`data/`、`layouts/`、`assets/`、`static/`、`hugo.toml`、`tools/`、`.harness/AGENTS.md`、`.harness/skills/`。
- 禁止为了「优化关键词」改写品牌名、产品名或公司事实。
- 禁止建议堆砌关键词、隐藏文字、购买外链等违规手段。
- 禁止输出未经验证的搜索排名、流量或收录数据。
- 禁止访问或修改任何搜索引擎后台、统计平台账号。
- 需要实际修复时：停止，说明应由哪个 Skill 处理，不自行执行。

## 4. 执行步骤（Steps）

1. 读取 `.harness/AGENTS.md` 与 `hugo.toml`，确认 `baseURL`、`title`、`enableRobotsTXT`、语言设置。
2. 逐页检查 `content/` 源文件中的 `title`、`description`、`date`、`draft`。`description` 缺失、为空或仅有空白时，记录源文件缺项，即使模板会回退到站点默认描述。
3. 检查 `layouts/_default/baseof.html` 中的 title、description、canonical 和 OG 标签。追踪 canonical、sitemap 及适用的 OG URL 使用的配置和模板值。若 `baseURL` 或产物使用 `.example` 等占位域名，标为「上线前待处理」。仅从源码推断的产物行为标为待验证，并说明依据。
4. 检查每个页面的 H1 来源与唯一性，确认正文没有重复 H1。
5. 检查图片引用是否有 alt，检查是否有空链接或占位链接。
6. 检查草稿标记，并按项目 40–120 字规则检查有效的页面描述。合规长度下的措辞改进归入建议。
7. 按「阻断 / 重要 / 建议」三级归类问题。
8. 在 `.harness/reports/seo-report.md` 中记录检查范围、依据与结论。若用户要求仅在对话中报告，则在对话中按同样结构输出。

## 5. 完成标准 + 强制校验（Verify）

### 完成标准

- 报告覆盖标题、描述、H1、canonical、索引、图片 alt 六类检查项。
- 每条问题含页面路径、现状、问题等级、建议动作、责任 Skill。
- 结论明确区分阻断、重要、建议三级，不给出模糊的「基本没问题」。

### 强制校验

- 由管理员在本机运行 `python tools/ai_maint.py check`。无 Python 时使用 `node tools/check.mjs`。AI 记录本次回报的结果和输出摘要，未收到结果时标为「待管理员校验」。历史报告仅供参考。
- 只读确认：除报告文件外无任何文件改动。
- 数据真实性：所有结论来自仓库文件，不得推测排名或流量。
- 基线校验失败时，先报告失败项，再按总规则处理。已核实的源码发现可列为静态初检，发布前验收保持待处理。

### 审核门槛

- **校验通过后必须停下等待人工审核，管理员明确确认前不得继续，不得自行发布。**
- 报告需由增长负责人确认优先级后，再安排对应 L2 Skill 修复。