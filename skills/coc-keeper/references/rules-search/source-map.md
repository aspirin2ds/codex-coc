# Source Map

Use this file first to choose the smallest relevant slice of `./docs`.

## Core rulebook map

| Topic | Primary files | What to look for |
| --- | --- | --- |
| Investigator creation, derived stats, credit rating | `docs/part-007-第三章-创建调查员.md` | attributes, occupations, skill points, equipment, cash/assets |
| Skill definitions and examples | `docs/part-008-第四章-技能.md` | what a skill covers, example uses, opposition hints |
| Core mechanics | `docs/part-009-第五章-游戏系统.md` | skill checks, difficulty, pushing rolls, bonus/penalty dice, luck, opposed rolls |
| Combat | `docs/part-010-第六章-战斗.md` | initiative, fighting back, dodge, maneuvers, firearms, wounds, healing |
| Chases | `docs/part-011-第七章-追逐.md` | setup, locations, movement actions, hazards, conflicts |
| Sanity and madness | `docs/part-012-第八章-理智.md` | sanity checks, temporary/indefinite insanity, recovery |
| Mythos magic overview | `docs/part-013-第九章-魔法.md` | mythos books, casting, believing, POW growth |
| Keeper advice and rulings | `docs/part-014-第十章-主持游戏.md` | adjudication, clue delivery, failed sanity checks, action scenes |
| Mythos tomes | `docs/part-015-第十一章-可怖传说书籍.md` | CMI/CMF, sanity costs, study times, examples |
| Spell list | `docs/part-016-第十二章-法术.md` | individual spells, costs, casting time, variants |
| Alien tech and monsters | `docs/part-017-第十三章-外星科技及其造物.md`, `docs/part-018-第十四章-怪物野兽和异界诸神.md` | monster stats, sanity loss, abilities |
| Scenario text | `docs/part-019-第十五章-模组.md` | examples, premade scenes, not usually the first stop for rules |
| Quick summaries and tables | `docs/part-020-第十六章-附录.md` | glossary, weapon list, system summaries, chase/sanity/magic summaries |
| Translation crosswalk | `docs/part-021-译名表.md` | English-Chinese names for skills, tomes, deities, spells |

## Recommended search order

1. Use the chapter body first for full rules.
2. Use the appendix to confirm summaries and tables.
3. Use the translation table when the user asks in English or mixed terminology.
4. Use `docs/index.md` only when you are unsure which chapter owns the topic.

## Common question routing

- "How does pushing a roll work?" -> `part-009`, then `part-020`
- "How do firearms and cover work?" -> `part-010`, then `part-020`
- "How do I run a chase?" -> `part-011`, then `part-020`
- "When does temporary insanity trigger?" -> `part-012`, then `part-014`, then `part-020`
- "How do mythos books increase Cthulhu Mythos?" -> `part-013`, `part-015`
- "What should the keeper do when players fail a clue roll?" -> `part-014`

## High-frequency mechanic bundles

- Luck checks and luck spending
  Search: `幸运检定|花费幸运值|幸运池`
  Files: `docs/part-009-第五章-游戏系统.md`, `docs/part-014-第十章-主持游戏.md`, `docs/part-020-第十六章-附录.md`
- Development and improvement between scenarios
  Search: `幕间成长|技能成长|训练`
  Files: `docs/part-009-第五章-游戏系统.md`
- Credit rating, cash, and spending level
  Search: `信用评级|调查员开支|资产|现金|消费水平`
  Files: `docs/part-007-第三章-创建调查员.md`, `docs/part-009-第五章-游戏系统.md`, `docs/part-020-第十六章-附录.md`
- Major wounds, dying, and stabilization
  Search: `重伤|濒死|急救|医学|生命值`
  Files: `docs/part-010-第六章-战斗.md`, `docs/part-014-第十章-主持游戏.md`, `docs/part-020-第十六章-附录.md`
- Firearms edge cases and cover
  Search: `寻找掩体|故障|连发|自动射击|射程`
  Files: `docs/part-010-第六章-战斗.md`, `docs/part-020-第十六章-附录.md`
- Quick value lookups
  Search: `半值|五分之一|速查`
  Files: `docs/part-020-第十六章-附录.md`
- Appendix tables
  Search: `武器列表|物价表|术语表|规则摘要`
  Files: `docs/part-020-第十六章-附录.md`

## Notes

- The markdown files often expose useful L2 anchors near the top. Use those headings in citations.
- `docs/part-020-第十六章-附录.md` is a high-value quick reference but not always sufficient for edge cases.
