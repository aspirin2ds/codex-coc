# CLI Usage Catalog

All commands below assume project root and `bun cli`.

For packaged-skill usage, prefer the helper scripts under `scripts/` when you need to run a full multi-step workflow reliably.

0. Skill-local workflow helpers
```bash
bash scripts/draft-investigator.sh --help
bash scripts/apply-background.sh --help
bash scripts/finalize-investigator.sh --help
```

1. Create random investigator stats
```bash
bun cli investigator create --age <age>
# example
bun cli investigator create --age 25
```

2. Compute derived stats from given attributes
```bash
bun cli investigator derived --str <n> --con <n> --siz <n> --dex <n> --pow <n> --age <age>
# example
bun cli investigator derived --str 70 --con 60 --siz 80 --dex 55 --pow 65 --age 25
```

3. Run EDU improvement checks
```bash
bun cli investigator edu-improve --edu <edu> --times <n>
# example
bun cli investigator edu-improve --edu 70 --times 2
```

4. Apply age adjustments to existing attributes
```bash
bun cli investigator age-adjust --age <age> --str <n> --con <n> --siz <n> --dex <n> --app <n> --int <n> --pow <n> --edu <n> --luck <n>
# optional deterministic losses
bun cli investigator age-adjust --age <age> --str <n> --con <n> --siz <n> --dex <n> --app <n> --int <n> --pow <n> --edu <n> --luck <n> --str-loss <n> --con-loss <n> --dex-loss <n> --siz-loss <n>
```

5. Calculate occupation and interest points
```bash
bun cli investigator points --int <int> --formula "<formula>" [--str <n> --con <n> --siz <n> --dex <n> --app <n> --pow <n> --edu <n> --luck <n>]
# example
bun cli investigator points --int 70 --edu 60 --dex 50 --formula "edu*2+dex*2"
```

6. One-shot quickstart generation
```bash
bun cli investigator quickstart --age <age> --formula "<formula>"
# example
bun cli investigator quickstart --age 28 --formula "edu*4"
```

7. Validate provided block
```bash
bun cli investigator validate --age <age> --str <n> --con <n> --siz <n> --dex <n> --pow <n> [--app <n> --int <n> --edu <n> --luck <n> --hp <n> --san <n> --mp <n> --mov <n> --build <n> --db <value>]
```

8. DB/BUILD and MOV utility lookups
```bash
bun cli investigator build-table --str <n> --siz <n>
bun cli investigator mov --str <n> --dex <n> --siz <n> --age <age>
```

9. Export investigator snapshot (raw JSON/YAML)
```bash
bun cli investigator export --format json --age <age>
bun cli investigator export --format yaml --age <age>
```

10. Create markdown character sheet
```bash
bun cli investigator markdown create --output <sheet_path> --age <age> --name "<name>" --occupation "<occupation>" --formula "<formula>"
```

11. Update markdown sheet values
```bash
bun cli investigator markdown update --file <sheet_path> --set <path=value> [--set <path=value> ...]
# example
bun cli investigator markdown update --file ./sheets/ada.md --set identity.occupation=Professor --set attributes.str=80
```

12. Normalize/save markdown sheet
```bash
bun cli investigator markdown save --file <sheet_path>
```

13. Export embedded sheet from markdown (raw JSON/YAML)
```bash
bun cli investigator markdown export --file <sheet_path> --format json
bun cli investigator markdown export --file <sheet_path> --format yaml
```

14. Show skill catalog
```bash
bun cli investigator skills catalog --format markdown
bun cli investigator skills catalog --format json
```

15. Allocate skill points
```bash
# canonical flags
bun cli investigator skills allocate --file <sheet_path> --occupation-points <occ> --interest-points <int> --set-occ <skill=points> [--set-occ <skill=points> ...] --set-int <skill=points> [--set-int <skill=points> ...]
# alias flags
bun cli investigator skills allocate --file <sheet_path> --occupation-points <occ> --interest-points <int> --occ <skill=points> [--occ <skill=points> ...] --int <skill=points> [--int <skill=points> ...]
# optional mythos override
bun cli investigator skills allocate --file <sheet_path> --occupation-points <occ> --interest-points <int> --set-int cthulhu_mythos=5 --allow-mythos-interest
```

16. Validate skill totals and consistency
```bash
bun cli investigator skills validate --file <sheet_path> --occupation-points <occ> --interest-points <int>
```

17. Mark skills for growth checks
```bash
bun cli investigator skills mark --file <sheet_path> --skill <key> [--skill <key> ...]
```

18. Run growth checks
```bash
# random rolls
bun cli investigator skills growth-check --file <sheet_path> [--skill <key> ...]
# deterministic rolls
bun cli investigator skills growth-check --file <sheet_path> --roll <key=value> [--roll <key=value> ...]
bun cli investigator skills growth-check --file <sheet_path> --fixed-roll <key=value> [--fixed-roll <key=value> ...]
```
