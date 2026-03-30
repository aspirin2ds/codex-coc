# CoC Investigator Rules + CLI Contract

## Rule Summary

1. Age range
- Use 15-89.

2. Attribute generation (default create path)
- STR/CON/DEX/APP/POW: `3d6*5`
- SIZ/INT: `(2d6+6)*5`
- EDU: `(2d6+6)*5`
- LUCK: `3d6*5`

3. Teenage rule (15-19)
- Reduce EDU by 5.
- Roll Luck twice and keep the better result.

4. Older investigator adjustments
- Age 40-49: reduce total 5 points across STR/CON/DEX.
- Age 50-59: reduce total 10 points across STR/CON/DEX.
- Age 60-69: reduce total 20 points across STR/CON/DEX.
- Age 70-79: reduce total 40 points across STR/CON/DEX.
- Age 80-89: reduce total 80 points across STR/CON/DEX.
- APP reduction for age 40+.
- EDU improvement checks scale with age.
- MOV reduces by age brackets.

5. Point budgets
- Occupation points come from a formula (for example `edu*4`, `edu*2+dex*2`).
- Interest points are `INT*2`.

6. Skill growth constraints
- `credit_rating` and `cthulhu_mythos` do not take normal growth checks.
- Interest allocation into `cthulhu_mythos` is blocked unless explicitly allowed.

## Investigator CLI Coverage

1. Core generation and validation
- `investigator create`
- `investigator derived`
- `investigator age-adjust`
- `investigator edu-improve`
- `investigator points`
- `investigator quickstart`
- `investigator validate`
- `investigator build-table`
- `investigator mov`
- `investigator export`

2. Markdown sheet workflow
- `investigator markdown create`
- `investigator markdown update`
- `investigator markdown save`
- `investigator markdown export`

3. Skills workflow
- `investigator skills catalog`
- `investigator skills allocate`
- `investigator skills validate`
- `investigator skills mark`
- `investigator skills growth-check`

## CLI Usage Reference

Use [cli-usage.md](cli-usage.md) for full command syntax and examples.

## Output Contract

Text-mode `investigator` responses use:

```text
result_type: <TYPE>
status: ok
format: key_value_text
---
<body>
```

Exceptions:
- `investigator export` with json/yaml is raw structured output.
- `investigator markdown export` with json/yaml is raw structured output.

## Budget Tracking Fields

Skills commands should preserve and report:
- `available_occupation`
- `used_occupation`
- `left_occupation`
- `available_interest`
- `used_interest`
- `left_interest`
