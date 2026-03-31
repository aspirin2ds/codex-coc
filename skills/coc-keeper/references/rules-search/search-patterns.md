# Search Patterns

Use these Chinese terms and `rg` patterns to find rules quickly in `./docs`.

## Core mechanics

```bash
rg -n "何时掷骰|技能检定|孤注一骰|复数玩家|大失败|大成功|对抗检定|奖励骰|惩罚骰|幸运" docs/part-009-第五章-游戏系统.md
rg -n "游戏系统摘要|速查|术语表" docs/part-020-第十六章-附录.md
```

## Skills and opposed checks

```bash
rg -n "对抗技能|难度等级|技能专攻|技能列表" docs/part-008-第四章-技能.md docs/part-009-第五章-游戏系统.md
```

## Combat

```bash
rg -n "战斗轮|斗殴|闪避|反击|战技|射击|寻找掩体|伤害|重伤|濒死|急救|医学" docs/part-010-第六章-战斗.md docs/part-020-第十六章-附录.md
```

## Chases

```bash
rg -n "建立追逐|切入正题|位置|行动点|险境|障碍|追逐轮|冲突" docs/part-011-第七章-追逐.md docs/part-020-第十六章-附录.md
```

## Sanity and madness

```bash
rg -n "理智检定|最大理智值|疯狂|疯狂发作|临时性疯狂|不定性疯狂|永久性疯狂|恢复" docs/part-012-第八章-理智.md docs/part-014-第十章-主持游戏.md docs/part-020-第十六章-附录.md
```

## Magic, tomes, and spells

```bash
rg -n "神话典籍|阅读魔法书|泛读|精读|使用魔法|成为相信者|POW" docs/part-013-第九章-魔法.md docs/part-015-第十一章-可怖传说书籍.md
rg -n "法术列表|消耗|施法用时|理智值|魔法值" docs/part-016-第十二章-法术.md docs/part-020-第十六章-附录.md
```

## Keeper guidance

```bash
rg -n "新手守秘人|非玩家角色|掷骰与检定|掌控游戏节奏|灵感检定|发放信息|洞察检定|使用规则|动作场景|展现神话的恐怖|失败的理智检定" docs/part-014-第十章-主持游戏.md
```

## Translation and cross-language terms

Use this when the user asks in English or with mixed fandom terminology.

```bash
rg -n "Dodge|Stealth|Spot Hidden|Cthulhu Mythos|Shotgun|Rifle|Bind|Summon" docs/part-021-译名表.md
```

## English-to-Chinese lookup bridge

Use `docs/part-021-译名表.md` first for official translated skill, tome, creature, and spell names. When the English term is community jargon rather than a direct glossary item, search with the likely Chinese book term below.

| English or mixed jargon | Search Chinese terms first | Main files |
| --- | --- | --- |
| push roll / pushed roll | `孤注一骰` | `docs/part-009-第五章-游戏系统.md` |
| bonus die / penalty die | `奖励骰|惩罚骰` | `docs/part-009-第五章-游戏系统.md`, `docs/part-020-第十六章-附录.md` |
| opposed roll | `对抗检定` | `docs/part-009-第五章-游戏系统.md` |
| hard / extreme success | `困难成功|极难成功|困难|极难` | `docs/part-009-第五章-游戏系统.md`, `docs/part-020-第十六章-附录.md` |
| fight back | `反击|对抗检定|斗殴` | `docs/part-010-第六章-战斗.md`, `docs/part-009-第五章-游戏系统.md` |
| maneuver / fighting maneuver | `战技` | `docs/part-010-第六章-战斗.md`, `docs/part-020-第十六章-附录.md` |
| major wound | `重伤` | `docs/part-010-第六章-战斗.md`, `docs/part-020-第十六章-附录.md` |
| dying / stabilization | `濒死|急救|医学` | `docs/part-010-第六章-战斗.md`, `docs/part-014-第十章-主持游戏.md`, `docs/part-020-第十六章-附录.md` |
| spend luck / luck pool | `花费幸运值|幸运池|幸运检定` | `docs/part-009-第五章-游戏系统.md`, `docs/part-014-第十章-主持游戏.md` |
| cover / dive for cover | `寻找掩体` | `docs/part-010-第六章-战斗.md`, `docs/part-020-第十六章-附录.md` |
| malfunction | `故障` | `docs/part-010-第六章-战斗.md`, `docs/part-020-第十六章-附录.md` |
| chase locations / movement actions | `位置|行动点|追逐轮` | `docs/part-011-第七章-追逐.md`, `docs/part-020-第十六章-附录.md` |
| temporary insanity / indefinite insanity | `临时性疯狂|不定性疯狂|疯狂发作` | `docs/part-012-第八章-理智.md`, `docs/part-020-第十六章-附录.md` |
| credit rating | `信用评级` | `docs/part-007-第三章-创建调查员.md`, `docs/part-009-第五章-游戏系统.md`, `docs/part-021-译名表.md` |
| library use / spot hidden / fast talk / psychology | `图书馆使用|侦查|话术|心理学` | `docs/part-021-译名表.md`, `docs/part-008-第四章-技能.md` |
| bind / summon / contact deity | `束缚术|召唤术|通神术|联络术` | `docs/part-021-译名表.md`, `docs/part-016-第十二章-法术.md` |

## Appendix-heavy queries

```bash
rg -n "武器列表|物价表|术语表|游戏系统摘要|近战规则摘要|射击规则摘要|追逐规则摘要|理智规则摘要|魔法规则摘要|速查|半值|五分之一" docs/part-020-第十六章-附录.md
```

## High-frequency edge-case bundles

```bash
rg -n "花费幸运值|幸运检定|幸运池" docs/part-009-第五章-游戏系统.md docs/part-014-第十章-主持游戏.md
rg -n "幕间成长|技能成长|训练|信用评级与调查员开支" docs/part-009-第五章-游戏系统.md
rg -n "重伤|濒死|急救|医学|寻找掩体|故障|自动射击|连发" docs/part-010-第六章-战斗.md docs/part-020-第十六章-附录.md
```

## Broad fallback

When you only have a fuzzy phrase:

```bash
rg -n "关键词1|关键词2|关键词3" docs
```

Prefer 2 to 6 highly specific terms over a single broad word.
