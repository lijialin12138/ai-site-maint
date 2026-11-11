---
name: news-publish
description: 在新闻栏目新增一篇企业动态稿件，包含 front matter、正文结构与发布前校验。
risk: L2
version: 1.0.0
owner: 品牌与市场部
allowed-paths:
  - content/news/
denied-paths:
  - content/news/_index.md
  - content/about/
  - content/products/
  - content/contact/
  - layouts/
  - hugo.toml
  - assets/
  - static/
  - tools/
  - AGENTS.md
required-checks:
  - python tools/ai_maint.py check
---

# news-publish · 新闻稿件发布

> 风险等级：L2（受控新增，需人工审核）
> 适用角色：品牌与市场部、内容运营
> 边界：只允许在 `content/news/` 新增稿件，不允许修改已发布稿件

## 1. 触发条件（When）

- 用户提供新闻标题、时间、正文，要求发布到「新闻动态」栏目。
- 用户要求新增产品发布、客户合作、公司荣誉类稿件。
- 用户要求把一份已确认的新闻稿录入站点。

以下情况不启用：

- 修改已发布新闻：内容变更需走人工复核，不属于本 Skill 的自动范围。
- 修改新闻栏目介绍：改用 `content-edit`。
- 发布含未公开客户名称、未披露融资信息、监管敏感表述的稿件：直接上报。

## 2. 白名单（Allowed）

| 路径 | 允许操作 | 约束 |
| --- | --- | --- |
| `content/news/<slug>.md` | 新增 | 文件名小写短横线，英文或拼音 |
| `.harness/reports/` | 新增 | 发布记录 |

稿件必须包含 front matter 字段：`title`、`description`、`date`、`author`。
正文结构固定为：导语段 → 一个小标题分节 → 结尾段，篇幅 300–800 字。

## 3. 黑名单（Denied）

- 禁止修改 `content/news/_index.md` 与任何已存在的新闻文件。
- 禁止改动 `layouts/`、`hugo.toml`、`assets/`、`static/`、`tools/`、`AGENTS.md`。
- 禁止编造客户全名、融资金额、市场份额、认证结论；不确定的信息一律标注「待确认」并上报。
- 禁止使用「第一」「唯一」「最安全」等绝对化表述。
- 禁止插入外部图片、脚本、追踪代码。
- 禁止把 `date` 设置在当前日期之后（预约发布需人工处理）。
- 需要突破任一条：停止，转 `rule-exception`。

## 4. 执行步骤（Steps）

1. 读取 `AGENTS.md` 与 `content/news/_index.md`，确认栏目定位。
2. 参考最近一篇新闻，确认 front matter 与正文风格。
3. 校验事实来源：客户名称、金额、日期、资质，缺失则标注并上报。
4. 生成 slug：小写、短横线分隔、不超过 60 字符，且不与现有文件重名。
5. 按模板写入 `content/news/<slug>.md`，正文不写 H1。
6. 核对品牌名与产品名，确保与 `hugo.toml` 一致。
7. 运行 `python tools/ai_maint.py check`。
8. 输出文件路径、摘要、校验结果、待确认事实，请求人工审核。

## 5. 校验要求（Verify）

- 必跑：`python tools/ai_maint.py check`，退出码 0。
- 文件检查：文件名符合 `^[a-z0-9-]+\.md$`，front matter 四个字段齐全。
- 内容检查：无绝对化用语、无未确认数字、无外部资源。
- 日期检查：`date` 不晚于当前日期；首页与列表能按时间倒序展示。
- 失败处理：删除本次新增文件并重写，不得留下半成品稿件。
- 人工审核：市场负责人确认事实与口径后方可合并。