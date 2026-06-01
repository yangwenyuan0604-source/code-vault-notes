#!/bin/bash
# 一键转换 + 提交 + 推送
set -e
cd "$(dirname "$0")/.."

echo "📝 转换 Obsidian 笔记 → GitHub 友好格式..."
node scripts/github-fy.js

echo ""
echo "📦 提交 docs/ ..."
git add docs/ README.md scripts/
git commit -m "docs: update GitHub-friendly notes + README" || echo "   无变更，跳过提交"

echo ""
echo "📤 推送到 GitHub..."
git push origin master

echo ""
echo "✅ 完成！"
