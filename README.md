# COC Keeper Skill Pack

This repository now exposes a single Codex skill: `coc-keeper`.

The old `coc-rules-search` and `coc-investigator-builder` skills were refactored into bundled internal resources inside `skills/coc-keeper/`, so users only need to invoke one skill while still getting:

- local Chinese COC 7e rule lookup
- investigator creation and normalization
- live Keeper play support for `古茂密林之中`

## Layout

```text
.
├── docs/
├── play-data/
│   ├── investigators/
│   ├── sessions/
│   └── summaries/
└── skills/
    └── coc-keeper/
        ├── SKILL.md
        ├── agents/openai.yaml
        ├── references/
        │   ├── rules-search/
        │   ├── investigator-builder/
        │   ├── character-flow.md
        │   ├── scenario-runbook.md
        │   ├── live-play-patterns.md
        │   └── keeper-best-practices.md
        ├── scripts/
        ├── schemas/
        └── templates/
```

## What `coc-keeper` Contains

The exposed skill lives at [skills/coc-keeper/SKILL.md](/Users/aspirin2ds/Workspace/coc/skills/coc-keeper/SKILL.md).

Inside that one skill package:

- rules lookup lives under [references/rules-search/](/Users/aspirin2ds/Workspace/coc/skills/coc-keeper/references/rules-search)
- investigator-building guidance lives under [references/investigator-builder/](/Users/aspirin2ds/Workspace/coc/skills/coc-keeper/references/investigator-builder)
- builder scripts live under [scripts/](/Users/aspirin2ds/Workspace/coc/skills/coc-keeper/scripts)
- the normalized schema lives at [schemas/investigator-sheet.schema.json](/Users/aspirin2ds/Workspace/coc/skills/coc-keeper/schemas/investigator-sheet.schema.json)
- the Markdown sheet template lives at [templates/investigator-sheet.template.md](/Users/aspirin2ds/Workspace/coc/skills/coc-keeper/templates/investigator-sheet.template.md)

## Artifact Locations

Generated play artifacts should stay under `play-data/`:

- investigator JSON: `play-data/investigators/`
- investigator Markdown: `play-data/investigators/`
- current session state: `play-data/sessions/current-session.json`
- optional scene summaries: `play-data/summaries/`

## Usage

Invoke the single skill directly, for example:

```text
Use $coc-keeper to explain the scenario premise, build my investigator step by step, and start the adventure.
```

For rule-sensitive moments, sheet generation, and session tracking, `coc-keeper` now uses its bundled internal resources instead of depending on sibling skills.
