# CoC Investigator Builder Skill

Publishable npm package for the `coc-investigator-builder` agent skill.

## Contents

- `skills/coc-investigator-builder/SKILL.md`
- `skills/coc-investigator-builder/agents/openai.yaml`
- `skills/coc-investigator-builder/references/*`

## Install

```bash
npm install coc-investigator-builder-skill
```

Then sync packaged skills from `node_modules` into your agent:

```bash
npx skills experimental_sync
```

## Publish Checklist

- Replace the package name if needed.
- Set the real `license`.
- Run `npm pack --dry-run` or `npm publish --dry-run`.
