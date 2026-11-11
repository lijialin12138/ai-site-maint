#!/usr/bin/env node
// 云际科技站点等价结构校验（Python 不可用时的兜底入口）
// 正式入口仍为: python tools/ai_maint.py check
// 用法: node tools/check.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPORT_DIR = path.join(ROOT, ".harness", "reports");
const REPORT_FILE = path.join(REPORT_DIR, "check-report.md");

const BRAND = "云际科技";
const BRAND_EN = "Yunji Tech";
const SKILLS = {
  "content-edit": "L2",
  "page-create": "L2",
  "media-manage": "L2",
  "seo": "L1",
  "theme-change": "L3",
  "release": "L3",
  "qa": "L1",
  "rule-exception": "L3",
};
const REQUIRED_SECTIONS = ["触发条件", "允许的操作范围", "禁止的操作范围", "执行步骤", "完成标准"];
const REQUIRED_FILES = [
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
];
const ABSOLUTE_WORDS = ["唯一", "最安全", "零故障", "100% 可用", "绝对安全"];
const PLACEHOLDERS = ["TODO", "TBD", "待填写", "占位公司", "示例公司", "某某科技", "Example Corp"];
const FORBIDDEN_BRANDS = ["示例公司", "某某科技", "Example Corp", "Acme Corp", "Your Company"];

const FM_TOML = /^\+\+\+\r?\n([\s\S]*?)\r?\n\+\+\+\r?\n/;
const FM_YAML = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
const LINK_RE = /\[[^\]]+\]\(([^)]+)\)/g;
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*\.md$/;

const results = [];

function record(name, ok, messages = [], level = "阻断") {
  results.push({ name, ok: Boolean(ok), messages, level });
}

function read(rel) {
  try {
    return fs.readFileSync(path.join(ROOT, rel), "utf8");
  } catch {
    return null;
  }
}

function isFile(rel) {
  try {
    return fs.statSync(path.join(ROOT, rel)).isFile();
  } catch {
    return false;
  }
}

function walk(dir, ext) {
  if (!fs.existsSync(dir)) return [];
  const output = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      output.push(...walk(full, ext));
    } else if (entry.name.endsWith(ext)) {
      output.push(full);
    }
  }
  return output.sort();
}

function relOf(full) {
  return path.relative(ROOT, full).split(path.sep).join("/");
}

function splitFrontMatter(text, pattern) {
  const match = text.match(pattern);
  if (!match) return { raw: null, body: text };
  return { raw: match[1], body: text.slice(match[0].length) };
}

function parseToml(raw) {
  const data = {};
  for (const line of raw.split(/\r?\n/)) {
    const text = line.trim();
    if (!text || text.startsWith("#") || !text.includes("=")) continue;
    const index = text.indexOf("=");
    const key = text.slice(0, index).trim();
    let value = text.slice(index + 1).trim();
    if (value.length >= 2 && value[0] === value[value.length - 1] && ['"', "'"].includes(value[0])) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return data;
}

function parseYaml(raw) {
  const data = {};
  let key = null;
  for (const line of raw.split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (pair) {
      key = pair[1];
      const value = pair[2].trim();
      data[key] = value ? value : [];
      continue;
    }
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && key) {
      if (!Array.isArray(data[key])) data[key] = [];
      data[key].push(item[1].trim());
    }
  }
  return data;
}

function pageExists(url) {
  const clean = url.split("#")[0].split("?")[0];
  if (!clean) return true;
  if (/^(mailto:|tel:|https?:\/\/)/.test(clean)) return true;
  if (clean.startsWith("/images/")) return isFile(`static${clean}`);
  if (!clean.startsWith("/")) return null;
  const rel = clean.slice(1);
  if (rel === "") return isFile("content/_index.md");
  const candidates = clean.endsWith("/")
    ? [`content/${rel}_index.md`, `content/${rel}index.md`]
    : [`content/${rel}.md`, `content/${rel}/_index.md`];
  return candidates.some(isFile);
}

function checkStructure() {
  const missing = REQUIRED_FILES.filter((rel) => !isFile(rel));
  for (const name of Object.keys(SKILLS)) {
    const rel = `.harness/skills/${name}/SKILL.md`;
    if (!isFile(rel)) missing.push(rel);
  }
  record("站点结构", missing.length === 0, missing.map((item) => `缺少文件：${item}`));
}

function checkConfig() {
  const raw = read("hugo.toml");
  if (raw === null) {
    record("站点配置", false, ["hugo.toml 不存在"]);
    return;
  }
  const messages = [];
  for (const token of ['title = "云际科技"', 'brandName = "云际科技"', 'brandNameEn = "Yunji Tech"']) {
    if (!raw.includes(token)) messages.push(`配置缺少品牌项：${token}`);
  }
  if (!raw.includes("baseURL")) messages.push("配置缺少 baseURL");
  for (const token of ['languageCode = "zh-cn"', 'defaultContentLanguage = "zh-cn"']) {
    if (!raw.includes(token)) messages.push(`配置缺少语言项：${token}`);
  }
  record("站点配置", messages.length === 0, messages);
}

function checkBrand() {
  const messages = [];
  const raw = read("hugo.toml") || "";
  if (!raw.includes(BRAND) || !raw.includes(BRAND_EN)) {
    messages.push("hugo.toml 未锁定品牌名");
  }

  for (const full of walk(path.join(ROOT, "layouts"), ".html")) {
    const text = fs.readFileSync(full, "utf8");
    if (text.includes(BRAND) || text.includes(BRAND_EN)) {
      messages.push(`布局硬编码品牌名：${relOf(full)}`);
    }
  }

  for (const full of walk(path.join(ROOT, "content"), ".md")) {
    const text = fs.readFileSync(full, "utf8");
    for (const word of FORBIDDEN_BRANDS) {
      if (text.includes(word)) {
        messages.push(`出现非锁定品牌：${relOf(full)} 含「${word}」`);
      }
    }
  }

  const contact = read("content/contact/_index.md") || "";
  if (raw.includes("contact@yunji-tech.example") && !contact.includes("contact@yunji-tech.example")) {
    messages.push("联系页缺少 hugo.toml 中的商务邮箱");
  }
  if (raw.includes("400-800-2026") && !contact.includes("400-800-2026")) {
    messages.push("联系页缺少 hugo.toml 中的咨询热线");
  }
  record("品牌锁定", messages.length === 0, messages);
}

function checkPages() {
  const messages = [];
  let newsCount = 0;
  let productCount = 0;
  const today = new Date().toISOString().slice(0, 10);

  for (const full of walk(path.join(ROOT, "content"), ".md")) {
    const rel = relOf(full);
    const name = path.basename(full);
    if (name !== "_index.md" && !NAME_RE.test(name)) {
      messages.push(`文件命名不符合小写短横线：${rel}`);
    }

    const text = fs.readFileSync(full, "utf8");
    const { raw, body } = splitFrontMatter(text, FM_TOML);
    if (raw === null) {
      messages.push(`缺少 TOML front matter：${rel}`);
      continue;
    }
    const fm = parseToml(raw);
    for (const key of ["title", "date", "description"]) {
      if (!fm[key]) messages.push(`front matter 缺少 ${key}：${rel}`);
    }
    const desc = fm.description || "";
    if (desc && (desc.length < 40 || desc.length > 120)) {
      messages.push(`description 长度 ${desc.length} 字，应为 40–120 字：${rel}`);
    }
    if (fm.draft === "true") messages.push(`存在未发布稿件 draft=true：${rel}`);
    if (/^# /m.test(body)) messages.push(`正文出现一级标题：${rel}`);

    const section = path.basename(path.dirname(full));
    if (section === "news" && name !== "_index.md") {
      newsCount += 1;
      for (const key of ["date", "author"]) {
        if (!fm[key]) messages.push(`新闻缺少 ${key}：${rel}`);
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.date || "")) {
        messages.push(`新闻日期格式不合法：${rel}`);
      } else if (fm.date > today) {
        messages.push(`新闻日期晚于当前日期：${rel}`);
      }
    }
    if (section === "products" && name !== "_index.md") {
      productCount += 1;
      if (!fm.weight) messages.push(`产品缺少 weight：${rel}`);
      if (!fm.date) messages.push(`产品缺少 date：${rel}`);
    }

    for (const word of ABSOLUTE_WORDS) {
      if (text.includes(word)) messages.push(`出现绝对化表述「${word}」：${rel}`);
    }
    for (const word of PLACEHOLDERS) {
      if (text.includes(word)) messages.push(`存在占位/未确认内容「${word}」：${rel}`);
    }
  }

  if (productCount < 1) messages.push("产品页数量不足：至少 1 个");
  if (newsCount < 1) messages.push("新闻页数量不足：至少 1 个");
  record("页面完整性", messages.length === 0, messages);
}

function checkLinks() {
  const messages = [];
  for (const full of walk(path.join(ROOT, "content"), ".md")) {
    const rel = relOf(full);
    const text = fs.readFileSync(full, "utf8");
    const { body } = splitFrontMatter(text, FM_TOML);
    body.split(/\r?\n/).forEach((line, index) => {
      const matches = line.matchAll(LINK_RE);
      for (const match of matches) {
        const target = match[1].trim();
        if (target.startsWith("#")) continue;
        const exists = pageExists(target);
        if (exists === false) {
          messages.push(`失效链接：${rel}:${index + 1} -> ${target}`);
        } else if (exists === null) {
          messages.push(`相对链接需人工确认：${rel}:${index + 1} -> ${target}`);
        }
      }
    });
  }

  const config = read("hugo.toml") || "";
  for (const match of config.matchAll(/pageRef\s*=\s*"([^"]+)"/g)) {
    if (pageExists(match[1]) === false) {
      messages.push(`菜单指向不存在页面：${match[1]}`);
    }
  }
  record("链接引用", messages.length === 0, messages, "重要");
}

function checkSkills() {
  const messages = [];
  const skillRoot = path.join(ROOT, ".harness", "skills");

  for (const [name, risk] of Object.entries(SKILLS)) {
    const rel = `.harness/skills/${name}/SKILL.md`;
    const text = read(rel);
    if (text === null) {
      messages.push(`缺少 Skill：${rel}`);
      continue;
    }
    const { raw, body } = splitFrontMatter(text, FM_YAML);
    if (raw === null) {
      messages.push(`Skill 缺少 YAML front matter：${rel}`);
      continue;
    }
    const fm = parseYaml(raw);
    if (fm.name !== name) messages.push(`Skill name 与目录不一致：${rel}`);
    if (fm.risk !== risk) messages.push(`Skill 风险等级应为 ${risk}：${rel}`);
    if (!fm.description) messages.push(`Skill 缺少 description：${rel}`);
    if (!Array.isArray(fm["allowed-paths"]) || fm["allowed-paths"].length === 0) {
      messages.push(`Skill 白名单为空：${rel}`);
    }
    if (!Array.isArray(fm["denied-paths"]) || fm["denied-paths"].length === 0) {
      messages.push(`Skill 黑名单为空：${rel}`);
    }
    REQUIRED_SECTIONS.forEach((section, index) => {
      const pattern = new RegExp(`^##\\s*${index + 1}\\.\\s*${section}`, "m");
      if (!pattern.test(body)) {
        messages.push(`Skill 五段式缺少「${section}」：${rel}`);
      }
    });
    if (risk === "L3" && !text.includes("不执行") && !text.includes("不得执行")) {
      messages.push(`L3 Skill 未声明不执行边界：${rel}`);
    }
    if (!text.includes("不得自行发布")) {
      messages.push(`Skill 缺少「不得自行发布」硬约束：${rel}`);
    }
  }

  if (fs.existsSync(skillRoot)) {
    for (const entry of fs.readdirSync(skillRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (!SKILLS[entry.name] && fs.existsSync(path.join(skillRoot, entry.name, "SKILL.md"))) {
        messages.push(`发现未登记 Skill：${entry.name}`);
      }
    }
  }
  record("Skill 五段式", messages.length === 0, messages);
}

function writeReport(startedAt, finishedAt) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const passed = results.filter((item) => item.ok).length;
  const failed = results.length - passed;
  const lines = [
    "# 云际科技站点校验报告",
    "",
    `- 检查时间：${startedAt} ~ ${finishedAt}`,
    "- 执行命令：`node tools/check.mjs`（Python 不可用时的等价结构校验）",
    `- 检查项：${results.length}`,
    `- 通过：${passed}`,
    `- 失败：${failed}`,
    "",
    "## 结论",
    "",
    failed === 0 ? "全部通过，允许进入人工审核。" : "存在失败项，禁止交付，需修复后重新校验。",
    "",
    "## 检查明细",
    "",
    "| 检查项 | 结果 | 问题数 |",
    "| --- | --- | --- |",
  ];
  for (const item of results) {
    lines.push(`| ${item.name} | ${item.ok ? "通过" : "失败"} | ${item.messages.length} |`);
  }
  for (const item of results) {
    lines.push("", `### ${item.name} · ${item.ok ? "通过" : "失败"}`, "");
    if (item.messages.length) {
      for (const message of item.messages) lines.push(`- ${message}`);
    } else {
      lines.push("- 无问题");
    }
  }
  lines.push(
    "",
    "## 说明",
    "",
    "- 本报告由 Node 兜底脚本生成，不进入站点构建。",
    "- 本报告只做结构与规范检查，不包含 Hugo 构建验证。",
    "- 正式校验入口为 `python tools/ai_maint.py check`，两者规则一致，但 Node 版本不覆盖 Python 的全部运行时细节。",
    "- 校验通过仅代表结构与规范满足要求，事实性内容仍需人工确认。",
    "- 发布属于 L3 操作，须由管理员书面确认后人工执行。",
    "",
  );
  fs.writeFileSync(REPORT_FILE, lines.join("\n"), "utf8");
}

const startedAt = new Date().toLocaleString("zh-CN", { hour12: false });
checkStructure();
checkConfig();
checkBrand();
checkPages();
checkLinks();
checkSkills();
const finishedAt = new Date().toLocaleString("zh-CN", { hour12: false });
const failed = results.filter((item) => !item.ok);

console.log(`云际科技站点校验（Node 等价模式） · ${finishedAt}`);
for (const item of results) {
  console.log(`[${item.ok ? "PASS" : "FAIL"}] ${item.name}`);
  for (const message of item.messages) console.log(`       - ${message}`);
}
console.log(`汇总：${results.length - failed.length} 通过 / ${failed.length} 失败`);

writeReport(startedAt, finishedAt);
console.log("报告：.harness/reports/check-report.md");
process.exitCode = failed.length ? 1 : 0;