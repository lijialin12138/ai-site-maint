# .harness · AI 维护约束层

本目录定义 AI 在「云际科技」企业站点中的工作边界。所有 Skill 均采用五段式：触发、白名单、黑名单、步骤、校验。

## 风险等级

| 等级 | 含义 | AI 可做什么 | 交付门槛 |
| --- | --- | --- | --- |
| L1 | 只读 | 分析、检查、出报告 | 报告需人工确认 |
| L2 | 受控改动 | 在白名单内改文件 | 校验通过 + 人工审核 |
| L3 | 高风险 | 只出方案与影响面，零代码改动 | 管理员书面确认后由人工执行 |

## Skill 清单

| Skill | 等级 | 职责 | 白名单 |
| --- | --- | --- | --- |
| `content-edit` | L2 | 修改已有页面文案 | `content/`（不含新建页） |
| `news-publish` | L2 | 新增新闻稿 | `content/news/<slug>.md` |
| `product-update` | L2 | 维护产品详情页 | `content/products/*.md` |
| `media-manage` | L2 | 图片素材管理 | `static/images/`、`assets/images/` |
| `seo-check` | L1 | SEO 只读体检 | 仅 `.harness/reports/` |
| `link-check` | L1 | 链接与引用检查 | 仅 `.harness/reports/` |
| `build-deploy` | L3 | 构建发布方案 | 仅方案文档，不执行 |
| `rule-exception` | L3 | 规则例外申请 | 仅申请单，不执行 |

## 标准工作流

1. 判断任务属于哪个 Skill；找不到归属时不得自行开工。
2. 读取 `AGENTS.md` 与对应 `SKILL.md`，确认等级、白名单、黑名单。
3. 涉及黑名单或规则冲突：停止，转 `rule-exception`。
4. 执行最小改动，保持品牌、产品名、联系方式与 `hugo.toml` 一致。
5. 运行 `python tools/ai_maint.py check`。
6. 展示校验结果，说明待人工确认项，审核通过后才算完成。

## 目录结构

```text
.harness/
├── README.md
├── skills/
│   ├── content-edit/SKILL.md
│   ├── news-publish/SKILL.md
│   ├── product-update/SKILL.md
│   ├── media-manage/SKILL.md
│   ├── seo-check/SKILL.md
│   ├── link-check/SKILL.md
│   ├── build-deploy/SKILL.md
│   └── rule-exception/SKILL.md
├── templates/
│   ├── SKILL-TEMPLATE.md
│   ├── CONTENT-PAGE-TEMPLATE.md
│   ├── NEWS-TEMPLATE.md
│   ├── CHANGE-PLAN-TEMPLATE.md
│   └── CHECK-REPORT-TEMPLATE.md
└── reports/
    ├── check-report.md
    └── exceptions/
```

## 新增 Skill

复制 `templates/SKILL-TEMPLATE.md`，补齐 front matter 与五段式内容，再运行校验。五段式缺任意一段视为无效 Skill，校验脚本会直接报错。