#!/usr/bin/env node
/**
 * 修复根目录笔记，让 GitHub 能正常渲染
 * - 转换 [[wikilinks]] → [wikilink](wikilink.md)（不破坏 Obsidian 功能）
 * - 保留 frontmatter（Obsidian 需要）
 * - 不转换 callouts（GitHub 原生支持）
 */

const fs = require("fs");
const path = require("path");

const VAULT_ROOT = path.resolve(__dirname, "..");
const NOTE_FILES = [
  "Javase.md",
  "数据结构.md",
  "排序算法详解.md",
  "agent知识点.md",
  "项目实战.md",
];

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

function fixFile(filename, dryRun) {
  const filepath = path.join(VAULT_ROOT, filename);

  if (!fs.existsSync(filepath)) {
    console.log(`  ⚠ ${filename} — 不存在，跳过`);
    return;
  }

  let content = fs.readFileSync(filepath, "utf-8");
  const original = content;

  content = convertWikilinks(content);

  if (content === original) {
    console.log(`  · ${filename} — 无需修改`);
    return;
  }

  if (!dryRun) {
    fs.writeFileSync(filepath, content, "utf-8");
  }
  console.log(`  ✓ ${filename} — wikilinks 已转换`);
}

function main() {
  const dryRun = process.argv.includes("--dry-run");

  console.log("🔧 修复根目录笔记（wikilinks → 标准链接）");
  if (dryRun) console.log("   [DRY RUN — 不写入文件]");
  console.log();

  for (const file of NOTE_FILES) {
    fixFile(file, dryRun);
  }

  console.log();
  console.log("✅ 完成！Obsidian 仍能正常使用这些笔记。");
}

main();
