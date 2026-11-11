---
name: media-manage
description: 管理站点图片素材的命名、格式、体积与引用方式，适用于产品图、新闻配图与页面插图。
risk: L2
version: 1.0.0
owner: 设计组
allowed-paths:
  - static/images/
  - assets/images/
denied-paths:
  - layouts/
  - hugo.toml
  - assets/css/
  - static/favicon.ico
  - static/robots.txt
  - content/
  - tools/
  - AGENTS.md
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

## 2. 白名单（Allowed）

| 路径 | 允许操作 | 约束 |
| --- | --- | --- |
| `static/images/` | 新增、替换、删除 | Markdown 直接引用的发布素材 |
| `assets/images/` | 新增、替换、删除 | 需要 Hugo 处理的源素材 |
| `.harness/reports/` | 新增 | 素材变更记录 |

命名规则：`{页面名}-{序号}.{ext}`，全小写短横线，序号两位数。
示例：`award-01.jpg`、`cloud-pivot-02.webp`、`news-b-round-01.png`。
允许格式：`.jpg`、`.jpeg`、`.png`、`.webp`、`.svg`（SVG 需无脚本）。
单张图片不超过 2 MB，长边不超过 2560 px。

## 3. 黑名单（Denied）

- 禁止改动 `layouts/`、`assets/css/`、`hugo.toml`、`content/`、`tools/`、`AGENTS.md`。
- 禁止改动 `static/favicon.ico`、`static/robots.txt` 与任何站点级配置文件。
- 禁止上传含 `<script>`、`onload`、外链 `href` 的 SVG。
- 禁止使用外部热链、带追踪参数的图片地址、来源不明的版权素材。
- 禁止删除仍被内容页引用的图片。
- 禁止用图片替代文字承载关键信息（如联系方式、价格）。
- 需要突破任一条：停止，转 `rule-exception`。

## 4. 执行步骤（Steps）

1. 读取 `AGENTS.md` 与目标页面的 Markdown，确认图片用途与尺寸需求。
2. 检查素材来源与版权授权，来源不明则拒绝入库。
3. 按 `{页面名}-{序号}.{ext}` 命名，确认不与现有文件冲突。
4. 压缩到体积与尺寸上限，保留原始文件给设计组归档。
5. 放入 `static/images/`，Markdown 引用使用 `/images/<文件名>` 绝对路径。
6. 为图片补写有意义的 alt 文本，不使用「图片」「配图」等空描述。
7. 运行 `python tools/ai_maint.py check`。
8. 输出素材清单、引用位置、体积、校验结果，请求设计负责人确认。

## 5. 校验要求（Verify）

- 必跑：`python tools/ai_maint.py check`，退出码 0。
- 命名检查：符合 `^[a-z0-9]+(-[a-z0-9]+)*-\d{2}\.(jpg|jpeg|png|webp|svg)$`。
- 体积检查：单文件 ≤ 2 MB；超限必须压缩后重新提交。
- 引用检查：每个新增图片至少被一个内容页引用，且 alt 非空。
- 安全检查：SVG 不含脚本与外部链接；位图不含可执行内容。
- 失败处理：移除本次新增素材，修复后重跑；不得保留未引用文件。