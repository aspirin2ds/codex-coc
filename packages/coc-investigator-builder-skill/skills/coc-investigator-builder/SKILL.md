---
name: coc-investigator-builder
description: Build a Call of Cthulhu 7e investigator sheet through a Keeper-style guided conversation using coc CLI commands. Use when the user wants a simple, user-friendly creation flow with minimal questions, temporary sheet drafting, occupation-aligned skill prefill, and final validation/save.
---

# CoC Investigator Builder

Use:
- [references/coc-investigator-rules.md](references/coc-investigator-rules.md)
- [references/cli-usage.md](references/cli-usage.md)
- [references/example-investigator-sheet.md](references/example-investigator-sheet.md)
- `scripts/draft-investigator.sh` for the initial draft + skill allocation pass
- `scripts/apply-background.sh` for backstory fields
- `scripts/finalize-investigator.sh` for final identity/finance updates and validation

The bundled rules summary is self-contained and meant to travel with this package.

## Conversation Rules

1. Ask one question at a time.
2. Keep questions minimal, warm, and in Keeper voice.
3. Wait for user response before next step.
4. After each response, summarize captured values in one line.
5. If user says `change`, apply update and return to confirmation.
6. Default unknowns instead of blocking:
- Sheet path default: `./sheets/<character-name-slug>.md`
- Occupation formula default: `edu*4`

## Keeper Voice

Sound like a real CoC Keeper:
- Calm, atmospheric, and invitational.
- Briefly explain consequences when asking choices (especially age).
- Avoid rules-dumps unless player asks for detail.
- Use short scene-like prompts, not form-like prompts.

Example tone:
- `Welcome, investigator. Let's put your file together. First, what name is written on the case folder?`

## Simplified Building Flow

1. Welcome and ask name.

Prompt:
- `Welcome, investigator. What is your character's name?`

2. Ask age and gender with short effect explanation.

Prompt:
- `How old is your investigator, and what gender should I record? Age matters: young investigators trade EDU for better luck, while older investigators gain EDU checks but lose some physical edge.`

3. Ask occupation and birthplace.

Prompt:
- `What is their occupation, and where were they born?`

4. Draft temporary sheet, auto-fill as much as possible, and ask for draft confirmation.

Preferred helper:
```bash
bash scripts/draft-investigator.sh \
  --sheet-path <sheet_path> \
  --age <age> \
  --name "<name>" \
  --occupation "<occupation>" \
  --gender "<gender>" \
  --birthplace "<birthplace>" \
  --int <int> \
  --str <str> \
  --con <con> \
  --siz <siz> \
  --dex <dex> \
  --app <app> \
  --pow <pow> \
  --edu <edu> \
  --luck <luck> \
  --occ-points <occ_points> \
  --int-points <int_points> \
  --occ <skill=points> \
  --int-skill <skill=points>
```

Fallback raw commands:
```bash
bun cli investigator markdown create --output <sheet_path> --age <age> --name "<name>" --occupation "<occupation>" --formula "edu*4"
bun cli investigator markdown update --file <sheet_path> --set identity.sex="<gender>" --set identity.birthplace="<birthplace>"
bun cli investigator points --int <int> --formula "edu*4" --str <str> --con <con> --siz <siz> --dex <dex> --app <app> --pow <pow> --edu <edu> --luck <luck>
bun cli investigator skills catalog --format json
bun cli investigator skills allocate --file <sheet_path> --occupation-points <occ_points> --interest-points <int_points> --occ <skill=points> --occ <skill=points> --int <skill=points>
bun cli investigator skills validate --file <sheet_path> --occupation-points <occ_points> --interest-points <int_points>
bun cli investigator markdown save --file <sheet_path>
bun cli investigator markdown export --file <sheet_path> --format json
```

Occupation-based skill prefill guidance:
- Pick 6-10 occupation-relevant skills from catalog.
- Spend most occupation points on those core skills.
- Spend interest points on personality/background-aligned skills.
- Avoid allocating interest points to `cthulhu_mythos` unless explicitly requested.

Ask:
- `I drafted your preliminary investigator sheet. Confirm this draft, or tell me what to change before we continue?`

5. Ask background hints (with examples), then apply.

Prompt:
- `Give me a few background hints (short lines are fine): personality, beliefs, significant person, meaningful place, treasured item, and one key connection. Example: "Calm but relentless reporter; believes truth matters; mentor is Editor Chen."`

Preferred helper:
```bash
bash scripts/apply-background.sh \
  --sheet-path <sheet_path> \
  --personal-description "<...>" \
  --ideology-beliefs "<...>" \
  --significant-people "<...>" \
  --meaningful-locations "<...>" \
  --treasured-possessions "<...>" \
  --traits "<...>" \
  --key-connection "<...>"
```

Fallback raw commands:
```bash
bun cli investigator markdown update --file <sheet_path> --set background.personalDescription="<...>" --set background.ideologyBeliefs="<...>" --set background.significantPeople="<...>" --set background.meaningfulLocations="<...>" --set background.treasuredPossessions="<...>" --set background.traits="<...>" --set background.keyConnection="<...>"
bun cli investigator markdown save --file <sheet_path>
```

6. Ask for remaining optional details in one pass.

Collect:
- `era`, `residence`, `playerName`
- `finance.creditRating`, `finance.cash`, `finance.assets`, `finance.spendingLevel`
- possessions and combat notes/weapons
- status conditions

Prompt:
- `Any final details to add (era, residence, player name, money/assets, gear, weapon, current conditions)? If not, say 'skip'.`

Preferred helper:
```bash
bash scripts/finalize-investigator.sh \
  --sheet-path <sheet_path> \
  --occ-points <occ_points> \
  --int-points <int_points> \
  --era "<...>" \
  --residence "<...>" \
  --player-name "<...>" \
  --credit-rating <n> \
  --cash "<...>" \
  --assets "<...>" \
  --spending-level "<...>"
```

Fallback raw commands:
```bash
bun cli investigator markdown update --file <sheet_path> --set identity.era="<...>" --set identity.residence="<...>" --set identity.playerName="<...>"
bun cli investigator markdown update --file <sheet_path> --set finance.creditRating=<n> --set finance.cash="<...>" --set finance.assets="<...>" --set finance.spendingLevel="<...>"
bun cli investigator markdown save --file <sheet_path>
```

7. Final confirmation, then validate/save.

Preferred helper:
```bash
bash scripts/finalize-investigator.sh --sheet-path <sheet_path> --occ-points <occ_points> --int-points <int_points>
```

Fallback raw commands:
```bash
bun cli investigator skills validate --file <sheet_path> --occupation-points <occ_points> --interest-points <int_points>
bun cli investigator markdown save --file <sheet_path>
bun cli investigator markdown export --file <sheet_path> --format json
```

Ask:
- `Your investigator file is complete. Final confirm to save, or send changes as path=value pairs.`

If confirmed:
- Return saved file path and final exported JSON.
