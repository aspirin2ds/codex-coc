# COC Skills for Codex

This repository is a small local skill pack for running **Call of Cthulhu 7th Edition** workflows inside Codex.
It combines three reusable skills with a Chinese rulebook split into searchable Markdown, a local scenario module, and a handful of helper scripts for sheet math, dice, and session state.

The current pack is built around three jobs:

- `coc-rules-search`: search the local Chinese 7e rules and answer with grounded file references
- `coc-investigator-builder`: create, complete, normalize, and render investigator sheets
- `coc-keeper`: act as Keeper, guide character creation step by step, and run the local scenario `古茂密林之中`

## Repository Layout

```text
.
├── docs/
│   ├── index.md
│   ├── index.jsonl
│   ├── part-001-...part-021-...
│   └── 古茂密林之中-整理版.md
├── skills/
│   ├── coc-investigator-builder/
│   ├── coc-keeper/
│   └── coc-rules-search/
└── tmp/
```

## Skills

### `coc-rules-search`

Use this first when a request depends on actual rules text instead of memory.

What it does:

- searches the local Chinese rulebook under [`docs/`](/Users/aspirin2ds/Workspace/coc/docs)
- maps common topics like combat, sanity, chases, magic, and terminology to the smallest relevant source set
- answers with exact file references and chapter guidance

Useful files:

- [`skills/coc-rules-search/SKILL.md`](/Users/aspirin2ds/Workspace/coc/skills/coc-rules-search/SKILL.md)
- [`skills/coc-rules-search/references/source-map.md`](/Users/aspirin2ds/Workspace/coc/skills/coc-rules-search/references/source-map.md)
- [`skills/coc-rules-search/references/search-patterns.md`](/Users/aspirin2ds/Workspace/coc/skills/coc-rules-search/references/search-patterns.md)

Typical uses:

- “How does pushed roll work in Chinese 7e?”
- “What are the sanity rules for temporary insanity?”
- “Find the chase rules and point me to the right chapter.”

### `coc-investigator-builder`

Use this when Codex needs to turn a concept or partial sheet into a playable investigator.

What it does:

- searches rules first through `coc-rules-search`
- computes derived stats and skill budgets with helper scripts
- normalizes output into JSON
- optionally renders a Markdown investigator sheet

Useful files:

- [`skills/coc-investigator-builder/SKILL.md`](/Users/aspirin2ds/Workspace/coc/skills/coc-investigator-builder/SKILL.md)
- [`skills/coc-investigator-builder/scripts/calc-sheet.js`](/Users/aspirin2ds/Workspace/coc/skills/coc-investigator-builder/scripts/calc-sheet.js)
- [`skills/coc-investigator-builder/scripts/render-sheet-markdown.js`](/Users/aspirin2ds/Workspace/coc/skills/coc-investigator-builder/scripts/render-sheet-markdown.js)
- [`skills/coc-investigator-builder/schemas/investigator-sheet.schema.json`](/Users/aspirin2ds/Workspace/coc/skills/coc-investigator-builder/schemas/investigator-sheet.schema.json)
- [`skills/coc-investigator-builder/templates/investigator-sheet.template.md`](/Users/aspirin2ds/Workspace/coc/skills/coc-investigator-builder/templates/investigator-sheet.template.md)

Typical uses:

- build a full 1920s investigator from a short concept
- complete a partial sheet without overwriting user-provided stats
- recompute half/fifth values, HP, SAN, MP, MOV, DB, and Build
- render a clean Markdown sheet from normalized JSON

### `coc-keeper`

Use this when Codex should act like a Keeper instead of only answering rules questions.

What it does:

- guides investigator creation one step at a time
- coordinates with `coc-investigator-builder` for sheet finalization
- uses `coc-rules-search` when rulings matter
- supports live play for the local scenario `古茂密林之中`
- tracks dice, checks, scene state, and summaries with helper scripts

Useful files:

- [`skills/coc-keeper/SKILL.md`](/Users/aspirin2ds/Workspace/coc/skills/coc-keeper/SKILL.md)
- [`skills/coc-keeper/references/character-flow.md`](/Users/aspirin2ds/Workspace/coc/skills/coc-keeper/references/character-flow.md)
- [`skills/coc-keeper/references/scenario-runbook.md`](/Users/aspirin2ds/Workspace/coc/skills/coc-keeper/references/scenario-runbook.md)
- [`docs/古茂密林之中-整理版.md`](/Users/aspirin2ds/Workspace/coc/docs/古茂密林之中-整理版.md)
- [`skills/coc-keeper/scripts/roll-dice.js`](/Users/aspirin2ds/Workspace/coc/skills/coc-keeper/scripts/roll-dice.js)
- [`skills/coc-keeper/scripts/keeper-check.js`](/Users/aspirin2ds/Workspace/coc/skills/coc-keeper/scripts/keeper-check.js)
- [`skills/coc-keeper/scripts/session-state.js`](/Users/aspirin2ds/Workspace/coc/skills/coc-keeper/scripts/session-state.js)
- [`skills/coc-keeper/scripts/scene-summary.js`](/Users/aspirin2ds/Workspace/coc/skills/coc-keeper/scripts/scene-summary.js)

Typical uses:

- onboard a new group into COC 7e in Chinese
- build investigators conversationally instead of dumping a full questionnaire
- run a scene with actual D100 rolls and success-band checks
- pause and resume a session with lightweight state tracking

## How The Skills Fit Together

The intended flow is:

1. Use `coc-rules-search` whenever a ruling or formula matters.
2. Use `coc-investigator-builder` to create or normalize investigator sheets.
3. Use `coc-keeper` to run onboarding and live play, calling the other two skills as needed.

In practice:

- `coc-rules-search` is the lookup layer
- `coc-investigator-builder` is the sheet-construction layer
- `coc-keeper` is the table-running layer

## Local Rulebook Content

The repo includes a local Chinese Markdown split of the COC 7e material under [`docs/`](/Users/aspirin2ds/Workspace/coc/docs), including:

- the core rules by chapter
- an index in [`docs/index.md`](/Users/aspirin2ds/Workspace/coc/docs/index.md)
- an auxiliary search file in [`docs/index.jsonl`](/Users/aspirin2ds/Workspace/coc/docs/index.jsonl)
- the local scenario draft [`docs/古茂密林之中-整理版.md`](/Users/aspirin2ds/Workspace/coc/docs/古茂密林之中-整理版.md)

These docs are meant to be searched directly from the workspace instead of relying on memory.

## Using This Repo In Codex

If you want Codex to use these skills as local skill folders:

1. Keep this repository available as a workspace.
2. Point Codex at the relevant skill directories under [`skills/`](/Users/aspirin2ds/Workspace/coc/skills).
3. Trigger the skills by name when prompting, for example:

```text
Use $coc-rules-search to find the sanity rule for temporary insanity.
Use $coc-investigator-builder to finish this 28-year-old journalist sheet.
Use $coc-keeper to run the opening of 古茂密林之中 in Chinese.
```

If your Codex setup expects installed skills under a separate skills directory, copy or symlink the individual folders from [`skills/`](/Users/aspirin2ds/Workspace/coc/skills) into that location.

## Script Notes

This repo includes Node-based helper scripts used by the skills.
The lockfile shows a minimal dependency setup centered on `commander`, but there is currently no checked-in `package.json`.

If you plan to execute the scripts directly, verify your local Node environment first and add a project manifest if you want a standard install flow.

## Status

This repository currently provides:

- a searchable local Chinese 7e rules corpus
- three focused Codex skills
- helper scripts for character building and Keeper workflows

What it does not yet provide:

- a packaged installer for Codex skills
- a top-level test or build workflow
- a standardized output directory for generated investigator artifacts
