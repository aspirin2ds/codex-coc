# Live Play Patterns

Use this file after play starts, especially when one investigator is operating alone.

## Choice presentation

When you offer choices:

- present the options cleanly
- do not append a preferred option
- do not steer unless the user asks for advice or the scene explicitly calls for out-of-character tactical help

Good pattern:

- `1. 继续追进林子`
- `2. 先回镇上补给`
- `3. 在原地埋伏观察`

Avoid:

- listing choices and then saying which one you recommend

## Single-investigator scenario handling

If the table is effectively following one investigator:

- shorten scene loops so every roll reveals or changes something important
- favor immediate sensory detail over broad party management framing
- keep NPC speech short and high-signal
- be careful with stacked failures; each failure should cost time, position, safety, or certainty, not stall the story

## Stealth and infiltration loop

For infiltration-heavy scenes, rotate through this structure:

1. approach and identify the immediate obstacle
2. ask for one meaningful action
3. resolve with a roll only if the outcome is uncertain and risky
4. reveal one new fact even on failure
5. escalate pressure after two or three actions so the scene does not flatten

Useful pressure levers:

- patrols shift
- lights move
- weather or footing worsens
- prisoners are about to be moved
- machinery starts

## Dice workflow

For live COC checks, use the local scripts instead of hand-resolving the math.

Recommended sequence:

1. roll with `roll-dice.js`
2. if the roll is a D100 skill or attribute check, pass the result into `keeper-check.js`
3. narrate the fictional outcome and cost or gain

Examples:

```bash
node skills/coc-keeper/scripts/roll-dice.js 1d100
node skills/coc-keeper/scripts/keeper-check.js --skill 70 --roll 32 --label 追踪
node skills/coc-keeper/scripts/keeper-check.js --skill 45 --roll 21 --difficulty hard --label 潜行
```

Use `keeper-check.js` when:

- resolving a skill or attribute check
- checking whether the result reaches 常规, 困难, or 极难 threshold
- distinguishing a normal failure from 大失败

Use only `roll-dice.js` when:

- rolling damage
- rolling SAN loss or other non-D100 dice
- rolling random tables

## Session tracking workflow

Use `session-state.js` when the scenario now has enough moving parts that memory alone is fragile.

Recommended moments to update state:

- after character creation completes
- after a major clue is confirmed
- after an NPC changes status
- after a rescue, chase, or failed infiltration changes the clock
- before stopping a session

Examples:

```bash
node skills/coc-keeper/scripts/session-state.js init --output tmp/coc-session.json --scenario 古茂密林之中
node skills/coc-keeper/scripts/session-state.js update --input tmp/coc-session.json --set current.day=1 --set current.timeOfDay=night --set current.location=黑水湖外圈 --push clues=简被带往黑水湖 --push npcs.safe=简
node skills/coc-keeper/scripts/session-state.js show --input tmp/coc-session.json
```

## Pause and recap workflow

When the user wants to stop or you want a clean handoff, use `scene-summary.js`.

Examples:

```bash
node skills/coc-keeper/scripts/scene-summary.js --state tmp/coc-session.json --title 黑水湖夜袭 --result strong_success --event 救出简 --event 打毁转运装置 --hook 天亮后返回贝宁顿
```

This is especially useful for:

- long sessions
- stopping at a cliffhanger
- preserving clue state between sessions

## Rescue scenes

When a prisoner rescue becomes possible:

- confirm the prisoner is alive before asking for the extraction choice
- make the escape route as important as the entry route
- if the player chooses rescue over total clearance, let that be a valid success path
- after rescue, shift quickly into pursuit, concealment, or debrief instead of leaving the scene emotionally flat

## Ending and pause points

When the user wants to stop:

- summarize what changed in the world
- state whether the current result is a setback, mixed success, or strong success
- identify the next obvious hook if play resumes
- stop cleanly without pushing another recommendation
