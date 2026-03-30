# User-Friendly Flow: Create an Investigator Sheet

This is the fastest, beginner-friendly way to create a complete CoC 7e investigator sheet with this CLI.

## Before You Start

From project root:

```bash
bun install
```

## Step 1) Create a New Sheet File

Pick a path and basic identity fields.

```bash
bun cli investigator markdown create \
  --output ./sheets/ada.md \
  --age 25 \
  --name "Ada Lovelace" \
  --occupation "Professor" \
  --formula "edu*4"
```

What this does:
- Rolls attributes with age rules applied.
- Computes derived stats.
- Creates a markdown sheet with embedded JSON.
- Stores occupation and interest point budgets in notes.

## Step 2) Add Optional Identity Details

```bash
bun cli investigator markdown update \
  --file ./sheets/ada.md \
  --set identity.era=1920s \
  --set identity.residence=London \
  --set identity.birthplace=London \
  --set identity.sex=F
```

Tip: You can run `markdown update` many times.

## Step 3) Allocate Skills

Use the budgets from your sheet notes (for example `occupation_points=240`, `interest_points=140`):

```bash
bun cli investigator skills allocate \
  --file ./sheets/ada.md \
  --occupation-points 240 \
  --interest-points 140 \
  --set-occ library_use=70 \
  --set-occ history=60 \
  --set-occ credit_rating=40 \
  --set-int psychology=40 \
  --set-int spot_hidden=40 \
  --set-int first_aid=30 \
  --set-int listen=30
```

## Step 4) Validate the Sheet

```bash
bun cli investigator markdown save --file ./sheets/ada.md
bun cli investigator skills validate --file ./sheets/ada.md --occupation-points 240 --interest-points 140
```

Goal: `valid: true`

If invalid, adjust allocations and run validate again.

## Step 5) Preview / Export

```bash
# Show canonical JSON from the markdown sheet
bun cli investigator markdown export --file ./sheets/ada.md --format json
```

Your finalized sheet remains at `./sheets/ada.md`.

## One-Block Quickstart

Copy-paste this to run the full flow:

```bash
bun cli investigator markdown create --output ./sheets/ada.md --age 25 --name "Ada Lovelace" --occupation "Professor" --formula "edu*4"
bun cli investigator markdown update --file ./sheets/ada.md --set identity.era=1920s --set identity.residence=London --set identity.birthplace=London --set identity.sex=F
bun cli investigator skills allocate --file ./sheets/ada.md --occupation-points 240 --interest-points 140 --set-occ library_use=70 --set-occ history=60 --set-occ credit_rating=40 --set-int psychology=40 --set-int spot_hidden=40 --set-int first_aid=30 --set-int listen=30
bun cli investigator markdown save --file ./sheets/ada.md
bun cli investigator skills validate --file ./sheets/ada.md --occupation-points 240 --interest-points 140
bun cli investigator markdown export --file ./sheets/ada.md --format json
```
