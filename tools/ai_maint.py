#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""云际科技企业站点统一校验入口。

用法:
    python tools/ai_maint.py check
    python tools/ai_maint.py check --json
    python tools/ai_maint.py check --no-report

退出码: 0 全部通过, 1 存在阻断项。
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPORT_DIR = ROOT / ".harness" / "reports"
REPORT_FILE = REPORT_DIR / "check-report.md"

BRAND = "云际科技"
BRAND_EN = "Yunji Tech"
PRODUCTS = ("云枢", "云眸", "云盾", "云桥")

SKILLS = {
    "content-edit": "L2",
    "page-create": "L2",
    "media-manage": "L2",
    "seo": "L1",
    "theme-change": "L3",
    "release": "L3",
    "qa": "L1",
    "rule-exception": "L3",
}

REQUIRED_SECTIONS = ("触发条件", "允许的操作范围", "禁止的操作范围", "执行步骤", "完成标准")

REQUIRED_FILES = (
    "hugo.toml",
    ".harness/AGENTS.md",
    ".harness/SKILL_TEMPLATE.md",
    "content/_index.md",
    "content/about/_index.md",
    "content/products/_index.md",
    "content/news/_index.md",
    "content/contact/_index.md",
    "data/.gitkeep",
    "static/.gitkeep",
    "layouts/_default/baseof.html",
    "layouts/_default/list.html",
    "layouts/_default/single.html",
    "layouts/index.html",
    "layouts/partials/header.html",
    "layouts/partials/footer.html",
    "assets/css/main.css",
    "tools/ai_maint.py",
    "tools/check.mjs",
    ".harness/README.md",
    ".harness/templates/CONTENT-PAGE-TEMPLATE.md",
    ".harness/templates/NEWS-TEMPLATE.md",
    ".harness/templates/CHANGE-PLAN-TEMPLATE.md",
    ".harness/templates/CHECK-REPORT-TEMPLATE.md",
)

FM_TOML = re.compile(r"\A\+\+\+\r?\n(.*?)\r?\n\+\+\+\r?\n", re.S)
FM_YAML = re.compile(r"\A---\r?\n(.*?)\r?\n---\r?\n", re.S)
LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*\.md$")

ABSOLUTE_WORDS = ("唯一", "最安全", "零故障", "100% 可用", "绝对安全")
PLACEHOLDERS = ("TODO", "TBD", "待填写", "占位公司", "示例公司", "某某科技", "Example Corp")
FORBIDDEN_BRANDS = ("示例公司", "某某科技", "Example Corp", "Acme Corp", "Your Company")

results = []


def record(name, ok, messages=None, level="阻断"):
    results.append(
        {
            "name": name,
            "ok": bool(ok),
            "messages": list(messages or []),
            "level": level,
        }
    )


def read(rel):
    path = ROOT / rel
    if not path.is_file():
        return None
    return path.read_text(encoding="utf-8", errors="replace")


def parse_toml(raw):
    data = {}
    for line in raw.splitlines():
        text = line.strip()
        if not text or text.startswith("#") or "=" not in text:
            continue
        key, value = text.split("=", 1)
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        data[key.strip()] = value
    return data


def parse_yaml(raw):
    data = {}
    key = None
    for line in raw.splitlines():
        match = re.match(r"^([A-Za-z0-9_-]+):\s*(.*)$", line)
        if match:
            key = match.group(1)
            value = match.group(2).strip()
            data[key] = value if value else []
            continue
        item = re.match(r"^\s+-\s+(.*)$", line)
        if item and key:
            if not isinstance(data.get(key), list):
                data[key] = []
            data[key].append(item.group(1).strip())
    return data


def split_front_matter(text, pattern):
    match = pattern.match(text)
    if not match:
        return None, text
    return match.group(1), text[match.end():]


def markdown_files():
    base = ROOT / "content"
    if not base.is_dir():
        return []
    return sorted(base.rglob("*.md"))


def page_exists(url):
    clean = url.split("#", 1)[0].split("?", 1)[0]
    if not clean:
        return True
    if clean.startswith("mailto:") or clean.startswith("tel:"):
        return True
    if clean.startswith("http://") or clean.startswith("https://"):
        return True
    if clean.startswith("/images/"):
        return (ROOT / "static" / clean.lstrip("/")).is_file()
    if not clean.startswith("/"):
        return None
    rel = clean.lstrip("/")
    if rel == "":
        return (ROOT / "content" / "_index.md").is_file()
    if clean.endswith("/"):
        candidates = [
            ROOT / "content" / rel / "_index.md",
            ROOT / "content" / rel / "index.md",
        ]
    else:
        candidates = [
            ROOT / "content" / (rel + ".md"),
            ROOT / "content" / rel / "_index.md",
        ]
    return any(path.is_file() for path in candidates)


def check_structure():
    missing = [rel for rel in REQUIRED_FILES if not (ROOT / rel).is_file()]
    for name in SKILLS:
        rel = f".harness/skills/{name}/SKILL.md"
        if not (ROOT / rel).is_file():
            missing.append(rel)
    record(
        "站点结构",
        not missing,
        [f"缺少文件：{item}" for item in missing],
    )


def check_config():
    raw = read("hugo.toml")
    if raw is None:
        record("站点配置", False, ["hugo.toml 不存在"])
        return
    messages = []
    required = ['title = "云际科技"', 'brandName = "云际科技"', 'brandNameEn = "Yunji Tech"']
    for item in required:
        if item not in raw:
            messages.append(f"配置缺少品牌项：{item}")
    if "baseURL" not in raw:
        messages.append("配置缺少 baseURL")
    for lang in ('languageCode = "zh-cn"', 'defaultContentLanguage = "zh-cn"'):
        if lang not in raw:
            messages.append(f"配置缺少语言项：{lang}")
    record("站点配置", not messages, messages)


def check_brand():
    messages = []
    raw = read("hugo.toml") or ""

    if BRAND not in raw or BRAND_EN not in raw:
        messages.append("hugo.toml 未锁定品牌名")

    layouts = ROOT / "layouts"
    if layouts.is_dir():
        for path in sorted(layouts.rglob("*.html")):
            text = path.read_text(encoding="utf-8", errors="replace")
            if BRAND in text or BRAND_EN in text:
                rel = path.relative_to(ROOT).as_posix()
                messages.append(f"布局硬编码品牌名：{rel}")

    for path in markdown_files():
        text = path.read_text(encoding="utf-8", errors="replace")
        rel = path.relative_to(ROOT).as_posix()
        for word in FORBIDDEN_BRANDS:
            if word in text:
                messages.append(f"出现非锁定品牌：{rel} 含「{word}」")

    contact = read("content/contact/_index.md") or ""
    if "contact@yunji-tech.example" in raw and "contact@yunji-tech.example" not in contact:
        messages.append("联系页缺少 hugo.toml 中的商务邮箱")
    if "400-800-2026" in raw and "400-800-2026" not in contact:
        messages.append("联系页缺少 hugo.toml 中的咨询热线")

    record("品牌锁定", not messages, messages)


def check_pages():
    messages = []
    news_count = 0
    product_count = 0

    for path in markdown_files():
        rel = path.relative_to(ROOT).as_posix()
        name = path.name
        if name != "_index.md" and not NAME_RE.match(name):
            messages.append(f"文件命名不符合小写短横线：{rel}")

        text = path.read_text(encoding="utf-8", errors="replace")
        fm_raw, body = split_front_matter(text, FM_TOML)
        if fm_raw is None:
            messages.append(f"缺少 TOML front matter：{rel}")
            continue
        fm = parse_toml(fm_raw)
        for key in ("title", "date", "description"):
            if not fm.get(key):
                messages.append(f"front matter 缺少 {key}：{rel}")
        desc = fm.get("description", "")
        if desc and not (40 <= len(desc) <= 120):
            messages.append(f"description 长度 {len(desc)} 字，应为 40–120 字：{rel}")
        if fm.get("draft") == "true":
            messages.append(f"存在未发布稿件 draft=true：{rel}")
        if re.search(r"^# ", body, re.M):
            messages.append(f"正文出现一级标题：{rel}")

        section = path.parent.name
        if section == "news" and name != "_index.md":
            news_count += 1
            for key in ("date", "author"):
                if not fm.get(key):
                    messages.append(f"新闻缺少 {key}：{rel}")
            date_value = fm.get("date", "")
            try:
                published = datetime.strptime(date_value, "%Y-%m-%d")
                if published > datetime.now():
                    messages.append(f"新闻日期晚于当前日期：{rel}")
            except ValueError:
                messages.append(f"新闻日期格式不合法：{rel}")
        if section == "products" and name != "_index.md":
            product_count += 1
            if not fm.get("weight"):
                messages.append(f"产品缺少 weight：{rel}")
            if not fm.get("date"):
                messages.append(f"产品缺少 date：{rel}")

        for word in ABSOLUTE_WORDS:
            if word in text:
                messages.append(f"出现绝对化表述「{word}」：{rel}")
        for word in PLACEHOLDERS:
            if word in text:
                messages.append(f"存在占位/未确认内容「{word}」：{rel}")

    if product_count < 1:
        messages.append("产品页数量不足：至少 1 个")
    if news_count < 1:
        messages.append("新闻页数量不足：至少 1 个")

    record("页面完整性", not messages, messages)


def check_links():
    messages = []
    for path in markdown_files():
        rel = path.relative_to(ROOT).as_posix()
        text = path.read_text(encoding="utf-8", errors="replace")
        _, body = split_front_matter(text, FM_TOML)
        for line_no, line in enumerate(body.splitlines(), start=1):
            for target in LINK_RE.findall(line):
                target = target.strip()
                if target.startswith("#"):
                    continue
                exists = page_exists(target)
                if exists is False:
                    messages.append(f"失效链接：{rel}:{line_no} -> {target}")
                elif exists is None:
                    messages.append(f"相对链接需人工确认：{rel}:{line_no} -> {target}")

    config = read("hugo.toml") or ""
    for ref in re.findall(r'pageRef\s*=\s*"([^"]+)"', config):
        if page_exists(ref) is False:
            messages.append(f"菜单指向不存在页面：{ref}")

    record("链接引用", not messages, messages, level="重要")


def check_skills():
    messages = []
    expected_dir = ROOT / ".harness" / "skills"
    for name, risk in SKILLS.items():
        rel = f".harness/skills/{name}/SKILL.md"
        text = read(rel)
        if text is None:
            messages.append(f"缺少 Skill：{rel}")
            continue
        fm_raw, body = split_front_matter(text, FM_YAML)
        if fm_raw is None:
            messages.append(f"Skill 缺少 YAML front matter：{rel}")
            continue
        fm = parse_yaml(fm_raw)
        if fm.get("name") != name:
            messages.append(f"Skill name 与目录不一致：{rel}")
        if fm.get("risk") != risk:
            messages.append(f"Skill 风险等级应为 {risk}：{rel}")
        if not fm.get("description"):
            messages.append(f"Skill 缺少 description：{rel}")
        allowed = fm.get("allowed-paths")
        denied = fm.get("denied-paths")
        if not allowed or allowed in ("", "[]"):
            messages.append(f"Skill 白名单为空：{rel}")
        if not denied or denied in ("", "[]"):
            messages.append(f"Skill 黑名单为空：{rel}")
        for index, section in enumerate(REQUIRED_SECTIONS, start=1):
            pattern = rf"^##\s*{index}\.\s*{section}"
            if not re.search(pattern, body, re.M):
                messages.append(f"Skill 五段式缺少「{section}」：{rel}")
        if risk == "L3" and "不执行" not in text and "不得执行" not in text:
            messages.append(f"L3 Skill 未声明不执行边界：{rel}")
        if "不得自行发布" not in text:
            messages.append(f"Skill 缺少「不得自行发布」硬约束：{rel}")

    if expected_dir.is_dir():
        actual = {p.parent.name for p in expected_dir.glob("*/SKILL.md")}
        for extra in sorted(actual - set(SKILLS)):
            messages.append(f"发现未登记 Skill：{extra}")

    record("Skill 五段式", not messages, messages)


def write_report(started_at, finished_at):
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    passed = sum(1 for item in results if item["ok"])
    failed = len(results) - passed

    lines = [
        "# 云际科技站点校验报告",
        "",
        f"- 检查时间：{started_at} ~ {finished_at}",
        f"- 执行命令：`python tools/ai_maint.py check`",
        f"- 检查项：{len(results)}",
        f"- 通过：{passed}",
        f"- 失败：{failed}",
        "",
        "## 结论",
        "",
        "全部通过，允许进入人工审核。" if failed == 0 else "存在失败项，禁止交付，需修复后重新校验。",
        "",
        "## 检查明细",
        "",
        "| 检查项 | 结果 | 问题数 |",
        "| --- | --- | --- |",
    ]
    for item in results:
        status = "通过" if item["ok"] else "失败"
        lines.append(f"| {item['name']} | {status} | {len(item['messages'])} |")

    for item in results:
        lines.extend(["", f"### {item['name']} · {'通过' if item['ok'] else '失败'}", ""])
        if item["messages"]:
            for message in item["messages"]:
                lines.append(f"- {message}")
        else:
            lines.append("- 无问题")

    lines.extend(
        [
            "",
            "## 说明",
            "",
            "- 本报告由校验脚本生成，不进入站点构建。",
            "- 本报告只做结构与规范检查，不包含 Hugo 构建验证。",
            "- 校验通过仅代表结构与规范满足要求，事实性内容仍需人工确认。",
            "- 发布属于 L3 操作，须由管理员书面确认后人工执行。",
            "",
        ]
    )
    REPORT_FILE.write_text("\n".join(lines), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="云际科技站点统一校验")
    parser.add_argument("command", nargs="?", default="check", choices=["check"])
    parser.add_argument("--json", action="store_true", help="以 JSON 输出结果")
    parser.add_argument("--no-report", action="store_true", help="不写入 Markdown 报告")
    args = parser.parse_args()

    started_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    check_structure()
    check_config()
    check_brand()
    check_pages()
    check_links()
    check_skills()

    finished_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    failed = [item for item in results if not item["ok"]]

    if args.json:
        print(
            json.dumps(
                {
                    "time": finished_at,
                    "passed": len(results) - len(failed),
                    "failed": len(failed),
                    "results": results,
                },
                ensure_ascii=False,
                indent=2,
            )
        )
    else:
        print(f"云际科技站点校验 · {finished_at}")
        for item in results:
            status = "PASS" if item["ok"] else "FAIL"
            print(f"[{status}] {item['name']}")
            for message in item["messages"]:
                print(f"       - {message}")
        print(f"汇总：{len(results) - len(failed)} 通过 / {len(failed)} 失败")

    if not args.no_report:
        write_report(started_at, finished_at)
        print(f"报告：{REPORT_FILE.relative_to(ROOT).as_posix()}")

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())