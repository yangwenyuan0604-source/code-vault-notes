#!/usr/bin/env node
/**
 * Obsidian → GitHub Markdown 转换器
 * 用法: node scripts/github-fy.js [--dry-run]
 */

const fs = require("fs");
const path = require("path");

const VAULT_ROOT = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(VAULT_ROOT, "docs");

const NOTE_FILES = [
  "Javase.md",
  "数据结构.md",
  "排序算法详解.md",
  "agent知识点.md",
  "项目实战.md",
];

// ====== Frontmatter → collapsible details ======
function convertFrontmatter(content) {
  if (!content.startsWith("---")) return content;

  const end = content.indexOf("---", 3);
  if (end === -1) return content;

  const yamlStr = content.slice(3, end).trim();
  const body = content.slice(end + 3).replace(/^\n+/, "");

  if (!yamlStr) return body;

  // 简单 YAML 解析（支持单行 key:val 和多行数组）
  const lines = yamlStr.split("\n");
  const rows = [];
  let inArray = false, arrayKey = "", arrayVals = [];
  for (const line of lines) {
    // 多行数组项: "  - value"
    const arrMatch = line.match(/^\s+-\s+(.+)/);
    if (arrMatch && inArray) {
      arrayVals.push(arrMatch[1].trim());
      continue;
    }
    // 上一组数组结束，写入
    if (inArray && arrayVals.length > 0) {
      rows.push(`| ${arrayKey} | \`${arrayVals.join(", ")}\` |`);
      arrayVals = [];
      inArray = false;
    }
    // 新的 key: value 行
    const m = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (m) {
      const key = m[1];
      let val = m[2].trim();
      if (val === "") {
        // 可能是多行数组开头
        inArray = true;
        arrayKey = key;
        continue;
      }
      // 去掉 YAML 方括号
      val = val.replace(/^\[|\]$/g, "");
      rows.push(`| ${key} | \`${val}\` |`);
    }
  }
  // 最后一组数组
  if (inArray && arrayVals.length > 0) {
    rows.push(`| ${arrayKey} | \`${arrayVals.join(", ")}\` |`);
  }

  if (rows.length === 0) return body;

  const details =
    "<details>\n" +
    "<summary>📋 元数据</summary>\n\n" +
    "| 属性 | 值 |\n" +
    "|------|----|\n" +
    rows.join("\n") +
    "\n\n</details>\n\n";

  return details + body;
}

// ====== Wikilink → Markdown link ======
function convertWikilinks(content) {
  // 保护代码块
  const blocks = [];
  content = content.replace(/```[\s\S]*?```/g, (m) => {
    blocks.push(m);
    return `%%BLOCK_${blocks.length - 1}%%`;
  });

  // 保护内联代码
  const inlines = [];
  content = content.replace(/`[^`]+`/g, (m) => {
    inlines.push(m);
    return `%%INLINE_${inlines.length - 1}%%`;
  });

  // ![[image.png]] → ![image.png](image.png)
  content = content.replace(
    /!\[\[([^\]]+)\]\]/g,
    (_, file) => `![${file}](${file})`
  );

  // [[note#heading|alias]]
  content = content.replace(
    /\[\[([^\]|#]+)#([^\]|]+)\|([^\]]+)\]\]/g,
    (_, note, heading, alias) =>
      `[${alias}](${note}.md#${slugify(heading)})`
  );

  // [[note#heading]]
  content = content.replace(
    /\[\[([^\]|#]+)#([^\]]+)\]\]/g,
    (_, note, heading) =>
      `[${note} - ${heading}](${note}.md#${slugify(heading)})`
  );

  // [[note|alias]]
  content = content.replace(
    /\[\[([^\]|]+)\|([^\]]+)\]\]/g,
    (_, note, alias) => `[${alias}](${note}.md)`
  );

  // [[note]]
  content = content.replace(
    /\[\[([^\]]+)\]\]/g,
    (_, note) => `[${note}](${note}.md)`
  );

  // 还原
  blocks.forEach((b, i) => {
    content = content.replace(`%%BLOCK_${i}%%`, b);
  });
  inlines.forEach((c, i) => {
    content = content.replace(`%%INLINE_${i}%%`, c);
  });

  return content;
}

function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w一-鿿-]/g, "");
}

// ====== 折叠式 callout → 普通 callout ======
function convertCallouts(content) {
  return content.replace(/> \[!(\w+)\]-/g, "> [!$1]");
}

// ====== 主流程 ======
function convertFile(filename, dryRun) {
  const src = path.join(VAULT_ROOT, filename);
  const dst = path.join(DOCS_DIR, filename);

  if (!fs.existsSync(src)) {
    console.log(`  ⚠ ${filename} — 文件不存在，跳过`);
    return false;
  }

  let content = fs.readFileSync(src, "utf-8");
  const original = content;

  content = convertFrontmatter(content);
  content = convertWikilinks(content);
  content = convertCallouts(content);

  if (content === original) {
    console.log(`  · ${filename} — 无需转换`);
  } else {
    if (!dryRun) {
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.writeFileSync(dst, content, "utf-8");
    }
    console.log(`  ✓ ${filename} → docs/${filename}`);
  }

  return true;
}

function main() {
  const dryRun = process.argv.includes("--dry-run");

  console.log("🔧 Obsidian → GitHub 转换器");
  console.log(`   源目录: ${VAULT_ROOT}`);
  console.log(`   输出目录: ${DOCS_DIR}`);
  if (dryRun) console.log("   [DRY RUN — 不写入文件]");
  console.log();

  if (!dryRun) fs.mkdirSync(DOCS_DIR, { recursive: true });

  for (const file of NOTE_FILES) {
    convertFile(file, dryRun);
  }

  console.log();
  console.log("✅ 完成！");
}

main();
