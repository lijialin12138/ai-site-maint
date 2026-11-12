---
name: media-manage
description: 管理站点图片素材的命名、格式、体积与引用方式，适用于产品图、新闻配图与页面插图。
risk: L2
version: 1.2.0
owner: 设计组
allowed-paths:
  - static/images/
  - assets/images/
denied-paths:
  - content/
  - layouts/
  - hugo.toml
  - assets/css/
  - static/favicon.ico
  - static/robots.txt
  - data/
  - tools/
  - .harness/AGENTS.md
  - .harness/SKILL_TEMPLATE.md
  - .harness/skills/
required-checks:
  - python tools/ai_maint.py check
---

# media-manage · 图片素材管理

> 风险等级：L2（受控新增/替换，需设计负责人审核）
> 适用角色：设计师、内容运营
> 边界：只处理图片素材本身，不改页面结构、样式与文案

## 1. 触发条件（When）

- 用户要求为某个页面新增、替换或删除配图。
- 用户要求压缩图片体积、统一图片格式或修正图片命名。
- 用户要求补齐图片的替代文本（alt）。

以下情况不启用：

- 需要新增轮播、图集、灯箱等交互：涉及 `layouts/` 与 JS，直接上报。
- 需要修改 Logo、favicon、品牌主视觉：品牌锁定，转人工。
- 需要引用外部图床或 CDN 图片：直接拒绝。
- 纯只读巡检（检查图片引用是否失效、列清单）：归 `qa`（L1），本 Skill 不做只读检查。

## 2. 允许的操作范围（白名单）

| 路径 | 允许操作 | 约束 |
| --- | --- | --- |
| `static/images/` | 新增、替换、删除 | Markdown 直接引用的发布素材 |
| `assets/images/` | 新增、替换、删除 | 需要 Hugo 处理的源素材 |

命名规则：`{页面名}-{序号}.{ext}`，全小写短横线，序号两位数。
示例：`award-01.jpg`、`cloud-pivot-02.webp`、`news-b-round-01.png`。
允许格式：`.jpg`、`.jpeg`、`.png`、`.webp`、`.svg`（SVG 需无脚本）。
单张图片不超过 2 MB，长边不超过 2560 px。

alt 与页面引用分工（v1.2.0 澄清）：图片在页面中的引用（`![](/images/...)`）与 alt 文本写在 `content/`，属 `content-edit` 白名单，**media-manage 不改 `content/`**。media-manage 的交付物 = 合规素材 + 交付报告中写明「建议引用位置 + 建议 alt 文本」；页面落地由 `content-edit` 或管理员完成。任务同时要求「入库并配到页面」时：素材部分按本 Skill 执行，页面引用部分提示转 `content-edit`，两个白名单都不越界。

变更记录写在任务回复中（AGENTS.md 标准交付格式）；`.harness/reports/` 按红线 1 仅 L1/L3 Skill 可写，本 Skill 不写。

## 3. 禁止的操作范围（黑名单）

- 禁止改动 `layouts/`、`assets/css/`、`hugo.toml`、`content/`、`data/`、`tools/`、`.harness/AGENTS.md`、`.harness/skills/`。
- 禁止改动 `static/favicon.ico`、`static/robots.txt` 与任何站点级配置文件。
- 禁止上传含 `<script>`、`onload`、外链 `href` 的 SVG。
- 禁止使用外部热链、带追踪参数的图片地址、来源不明的版权素材。
- 禁止删除仍被内容页引用的图片。
- 禁止用图片替代文字承载关键信息（如联系方式、价格）。
- 需要突破任一条：停止，转 `rule-exception`。

## 4. 执行步骤（Steps）

1. 读取 `.harness/AGENTS.md` 与目标页面的 Markdown，确认图片用途与尺寸需求。
2. 检查素材来源与版权授权，来源不明则拒绝入库。
3. 按 `{页面名}-{序号}.{ext}` 命名，确认不与现有文件冲突。
4. 压缩到体积与尺寸上限，保留原始文件给设计组归档。
5. 放入 `static/images/`，Markdown 引用使用 `/images/<文件名>` 绝对路径。
6. 在交付报告中给出建议 alt 文本：有意义、描述图片内容，不使用「图片」「配图」等空描述；alt 落在 `content/`，由 `content-edit` 或管理员写入，本 Skill 不改 `content/`。
7. 停下，明确提示管理员在本机运行 `python tools/ai_maint.py check`（无 Python 时用 `node tools/check.mjs`），等待管理员回报结果；AI 不得自行运行校验，不得伪造校验结果。
8. 输出素材清单（路径、体积、尺寸、建议引用位置、建议 alt）、校验结果，请求设计负责人确认。

## 5. 完成标准 + 强制校验（Verify）

### 完成标准

- 素材位于白名单目录，命名符合 `{页面名}-{序号}.{ext}`。
- 单文件 ≤ 2 MB，长边 ≤ 2560 px，格式在允许清单内。
- 交付清单包含：素材路径、体积、尺寸、建议引用位置、建议 alt 文本。
- 「入库备用」场景允许暂不被引用；若需求要求配到页面，须提示转 `content-edit`，不在本 Skill 内改 `content/`。
- 素材清单、校验结果齐全。

### 强制校验

- 校验由管理员本机执行（AI 环境无 Python/Hugo）：AI 改完必须停下，提示管理员运行 `python tools/ai_maint.py check`（无 Python 时用 `node tools/check.mjs`），并等待回报。
- 必跑：`python tools/ai_maint.py check`，退出码必须为 0。
- 命名检查：符合 `^[a-z0-9]+(-[a-z0-9]+)*-\d{2}\.(jpg|jpeg|png|webp|svg)$`。
- 体积检查：单文件 ≤ 2 MB；超限必须压缩后重新提交。
- 安全检查：SVG 不含脚本与外部链接；位图不含可执行内容。
- 失败处理：移除本次新增素材，修复后重跑；「入库备用」的未引用素材经管理员确认后可保留。

### 审核门槛

- **校验通过后必须停下等待人工审核，管理员明确确认前不得继续，不得自行发布。**
- 设计负责人确认素材与授权后，方可合并。