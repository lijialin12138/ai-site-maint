# AI 自动化企业网站维护助手

> 华为 ICT 大赛·创新赛·赛题一作品

## 项目简介

使用 Hugo 制作企业网站，用 CodeArts 代码智能体 + 大模型辅助维护。管理员通过自然语言提出需求，AI 按照预先设计的 Skill 和规范修改网站，经过检查和人工审核后发布。

## 核心流程

```
提出需求 → AI 修改 → 构建和检查 → 人工预览审核 → 发布
```

## 目录结构

```text
ai-site-maint/
├── content/                 # Hugo 网站内容（首页、关于、产品、新闻、联系）
│   ├── _index.md
│   ├── about/_index.md
│   ├── contact/_index.md
│   ├── news/
│   │   ├── _index.md
│   │   ├── b-round-funding.md
│   │   ├── cloud-guard-2-0.md
│   │   ├── manufacturing-partnership.md
│   │   └── specialized-sme.md
│   └── products/
│       ├── _index.md
│       ├── cloud-bridge.md
│       ├── cloud-eye.md
│       ├── cloud-guard.md
│       └── cloud-pivot.md
├── data/                    # 内容类数据目录（当前为空，.gitkeep 占位）
├── layouts/                 # Hugo 模板（只读）
│   ├── _default/
│   │   ├── baseof.html
│   │   ├── list.html
│   │   └── single.html
│   ├── index.html
│   └── partials/
│       ├── header.html
│       └── footer.html
├── assets/                  # CSS 等源资源（只读）
│   └── css/main.css
├── static/                  # 静态资源目录（当前为空，.gitkeep 占位）
├── tools/                   # 校验工具
│   ├── ai_maint.py          # 统一校验入口
│   └── check.mjs            # 无 Python 时的等价校验
├── .harness/                # AI 维护规范体系
│   ├── AGENTS.md            # AI 操作总规范（最高约束）
│   ├── SKILL_TEMPLATE.md    # Skill 编写模板
│   ├── README.md            # 规范层说明
│   ├── skills/              # 8 个核心 Skill
│   │   ├── content-edit/SKILL.md
│   │   ├── page-create/SKILL.md
│   │   ├── media-manage/SKILL.md
│   │   ├── seo/SKILL.md
│   │   ├── theme-change/SKILL.md
│   │   ├── release/SKILL.md
│   │   ├── qa/SKILL.md
│   │   └── rule-exception/SKILL.md
│   ├── templates/
│   │   ├── CONTENT-PAGE-TEMPLATE.md
│   │   ├── NEWS-TEMPLATE.md
│   │   ├── CHANGE-PLAN-TEMPLATE.md
│   │   └── CHECK-REPORT-TEMPLATE.md
│   └── reports/
│       ├── check-report.md
│       └── exceptions/.gitkeep
├── hugo.toml                # Hugo 配置（品牌事实源，L3 保护）
├── 00-提示词骨架.md          # 给 CodeArts 的提示词
├── DSH-维护员交代书.md       # 给 DSH 的角色与红线交代
└── README.md
```

## Skill 清单

| Skill | 等级 | 职责 |
| --- | --- | --- |
| `content-edit` | L2 | 修改已有页面文案 |
| `page-create` | L2 | 新建页面（含新闻、产品） |
| `media-manage` | L2 | 管理图片素材 |
| `seo` | L1 | SEO 只读体检 |
| `theme-change` | L3 | 版面/主题调整，只出方案 |
| `release` | L3 | 构建/发布/回滚，只出方案 |
| `qa` | L1 | 质量检查 |
| `rule-exception` | L3 | 规则例外申请 |

## 约束机制

- AI 的操作范围由 `.harness/AGENTS.md` 的四条红线与各 Skill 的白名单/黑名单共同限定。
- 内容类任务只能修改 `content/` 与 `data/`；品牌锁定字段以 `hugo.toml` 为唯一事实源。
- 每次修改后必须运行 `python tools/ai_maint.py check`，校验通过后停下等待人工审核。
- 生产构建、部署、回滚属于 L3，AI 只输出方案，不执行、不自行发布。

## 团队分工

| 角色 | 姓名 | 负责 |
|---|---|---|
| 队长 | 李佳霖 | Skill 模板、标杆 Skill、整体架构 |
| 队员 | 小甘 | 内容类 Skill |
| 队员 | 小格 | 结构/发布类 Skill |

## 技术栈

- Hugo（静态网站生成）
- 华为云码道 CodeArts 代码智能体（开发工具）
- 华为云 MaaS（大模型）
- 华为云 RDS / Redis（云服务，赛题要求）