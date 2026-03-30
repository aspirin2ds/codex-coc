# Derived Stats

Use this file for the common calculations that make or break sheet consistency.

## Rule lookup order

1. Search via `$coc-rules-search`.
2. Confirm in `docs/part-007-第三章-创建调查员.md`.
3. Use `docs/part-020-第十六章-附录.md` for glossary or quick confirmation.
4. Run `node skills/coc-investigator-builder/scripts/calc-sheet.js` once the inputs are final.

## Primary creation reminders

- Roll or assign the eight core attributes first.
- Apply age adjustments before locking the final sheet.
- EDU improvements from age brackets can change the final EDU value.

## Direct formulas from the creation chapter

- `SAN` starts equal to `POW`
- `MP` equals `POW / 5`, rounded down in practice when needed
- `兴趣技能点` equals `INT x 2`
- `母语` starts at `EDU`

## Common derived values

- `HP` uses `(CON + SIZ) / 10`, rounded down
- `DB` and `Build` come from `STR + SIZ` via the chapter table
- `MOV` depends on the relation among `STR`, `DEX`, and `SIZ`, then may be reduced by age
- half value uses floor division by 2
- fifth value uses floor division by 5

## Age adjustments to verify

Use the creation chapter for exact brackets. Common checkpoints:
- ages 15-19 reduce `STR + SIZ` and reduce `EDU`, but allow better luck roll selection
- ages 20-39 get EDU improvement checks
- older brackets add more EDU improvement checks and reduce physical stats and APP
- age-based `MOV` reductions apply after the base MOV comparison

## Credit rating and wealth

- Credit Rating is not free flavor text; it must fit the occupation range
- Starting `CR` affects lifestyle, cash, and assets
- If the user wants a richer or poorer version of the same job, shift CR within the allowed range rather than changing the occupation immediately

## When in doubt

- search `年龄|教育增强检定|伤害加值|体格|生命值|魔法值|理智|信用评级`
- then inspect the exact sections in `docs/part-007-第三章-创建调查员.md`

## Do not guess

If the exact `DB/Build` band or occupation formula is unclear from memory, look it up before finalizing the sheet.

## Script usage

Example:

```bash
node skills/coc-investigator-builder/scripts/calc-sheet.js <<'JSON'
{
  "age": 32,
  "ageAdjustmentsApplied": true,
  "eduImprovementsApplied": true,
  "attributes": {
    "STR": 55,
    "CON": 60,
    "SIZ": 65,
    "DEX": 50,
    "APP": 45,
    "INT": 75,
    "POW": 60,
    "EDU": 80,
    "LUCK": 50
  },
  "occupation": {
    "name": "古文物学家",
    "pointsFormula": "EDUx4",
    "creditRating": "30-70"
  },
  "creditRating": 50
}
JSON
```

The script returns JSON with:
- computed derived values
- occupation and interest budgets
- half/fifth maps
- validation warnings
