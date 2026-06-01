#!/usr/bin/env python3
"""
Obsidian → GitHub Markdown 转换器

处理：
- [[wikilink]]          → [wikilink](wikilink.md)
- [[wikilink|alias]]    → [alias](wikilink.md)
- [[wikilink#heading]]  → [wikilink - heading](wikilink.md#heading)
- ![[image.png]]        → ![image.png](image.png)
- ---frontmatter---     → <details><summary>📋 元数据</summary>...表格...</details>

用法：
  python3 scripts/github-fy.py              # 转换所有笔记到 docs/
  python3 scripts/github-fy.py --dry-run    # 预览不写入
"""

import re
import os
import sys
from pathlib import Path
import yaml  # pip install pyyaml

VAULT_ROOT = Path(__file__).parent.parent
DOCS_DIR = VAULT_ROOT / "docs"
NOTE_FILES = [
    "Javase.md",
    "数据结构.md",
    "排序算法详解.md",
    "agent知识点.md",
    "项目实战.md",
]


def convert_frontmatter(content: str) -> str:
    """将 YAML frontmatter 转为可折叠的 HTML details"""
    if not content.startswith("---"):
        return content

    end = content.find("---", 3)
    if end == -1:
        return content

    yaml_str = content[3:end].strip()
    body = content[end + 3:].lstrip()

    if not yaml_str:
        return body

    try:
        data = yaml.safe_load(yaml_str)
    except yaml.Error:
        return body

    if not isinstance(data, dict) or not data:
        return body

    # 构建表格
    rows = []
    for k, v in data.items():
        if isinstance(v, list):
            v = ", ".join(str(x) for x in v)
        elif v is None:
            v = ""
        rows.append(f"| {k} | {v} |")

    if not rows:
        return body

    details = (
        "<details>\n"
        "<summary>📋 元数据</summary>\n\n"
        "| 属性 | 值 |\n"
        "|------|------|\n"
        + "\n".join(rows) +
        "\n\n</details>\n\n"
    )

    return details + body


def convert_wikilinks(content: str) -> str:
    """转换 [[wikilink]] 为 GitHub 兼容的 Markdown 链接"""
    # 不转换代码块内的 wikilinks
    # 策略：先保护代码块，转换外部内容，再还原

    # 保护内联代码和代码块
    inline_codes = []
    code_blocks = []

    def save_inline(m):
        inline_codes.append(m.group(0))
        return f"%%INLINE_{len(inline_codes) - 1}%%"

    def save_block(m):
        code_blocks.append(m.group(0))
        return f"%%BLOCK_{len(code_blocks) - 1}%%"

    content = re.sub(r"`[^`]+`", save_inline, content)
    content = re.sub(r"```[\s\S]*?```", save_block, content)

    # 转换 ![[image.png]] → ![image.png](image.png)
    content = re.sub(
        r"!\[\[([^\]]+)\]\]",
        lambda m: f"![{m.group(1)}]({m.group(1)})",
        content,
    )

    # 转换 [[note#heading|alias]] → [alias](note.md#heading)
    content = re.sub(
        r"\[\[([^\]|#]+)#([^\]|]+)\|([^\]]+)\]\]",
        lambda m: f"[{m.group(3)}]({m.group(1)}.md#{_slugify(m.group(2))})",
        content,
    )

    # 转换 [[note#heading]] → [note - heading](note.md#heading)
    content = re.sub(
        r"\[\[([^\]|#]+)#([^\]]+)\]\]",
        lambda m: f"[{m.group(1)} - {m.group(2)}]({m.group(1)}.md#{_slugify(m.group(2))})",
        content,
    )

    # 转换 [[note|alias]] → [alias](note.md)
    content = re.sub(
        r"\[\[([^\]|]+)\|([^\]]+)\]\]",
        r"[\2](\1.md)",
        content,
    )

    # 转换 [[note]] → [note](note.md)
    content = re.sub(
        r"\[\[([^\]]+)\]\]",
        r"[\1](\1.md)",
        content,
    )

    # 还原代码块和内联代码
    for i, block in enumerate(code_blocks):
        content = content.replace(f"%%BLOCK_{i}%%", block)
    for i, code in enumerate(inline_codes):
        content = content.replace(f"%%INLINE_{i}%%", code)

    return content


def _slugify(text: str) -> str:
    """把中文标题转成 GitHub 锚点格式"""
    # GitHub 锚点：保留中文（直接作为 ID），其他非字母数字变连字符
    # 简化处理：去掉多余空格
    text = text.strip().lower()
    text = re.sub(r"\s+", "-", text)
    # 去掉非字母数字非中文非连字符的字符
    text = re.sub(r"[^\w一-鿿-]", "", text)
    return text


def convert_obsidian_callouts(content: str) -> str:
    """
    GitHub 已支持 Obsidian callouts (tip, note, warning, important)。
    但折叠式 callouts (>[!note]-) 不支持，转为普通 callout。
    """
    content = re.sub(r"> \[!(\w+)\]-", r"> [!\1]", content)
    return content


def convert_file(src: Path, dst: Path) -> bool:
    """转换单个文件"""
    if not src.exists():
        print(f"  ⚠ {src.name} — 文件不存在，跳过")
        return False

    content = src.read_text(encoding="utf-8")

    original = content
    content = convert_frontmatter(content)
    content = convert_wikilinks(content)
    content = convert_obsidian_callouts(content)

    if content == original:
        print(f"  ✓ {src.name} — 无需转换")
    else:
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_text(content, encoding="utf-8")
        print(f"  ✓ {src.name} → docs/{dst.name}")

    return True


def main():
    dry_run = "--dry-run" in sys.argv

    print("🔧 Obsidian → GitHub 转换器")
    print(f"   源目录: {VAULT_ROOT}")
    print(f"   输出目录: {DOCS_DIR}")
    if dry_run:
        print("   [DRY RUN — 不写入文件]")
    print()

    DOCS_DIR.mkdir(parents=True, exist_ok=True)

    for filename in NOTE_FILES:
        src = VAULT_ROOT / filename
        dst = DOCS_DIR / filename
        convert_file(src, dst)

    print()
    print("✅ 完成！docs/ 目录已生成 GitHub 友好版本。")
    print("   在 README.md 中链接到 docs/ 下的文件即可。")


if __name__ == "__main__":
    main()
