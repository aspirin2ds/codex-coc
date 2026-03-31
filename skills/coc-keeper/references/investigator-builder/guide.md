# Investigator Builder Guide

## Overview

Turn an investigator concept or partial sheet into a consistent, playable COC 7e investigator.
Prefer rule-grounded sheet building over improvising percentages or derived stats from memory.

## Quick Start

1. Determine what kind of build the user wants:
   - full sheet from concept
   - sheet completion from partial stats
   - cleanup or normalization of an existing sheet
   - explanation of build choices
2. Use the bundled rules-search workflow at [../rules-search/guide.md](../rules-search/guide.md) to find the governing rules first.
3. If the search result is still ambiguous, read the relevant local docs directly under `./docs`.
4. When the final attributes and occupation formula are known, run [../../scripts/calc-sheet.js](../../scripts/calc-sheet.js) to calculate and validate the repetitive math.
5. Save the normalized investigator data to JSON using [../../schemas/investigator-sheet.schema.json](../../schemas/investigator-sheet.schema.json), with the default canonical location under `play-data/investigators/`.
6. Optionally render that JSON to Markdown with [../../scripts/render-sheet-markdown.js](../../scripts/render-sheet-markdown.js) and [../../templates/investigator-sheet.template.md](../../templates/investigator-sheet.template.md), also under `play-data/investigators/` by default.
7. State assumptions clearly when the user did not provide enough inputs.

## Workflow

### 1. Gather minimum inputs

Collect whatever the user already knows:
- concept or archetype
- era or setting assumptions if relevant
- age
- rolled or chosen attributes
- occupation preference
- notable skills or weapons
- background hooks
- whether they want a short sheet or a fuller narrative sheet

If inputs are missing, make conservative assumptions and say so after the sheet.

### 2. Search the rules before deciding

Start with the bundled rules-search workflow for:
- attribute generation and age adjustments
- derived stats such as HP, SAN, MP, MOV, DB, Build
- occupation skill-point formulas and credit rating
- quick translations of skill names via `译名表.md`

Then read the local chapter directly only if the rule is still unclear.

### 2.5 Use the calculator once inputs are stable

Use [../../scripts/calc-sheet.js](../../scripts/calc-sheet.js) after the core build choices are known.
This script is the fast path for:
- SAN, MP, HP, MOV, DB, Build
- occupation points from a formula like `EDUx4` or `EDUx2+DEXx2`
- interest points and own-language baseline
- half and fifth values
- warnings about mismatched derived fields or out-of-range credit rating

Do not use it to replace rule lookup.
Use it after the rules have already told you which formula and ranges apply.

Validate the output before moving on.
The calculator step comes before any saved artifact or Markdown rendering.

### 3. Choose a build path

- Full build from concept
  Choose a fitting occupation, allocate skills, derive stats, then write background hooks.
- Partial sheet completion
  Preserve the user’s given numbers and only fill missing values.
- Normalization
  Recompute half and fifth values, derived stats, and any fields that contradict each other.

### 4. Compute before narrating

Do the crunchy parts first:
- apply age adjustments
- compute occupation and interest skill budgets
- assign credit rating within the occupation range
- compute HP, SAN, MP, MOV, DB, and Build
- compute half and fifth values where useful

Use [derived-stats.md](derived-stats.md) for the common formulas and lookup order.

### 5. Keep occupation and skills coherent

Do not assign skills randomly.
Anchor them to the chosen occupation, era, and background.
If the user asks for a specific archetype that does not map cleanly to a listed sample occupation, choose the nearest sample occupation or build a custom one with a short explanation.

### 6. Persist first, render second

Use this output order:
1. generate the data with the calculator, then validate it
2. save the data to JSON using the schema in `play-data/investigators/`
3. optionally render that JSON to Markdown with the template script in the same `play-data/investigators/` area

The JSON file is the source of truth.
Markdown is a derived presentation format, not the canonical record.

## Reference Files

- [build-workflow.md](build-workflow.md)
  End-to-end process for creating or completing a sheet.
- [derived-stats.md](derived-stats.md)
  High-signal formulas, rule order, and where to verify them.
- [output-template.md](output-template.md)
  Compact output shape for JSON-first and optional Markdown output.
- [../../scripts/calc-sheet.js](../../scripts/calc-sheet.js)
  Deterministic calculator and validator for the repetitive sheet math.
- [../../scripts/render-sheet-markdown.js](../../scripts/render-sheet-markdown.js)
  Render a normalized investigator JSON file into a Markdown sheet using the repo template.

## Constraints

- Use the bundled rules-search workflow first for rule lookup.
- If still confused, inspect `./docs` directly rather than guessing.
- Preserve user-provided numbers unless they conflict with the rules; if they conflict, say what changed and why.
- Do not invent unsupported occupation formulas when the book or a reasonable custom occupation path can be used.
- Keep the result playable and internally consistent even when the user gives incomplete inputs.
