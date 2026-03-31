# Build Workflow

Use this workflow when creating or finishing a COC investigator sheet.

## 1. Start from what the user already knows

Possible inputs:
- concept or job fantasy
- age
- rolled attributes
- desired profession
- preferred strengths or weak points
- language or birthplace
- notable weapon or signature item
- background hooks

If the user only gives a loose concept, build a sensible default and note assumptions.

## 2. Look up rules through the bundled rules-search workflow

Start with:
- [../rules-search/guide.md](../rules-search/guide.md)

Use it to locate:
- `docs/part-007-第三章-创建调查员.md`
- `docs/part-009-第五章-游戏系统.md`
- `docs/part-020-第十六章-附录.md`
- `docs/part-021-译名表.md` when English or mixed skill names are involved

If the search still leaves uncertainty, read the relevant `./docs` file directly.

## 3. Build in this order

1. Decide age and apply age adjustments first.
2. Lock the final primary attributes.
3. Choose occupation.
4. Compute occupation skill points from the occupation formula.
5. Allocate occupation skills, including Credit Rating within the occupation range.
6. Compute and allocate interest skill points from `INT x 2`.
7. Fill combat-facing and practical sheet fields.
8. Add background hooks and any useful builder-only metadata such as key connection.
9. Run `node skills/coc-keeper/scripts/calc-sheet.js` once the final inputs are stable.
10. Validate the computed result and resolve contradictions.
11. Save the normalized sheet as schema-valid JSON under `play-data/investigators/`.
12. Keep that JSON as the only persisted investigator artifact.

The script does not choose the occupation for you.
It accelerates the math and catches contradictions once you know the formula and CR range.

## 4. Occupation choice heuristics

- Prefer a sample occupation from the book when one clearly fits.
- If the concept is close but not exact, use the nearest occupation and explain the reskin briefly.
- If the concept is truly custom, follow the chapter guidance for a custom occupation:
  - use 8 occupation skills
  - avoid making all skills too narrow or too one-note
  - keep Credit Rating plausible for the concept

## 5. Skill allocation rules of thumb

- Occupation points should mostly support the profession.
- Interest points should express personality, hobbies, side training, and survival gaps.
- Give at least a few practical scenario-facing skills when the concept allows it.
- Do not put interest points into `克苏鲁神话` unless the user explicitly wants a nonstandard starting state and acknowledges it.
- When `格斗` or `射击` appears generically, choose a specialization before assigning points.

## 6. Sheet quality checks

Before saving the JSON, verify:
- age adjustments were applied once
- EDU improvements, if any, were applied after age choice
- Credit Rating stays inside the occupation range
- derived stats match final attributes
- MOV uses final STR/DEX/SIZ plus age effects
- half and fifth values match the final totals
- the background does not contradict the occupation or CR

Use the calculator warnings as a first pass, then do a quick human check.
Once the JSON is correct, update that JSON directly instead of generating a second presentation file.

## 7. If the user asks for a fast build

Return a compact playable sheet with:
- name, age, occupation
- attributes
- derived stats
- 8 to 12 most relevant skills
- short background
- assumptions
