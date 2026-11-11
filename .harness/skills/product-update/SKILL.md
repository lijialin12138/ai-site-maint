---
name: product-update
description: 维护产品详情页的能力描述、适用场景与交付说明，适用于云枢、云眸、云盾、云桥四款产品。
risk: L2
version: 1.0.0
owner: 产品市场组
allowed-paths:
  - content/products/
denied-paths:
  - content/products/_index.md
  - content/news/
  - content/about/
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

# product-update · 产品页维护

> 风险等级：L2（受控改动，需产品负责人审核）
> 适用角色：产品市场、解决方案工程师
> 边界：只改产品详情页的说明性内容，不改价格、承诺与法律条款

## 1. 触发条件（When）

- 用户要求更新某款产品的功能描述、核心能力、适用场景或交付方式。
- 用户要求修正产品名称、版本描述、能力边界。
- 用户要求补充产品页面中的表格或列表。

以下情况不启用：

- 新增产品线：需要同步设计产品矩阵与导航，属于高风险变更，直接上报。
- 修改产品价格、SLA、合规承诺：必须由商务与法务确认，AI 不得产出。
- 调整产品排序：涉及 `weight` 与首页展示，转人工处理。

## 2. 白名单（Allowed）

| 路径 | 允许操作 | 约束 |
| --- | --- | --- |
| `content/products/cloud-pivot.md` | 修改 | 保留产品定位段 |
| `content/products/cloud-eye.md` | 修改 | 数据能力不得夸大为「替代数据仓库」 |
| `content/products/cloud-guard.md` | 修改 | 合规结论必须与已有认证一致 |
| `content/products/cloud-bridge.md` | 修改 | 服务范围不得承诺未交付能力 |
| `.harness/reports/` | 新增 | 变更记录 |

单次最多修改 2 个产品页，且不得同时改动产品矩阵总述。

## 3. 黑名单（Denied）

- 禁止改动 `content/products/_index.md`、`hugo.toml` 菜单与产品排序。
- 禁止改动 `layouts/`、`assets/`、`static/`、`tools/`、`AGENTS.md`。
- 禁止新增或删除产品页、禁止改文件名与 slug。
- 禁止写入具体报价、折扣、未公开的客户名单、未取得的认证。
- 禁止承诺「100% 可用」「零故障」「绝对安全」等无法验证的表述。
- 禁止修改产品名「云枢」「云眸」「云盾」「云桥」及英文名。
- 需要突破任一条：停止，转 `rule-exception` 并附影响面分析。

## 4. 执行步骤（Steps）

1. 读取 `AGENTS.md`、`content/products/_index.md` 与目标产品页全文。
2. 核对请求是否触及价格、SLA、合规承诺等敏感内容；触及则停止。
3. 对照现有能力清单，确认新增描述有产品或交付依据。
4. 以最小 diff 更新正文，保持「产品定位—核心能力—适用场景—交付与支持」结构。
5. 核查产品名、品牌名、联系方式与 `hugo.toml` 一致。
6. 运行 `python tools/ai_maint.py check`。
7. 输出改动对比、依据来源、校验结果与待确认项。
8. 请产品负责人确认能力边界后再合并。

## 5. 校验要求（Verify）

- 必跑：`python tools/ai_maint.py check`，退出码 0。
- 结构检查：四个固定小节仍在，表格列数一致，无空的适用场景。
- 术语检查：产品名与 `hugo.toml` 中的品牌参数一致，无其他厂商产品名混淆。
- 事实检查：性能数字、认证、客户案例必须有来源，否则移除。
- 失败处理：回退本次改动并重跑校验；不得以「稍后修复」方式交付。