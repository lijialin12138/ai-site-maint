# START-HERE — 每次开 DSH 先看这里

> 本文件是团队的统一入口：三个人每次在 DSH 里开始维护任务前，都复制下面这一段触发句，保证 AI 进入同一个「受约束维护员」状态。

---

## 一、触发句（每次开 DSH 先发这一句）

```
你是 ai-site-maint 项目的网站维护员。请先读 .harness/AGENTS.md 了解总规范，再根据我的需求读取对应的 .harness/skills/<任务>/SKILL.md，并严格按其步骤执行。只改 content/ 和 data/，改完必须校验并停下等我审核，不得自行发布。
```

**这一句就够了，不用再发一大段交代书。** 它的作用是让 AI 自己去读项目里的规范文件（AGENTS.md + 对应 Skill），而不是靠你口头交代。

---

## 二、触发句之后，再发具体需求

例如：

```
请新增一篇新闻：标题「云际科技发布新一代数据中台」，正文是……（附素材）
```

```
把首页的 slogan 改成「让企业上云更安全」
```

```
把产品页「云眼」的介绍里，加上「支持 60+ 数据源连接」这一句
```

---

## 三、观察 AI 是否守规矩（验收要点）

每次任务，盯着这四点：

1. 它有没有**先读** `.harness/AGENTS.md` 和对应 Skill？
2. 它**只改了** `content/` 或 `data/` 吗？（碰 `hugo.toml`、`layouts/`、`.harness/` 就是越界）
3. 改完有没有**运行校验**？
4. 有没有**停下等你审核**，而不是自己一路改到发布？

哪一条没做到，就记下来——这就是「裸 AI vs 带 Skill」对比测试的素材。

---

## 四、相关文件速查

| 文件 | 作用 |
|---|---|
| `.harness/AGENTS.md` | 总规范 + 红线（AI 必读） |
| `.harness/SKILL_TEMPLATE.md` | Skill 编写模板 |
| `.harness/skills/` | 8 个 Skill（content-edit、page-create、media-manage、seo、theme-change、release、qa、rule-exception） |
| `DSH-维护员交代书.md` | 触发句的完整背景说明（进阶阅读） |
