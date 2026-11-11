---
name: content-edit
description: 修改云际科技站点已有页面的中文文案与内容结构，适用于首页、关于、产品、新闻、联系等页面。
risk: L2
version: 1.1.0
owner: 内容运营组
allowed-paths:
  - content/
  - data/
denied-paths:
  - layouts/
  - hugo.toml
  - assets/
  - static/
  - tools/
  - .harness/AGENTS.md
  - .harness/SKILL_TEMPLATE.md
  - .harness/skills/
required-checks:
  - python tools/ai_maint.py check
---

# content-edit · 页面文案维护

> 风险等级：L2（受控改动，需人工审核）
> 适用角色：内容运营、市场文案
> 边界：只改「已经存在」的页面内容，不新建整页、不改模板与样式

## 1. 触发条件（When）

- 用户要求修改首页、关于我们、联系我们等页面的文案、段落顺序或表格内容。
- 用户要求修正错别字、统一术语、调整语气。
- 用户要求更新联系方式、地址、工作时间等事实信息。
- 用户要求修改已有新闻稿或产品详情页的说明性文字。

以下情况不启用：

- 新增新闻、产品或普通页面：改用 `page-create`。
- 调整导航、布局、配色：属于 `layouts/` 与 `assets/`，直接拒绝并上报。
- 修改品牌名称、Logo 文案、slogan、联系方式或备案号：触发品牌锁定红线，必须上报管理员。

## 2. 允许的操作范围（白名单）

| 路径 | 允许操作 | 约束 |
| --- | --- | --- |
| `content/_index.md` | 修改 | 仅正文，front matter 只允许改 `description` |
| `content/about/_index.md` | 修改 | 保留发展历程的时间线事实 |
| `content/contact/_index.md` | 修改 | 联系方式必须与 `hugo.toml` 一致 |
| `content/products/*.md` | 修改 | 仅说明性文字，不改产品名与 `weight` |
| `content/news/*.md` | 修改 | 不改 `title`、`date`、`author` |
| `data/` | 修改 | 仅限内容类数据文件，不写密钥或隐私数据 |
| `.harness/reports/` | 新增 | 变更记录 |

白名单之外一律视为越界。单次改动文件数不超过 5 个。

## 3. 禁止的操作范围（黑名单）

- 禁止改动 `layouts/`、`assets/`、`static/`、`hugo.toml`、`tools/`、`.harness/AGENTS.md`、`.harness/skills/`。
- 禁止删除任何页面、`_index.md` 或新闻条目。
- 禁止修改 front matter 中的 `title`、`date`、`weight`、`author`；标题变更需走人工流程。
- 禁止写入未经确认的客户名称、融资数据、认证结论、性能数字。
- 禁止改动品牌锁定字段：品牌名「云际科技」「Yunji Tech」、产品名「云枢」「云眸」「云盾」「云桥」、slogan、联系方式、备案号。
- 禁止引入外部脚本、iframe、统计代码或热链图片。
- 需要突破以上任一条：停止，转 `rule-exception` 提交申请。

## 4. 执行步骤（Steps）

1. 读取 `.harness/AGENTS.md`，确认四条红线仍然有效。
2. 读取目标文件全文及所在目录的 `_index.md`，确认页面定位与上下文。
3. 检查请求是否涉及黑名单；涉及则停止并上报，不产出改动。
4. 以最小 diff 修改正文，保持原有 Markdown 层级与中文标点风格。
5. 对照 `hugo.toml` 核对品牌名、邮箱、电话、地址。
6. 运行 `python tools/ai_maint.py check`。
7. 汇总改动文件、改动摘要、校验结果、待确认事实。
8. 展示校验结果后请求人工审核，审核通过前不得视为完成。

## 5. 完成标准 + 强制校验（Verify）

### 完成标准

- 目标页面的文案已按需求修改，且只动了白名单内的文件。
- 页面结构保持在「产品定位/栏目说明/正文」原有层级，正文没有新增一级标题。
- 改动文件清单、变更摘要、校验结果、待确认项四项齐全。
- 所有新增事实（数字、时间、客户、资质）有来源，或标注「待确认」。

### 强制校验

- 必跑：`python tools/ai_maint.py check`，退出码必须为 0，且品牌与页面检查项全部通过。
- 人工核对：品牌名、产品名、联系方式与 `hugo.toml` 一致。
- 失败处理：回退本次 diff，修复后重跑；连续两次失败则停止并上报。

### 审核门槛

- **校验通过后必须停下等待人工审核，管理员明确确认前不得继续，不得自行发布。**
- 交付时必须附校验输出摘要，禁止只写「已校验」。