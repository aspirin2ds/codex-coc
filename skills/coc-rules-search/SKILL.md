---
name: coc-rules-search
description: Search the local Chinese Call of Cthulhu 7th Edition rulebook split under `./docs` and answer rules questions with precise file references, anchors, and chapter guidance. Use when Codex needs to look up COC mechanics, sanity, combat, chases, magic, keeper rulings, appendix summaries, or terminology from this workspace instead of guessing from memory.
---

# COC Rules Search

## Overview

Find the right local rulebook passages quickly, then answer with grounded references instead of fuzzy recollection.
Prefer targeted `rg` searches and chapter-level lookups over loading whole books into context.

## Quick Start

1. Identify the question type before searching:
   - Core mechanics, skill checks, bonus/penalty dice, pushing rolls, luck, opposed rolls
   - Combat, firearms, maneuvers, damage, healing
   - Chases and movement
   - Sanity, madness, mythos books, magic
   - Keeper advice, scenario running, NPC rulings
   - Appendix summaries, weapons, price tables, terminology
2. Read [references/source-map.md](references/source-map.md) to choose the smallest relevant source set.
3. Run `rg -n` against the specific chapter files first, not the entire `docs/` tree unless the topic is unclear.
4. Open only the matching files or anchors you need.
5. Answer with:
   - the rule conclusion
   - the file path(s) searched
   - the chapter or anchor that supports the answer
   - any ambiguity caused by translation or duplicate coverage in the appendix summary

## Search Workflow

### 1. Narrow the topic

Translate natural-language questions into likely rule terms from the book.

Examples:
- "push a roll" -> `孤注一骰`
- "bonus die" -> `奖励骰`
- "penalty die" -> `惩罚骰`
- "fight back" or "maneuver" -> `反击|战技|闪避`
- "temporary insanity" -> `临时性疯狂|疯狂发作`
- "chase movement actions" -> `行动点|位置|追逐`

### 2. Search the smallest source set

Use the chapter map in [references/source-map.md](references/source-map.md).
If you need exact terms or grep seeds, use [references/search-patterns.md](references/search-patterns.md).
If the question is player-facing, start with [references/player-rules-guide.md](references/player-rules-guide.md).
If the question is keeper-facing, start with [references/keeper-rules-guide.md](references/keeper-rules-guide.md).

### 3. Prefer targeted `rg` commands

Typical commands:

```bash
rg -n "孤注一骰|奖励骰|惩罚骰|对抗检定" docs/part-009-第五章-游戏系统.md docs/part-020-第十六章-附录.md
rg -n "战技|闪避|反击|寻找掩体|重伤|濒死" docs/part-010-第六章-战斗.md docs/part-020-第十六章-附录.md
rg -n "行动点|位置|追逐轮|险境|障碍" docs/part-011-第七章-追逐.md docs/part-020-第十六章-附录.md
rg -n "理智检定|临时性疯狂|不定性疯狂|疯狂发作|最大理智值" docs/part-012-第八章-理智.md docs/part-014-第十章-主持游戏.md docs/part-020-第十六章-附录.md
rg -n "神话典籍|泛读|精读|法术|POW|成为相信者" docs/part-013-第九章-魔法.md docs/part-015-第十一章-可怖传说书籍.md docs/part-016-第十二章-法术.md docs/part-020-第十六章-附录.md
```

Search all docs only when the keyword itself is uncertain:

```bash
rg -n "信用评级|灵感检定|洞察检定|孤注一骰" docs
```

### 4. Cross-check summary vs full rule text

The appendix is excellent for quick confirmation, but prefer the chapter body when the user needs full procedure or edge cases.
Use appendix summaries to confirm terminology, page regions, and quick tables.

### 5. Cite the local evidence

When answering, name the exact files that support the rule.
If the rulebook gives chapter anchors in the markdown, cite the relevant section heading as well.
If the answer depends on interpretation, label it as an inference from the referenced passages.

## Reference Files

- [references/source-map.md](references/source-map.md)
  Topic-to-file map for the local rulebook.
- [references/player-rules-guide.md](references/player-rules-guide.md)
  Fast map for player-facing mechanics and the most common lookups.
- [references/keeper-rules-guide.md](references/keeper-rules-guide.md)
  Keeper-facing guidance, adjudication topics, and scenario-running lookups.
- [references/search-patterns.md](references/search-patterns.md)
  Ready-to-use Chinese search terms and `rg` patterns for common questions.

## Constraints

- Do not answer from general COC memory when the workspace docs can be searched.
- Do not quote long passages; summarize and point to the source file.
- Do not scan unrelated chapters if the question already maps cleanly to one or two files.
- Note translation-sensitive terms when Chinese wording may differ from English community jargon.
