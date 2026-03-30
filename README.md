# coc CLI Scaffold

This repository includes a Bun + TypeScript CLI scaffold built with Commander.js and Biome.

## Quick Start

```bash
bun install
bun run dev
```

Try the command:

```bash
bun run start -- greet world
bun cli roll check --target 60 --bonus 1
bun cli roll opposed --a 60 --b 50
bun cli roll luck --value 40
bun cli roll dice "3d6*5"
bun cli investigator create --age 28
bun cli investigator quickstart --age 28 --formula "edu*4"
```

## Roll Command

`roll` is CoC-only and supports core percentile workflows.

### Skill/Attribute Check

```bash
bun cli roll check --target 60
bun cli roll check --target 60 --bonus 1
bun cli roll check --target 60 --penalty 1
```

### Opposed Check

```bash
bun cli roll opposed --a 60 --b 50
```

### Luck Check

```bash
bun cli roll luck --value 40
```

### Normal Dice (Character Building)

```bash
bun cli roll dice "3d6*5"
bun cli roll dice "(2d6+6)*5"
```

### Output Format

`roll` outputs clean structured text (LLM/script friendly).

Example:

```text
ROLL_RESULT: COC_CHECK
mode: bonus
target: 60
ones: 4
tens: [70, 20]
candidates: [74, 24]
result: 24
outcome: HARD_SUCCESS
```

## Investigator Command

`investigator` provides helper commands for character creation based on chapter-3 formulas.

New here? Start with the beginner flow:
- [docs/investigator-sheet-flow.md](/Users/aspirin2ds/Workspace/coc/docs/investigator-sheet-flow.md)

### Investigator Data Structure

Canonical type definitions for the character-sheet model are in:

- [src/models/investigator-sheet.ts](/Users/aspirin2ds/Workspace/coc/src/models/investigator-sheet.ts)

`investigator export` now emits this schema under `sheet`.

### Investigator Output Contract

All text-mode `investigator` commands now use one envelope:

```text
result_type: <COMMAND_RESULT_TYPE>
status: ok
format: key_value_text
---
<body>
```

Notes:
- `investigator export` and `investigator markdown export` intentionally return raw JSON/YAML.
- Skill budget commands include both `used_*` and `left_*` so agents can track remaining points.

### Create Investigator

Generates STR/CON/SIZ/DEX/APP/INT/POW/EDU/LUCK, then computes HP/SAN/MP/MOV/DB/BUILD.
Age rules (attribute reductions, EDU improvement, MOV adjustment) are applied.

```bash
bun cli investigator create --age 18
bun cli investigator create --age 45
```

### Full Helper Set

```bash
# EDU checks
bun cli investigator edu-improve --edu 70 --times 2

# Apply age adjustments to existing stats
bun cli investigator age-adjust --age 50 --str 60 --con 60 --siz 60 --dex 60 --app 60 --int 60 --pow 60 --edu 60 --luck 60

# Compute skill points
bun cli investigator points --int 70 --edu 60 --formula "edu*4"

# One-shot generation + points
bun cli investigator quickstart --age 28 --formula "edu*4"

# Validate an existing sheet
bun cli investigator validate --age 25 --str 70 --con 60 --siz 80 --dex 55 --pow 65 --hp 14 --san 65 --mp 13 --mov 7 --build 1 --db +1d4

# Utility lookups
bun cli investigator build-table --str 70 --siz 80
bun cli investigator mov --str 70 --dex 55 --siz 80 --age 25

# Export as JSON or YAML
bun cli investigator export --format json --age 25
bun cli investigator export --format yaml --age 25

# Markdown sheet workflow for AI agents
bun cli investigator markdown create --output ./sheets/ada.md --age 25 --name "Ada" --occupation "Detective"
bun cli investigator markdown update --file ./sheets/ada.md --set identity.occupation=Professor --set attributes.str=80
bun cli investigator markdown save --file ./sheets/ada.md
bun cli investigator markdown export --file ./sheets/ada.md --format json

# Skills workflow (rule-aware)
bun cli investigator skills catalog --format markdown
bun cli investigator skills allocate --file ./sheets/ada.md --occupation-points 320 --interest-points 140 --set-occ library_use=70 --set-int psychology=40
# alias forms (same meaning)
bun cli investigator skills allocate --file ./sheets/ada.md --occupation-points 320 --interest-points 140 --occ library_use=70 --int psychology=40
bun cli investigator skills validate --file ./sheets/ada.md --occupation-points 320 --interest-points 140
bun cli investigator skills mark --file ./sheets/ada.md --skill library_use --skill psychology
bun cli investigator skills growth-check --file ./sheets/ada.md
# deterministic test rolls
bun cli investigator skills growth-check --file ./sheets/ada.md --fixed-roll library_use=88
```

### Derived Stats

Compute derived values from known core stats:

```bash
bun cli investigator derived --str 70 --con 60 --siz 80 --dex 55 --pow 65 --age 25
```

## Scripts

- `bun run dev`: run CLI in watch mode (`--help`)
- `bun run start -- <args>`: run CLI with arguments
- `bun cli <args>`: shortcut form for the CLI
- `bun run build`: bundle CLI to `dist/coc`
- `bun test`: run tests
- `bun run test:watch`: run tests in watch mode
- `bun run lint`: lint via Biome
- `bun run format`: format via Biome
- `bun run check`: lint + format checks (no writes)
- `bun run check:fix`: apply safe Biome fixes
- `bun run ci`: test + Biome CI checks

## Structure

- `src/`: app source code
- `src/cli.ts`: CLI entrypoint and parser setup
- `src/commands/`: command modules
- `test/`: Bun tests and preload setup
- `bunfig.toml`: Bun test preload configuration
- `biome.json`: formatter/linter config
