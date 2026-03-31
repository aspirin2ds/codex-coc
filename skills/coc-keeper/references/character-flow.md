# Character Flow

Use this file when you need exact prompts for onboarding players.

## Goal

Create one playable investigator at a time without overwhelming new players.
Ask one step, confirm the answer, then continue.

## Step 1: table setup

Use a short prompt like:

- `我们先逐个建卡。先告诉我这位调查员是第几位玩家，以及你想走写实、冒险、还是怪谈风。`

If the player hesitates, offer:

- `写实`: 更贴近普通人，技能分布稳
- `冒险`: 更适合进森林、追踪、救人
- `怪谈`: 更有怪癖、梦境感和神秘背景

## Step 2: existing sheet check

Ask this before starting from zero:

- `你已经有建好的调查员卡吗？如果有，直接把现有角色卡或关键数据给我，我会用当前技能内置的建卡流程整理成可直接开团的版本。`

If the player has a sheet:

- preserve their numbers first
- use the bundled investigator-building workflow to normalize, complete missing fields, and save JSON/Markdown
- only ask follow-up questions for missing identity, skills, or background hooks

If the player does not have a sheet, continue to Step 3.

## Step 3: concept

Ask for:

- name
- age idea if already known
- one-line archetype
- why they would join the search

Helpful fallback prompt:

- `给我一个职业或人物印象也行，比如“退伍猎人”“报社摄影记者”“来度假的医学生”。`

## Step 4: identity

Ask for:

- occupation
- hometown or origin
- one important person
- one visible habit or impression

If needed, propose 3 occupation options that fit the concept.

## Step 5: attributes

Resolve attribute generation before moving on.

- If the player already has numbers, keep them.
- If not, explain the chosen method briefly and collect the results.
- Do not continue into skills with unstable attributes.

Once attributes are known, note likely strengths and weaknesses in one sentence.

## Step 6: skills

Ask for three things:

- one professional strength
- one field-survival or action strength
- one personal interest

If the player is unsure, offer a compact menu that fits the occupation.

Examples:

- `侦查 / 图书馆使用 / 聆听`
- `追踪 / 导航 / 急救`
- `手枪 / 闪避 / 格斗`

## Step 7: hooks

Ask for:

- one fear, flaw, or pressure
- one reason to care about Jane, the reward, or the case
- one impression the rest of the party would remember

Keep this step short.
One strong hook is better than four bland facts.

## Step 8: finalize

When the narrative inputs are stable:

1. use the bundled rules-search workflow for any rule uncertainty
2. use the bundled investigator-building workflow to finish the sheet
3. save JSON first
4. optionally render Markdown
5. show the player a compact summary

Suggested summary shape:

- `身份`: name, age, occupation
- `强项`: top skills and standout attributes
- `弱点`: low stat or personal flaw
- `动机`: why they go into the forest

## Table pacing tips

- Build one investigator at a time unless the user explicitly wants batch intake.
- If multiple players are waiting, keep each prompt under six lines.
- After each sheet, ask whether to build the next one or start play.
