---
name: link-check
description: 只读检查站内链接、锚点、图片引用与菜单映射，输出失效清单而不修改任何文件。
risk: L1
version: 1.0.0
owner: 质量保障组
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

# link-check · 链接与引用检查

> 风险等级：L1（只读，不产生任何站点改动）
> 适用角色：测试、内容运营
> 边界：只做静态检查与报告，不修复、不发起外部网络请求

## 1. 触发条件（When）

- 用户要求检查站内死链、错误锚点、图片引用缺失。
- 用户要求在上线前做链接巡检。
- 用户要求核对导航菜单与页面路径是否一致。

以下情况不启用：

- 要求直接修复链接：转 `content-edit`（站内）或人工（配置类）。
- 要求批量抓取外部网站状态码：涉及外网访问与合规风险，转人工评估。
- 要求修改 `hugo.toml` 菜单结构：直接上报。

## 2. 白名单（Allowed）

| 路径 | 允许操作 | 约束 |
| --- | --- | --- |
| `.harness/reports/link-report.md` | 新增/覆盖 | 仅报告文件 |
| 对话输出 | 输出 | 失效链接、位置、建议 |

除报告外不写入任何文件；不执行 `curl`、`wget` 等外部请求。

## 3. 黑名单（Denied）

- 禁止修改 `content/`、`layouts/`、`assets/`、`static/`、`hugo.toml`、`tools/`、`AGENTS.md`。
- 禁止自动改写链接、自动删除「疑似失效」的内容。
- 禁止对外部站点发起批量请求或压力测试。
- 禁止访问内网地址、管理后台、带凭据的 URL。
- 禁止把 `mailto:`、`tel:` 之外的联系方式硬编码进页面。
- 需要修复时：停止，输出修复清单并指明责任 Skill。

## 4. 执行步骤（Steps）

1. 读取 `hugo.toml` 的 `baseURL` 与菜单配置，建立页面路径清单。
2. 扫描 `content/` 中的 Markdown 链接、图片引用与裸 URL。
3. 将站内链接映射到 `content/` 的实际文件路径，检查是否存在。
4. 检查 `/products/`、`/news/` 等栏目的 `_index.md` 是否存在。
5. 检查锚点链接对应的标题是否存在（中文锚点按 Hugo 生成规则比对，无法确定时标注「需人工确认」）。
6. 检查 `mailto:`、`tel:` 格式与 `hugo.toml` 中的联系方式是否一致。
7. 生成 `.harness/reports/link-report.md`，按失效类型分组。
8. 输出结论：阻断项数量、重要项数量、建议项数量。

## 5. 校验要求（Verify）

- 必跑：`python tools/ai_maint.py check`，确认基线通过。
- 报告完整性：每条问题含来源文件、行号、链接文本、目标地址、问题类型。
- 只读确认：除报告外无文件改动。
- 结果判定：存在阻断项（站内 404、图片缺失、菜单指向不存在页面）时不得给出「通过」结论。
- 审核：修复清单交内容运营确认后，按 L2 Skill 执行修复并重新巡检。