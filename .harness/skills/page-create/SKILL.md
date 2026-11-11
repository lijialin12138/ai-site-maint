---
name: page-create
description: 在云际科技站点新建页面，包括新闻稿、产品详情页与普通内容页，负责 front matter 与正文骨架。
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

# page-create · 新建页面

> 风险等级：L2（受控新增，需人工审核）
> 适用角色：内容运营、品牌与市场部
> 边界：只新增内容文件，不覆盖、不删除已有文件

## 1. 触发条件（When）

- 用户要求新增一篇新闻稿、一个产品详情页或一个普通内容页。
- 用户要求为某个栏目补充新的条目页面。
- 用户提供了标题、正文与发布时间，要求录入站点。

以下情况不启用：

- 修改已有页面的文案：改用 `content-edit`。
- 新增栏目、调整导航或菜单：属于 L3，直接上报。
- 新建页面需要同步改动模板、样式或脚本：超出本 Skill，停止并上报。

## 2. 允许的操作范围（白名单）

| 路径 | 允许操作 | 约束 |
| --- | --- | --- |
| `content/news/<slug>.md` | 新增 | 新闻稿，文件名小写短横线 |
| `content/products/<slug>.md` | 新增 | 产品详情页，需设置 `weight` |
| `content/<section>/<slug>.md` | 新增 | 普通内容页，需确认栏目已存在 |
| `data/` | 新增 | 仅限内容类数据文件 |
| `.harness/reports/` | 新增 | 发布记录 |

同一页面类型单次最多新增 1 个文件；批量建页需拆分任务。

## 3. 禁止的操作范围（黑名单）

- 禁止覆盖、重命名或删除任何已存在的文件。
- 禁止改动 `layouts/`、`hugo.toml`、`assets/`、`static/`、`tools/`、`.harness/AGENTS.md`、`.harness/skills/`。
- 禁止新增栏目目录或修改 `hugo.toml` 菜单。
- 禁止编造客户全名、融资金额、市场份额、认证结论；不确定的信息标注「待确认」并上报。
- 禁止使用「第一」「唯一」「最安全」等绝对化表述。
- 禁止插入外部图片、脚本、追踪代码。
- 禁止把 `date` 设置在当前日期之后；预约发布需人工处理。
- 禁止改动品牌锁定字段与已有产品的 `weight`。
- 需要突破任一条：停止，转 `rule-exception`。

## 4. 执行步骤（Steps）

1. 读取 `.harness/AGENTS.md` 与目标栏目的 `_index.md`，确认页面定位。
2. 参考同栏目最近一篇内容，确认 front matter 字段与正文风格。
3. 校验事实来源：客户名称、金额、日期、资质，缺失则标注并上报。
4. 生成 slug：小写、短横线分隔、不超过 60 字符，且不与现有文件重名。
5. 写入新文件，front matter 必须含 `title`、`date`、`description`、`author`（新闻）或 `weight`（产品）。
6. 核对 `description` 长度为 40–120 字，正文不写一级标题。
7. 核对品牌名、产品名与 `hugo.toml` 一致。
8. 运行 `python tools/ai_maint.py check`。
9. 输出文件路径、摘要、校验结果、待确认事实，请求人工审核。

## 5. 完成标准 + 强制校验（Verify）

### 完成标准

- 新文件位于白名单目录，文件名符合 `^[a-z0-9-]+\.md$`，且未覆盖任何已有文件。
- front matter 字段齐全：`title`、`date`、`description`；新闻含 `author`，产品含 `weight`。
- `description` 为 40–120 字，正文无一级标题，无绝对化表述。
- 站内链接目标存在，图片引用有 alt。
- 改动文件清单、摘要、校验结果、待确认项齐全。

### 强制校验

- 必跑：`python tools/ai_maint.py check`，退出码必须为 0。
- 文件检查：命名、front matter、描述长度三项全部通过。
- 内容检查：事实有来源，无未确认数字，无外部资源。
- 日期检查：`date` 不晚于当前日期。
- 失败处理：删除本次新增文件后重写，不得留下半成品。

### 审核门槛

- **校验通过后必须停下等待人工审核，管理员明确确认前不得继续，不得自行发布。**
- 市场或产品负责人确认事实与口径后，方可合并。