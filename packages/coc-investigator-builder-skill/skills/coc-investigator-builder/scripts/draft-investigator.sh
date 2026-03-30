#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  bash scripts/draft-investigator.sh \
    --sheet-path <path> \
    --age <n> \
    --name <name> \
    --occupation <occupation> \
    --gender <gender> \
    --birthplace <birthplace> \
    --int <n> \
    --str <n> \
    --con <n> \
    --siz <n> \
    --dex <n> \
    --app <n> \
    --pow <n> \
    --edu <n> \
    --luck <n> \
    --occ-points <n> \
    --int-points <n> \
    [--formula <formula>] \
    [--occ <skill=points> ...] \
    [--int-skill <skill=points> ...]

Environment:
  COC_CLI_CMD   Command used to invoke the CLI. Defaults to "bun cli".
EOF
}

require_value() {
  local name="$1"
  local value="${2-}"
  if [[ -z "$value" ]]; then
    echo "Missing required value: $name" >&2
    usage >&2
    exit 1
  fi
}

COC_CLI_CMD="${COC_CLI_CMD:-bun cli}"
FORMULA="edu*4"

SHEET_PATH=""
AGE=""
NAME=""
OCCUPATION=""
GENDER=""
BIRTHPLACE=""
INT_VALUE=""
STR=""
CON=""
SIZ=""
DEX=""
APP=""
POW=""
EDU=""
LUCK=""
OCC_POINTS=""
INT_POINTS=""

declare -a OCC_ALLOCATIONS=()
declare -a INT_ALLOCATIONS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --sheet-path) SHEET_PATH="${2-}"; shift 2 ;;
    --age) AGE="${2-}"; shift 2 ;;
    --name) NAME="${2-}"; shift 2 ;;
    --occupation) OCCUPATION="${2-}"; shift 2 ;;
    --gender) GENDER="${2-}"; shift 2 ;;
    --birthplace) BIRTHPLACE="${2-}"; shift 2 ;;
    --int) INT_VALUE="${2-}"; shift 2 ;;
    --str) STR="${2-}"; shift 2 ;;
    --con) CON="${2-}"; shift 2 ;;
    --siz) SIZ="${2-}"; shift 2 ;;
    --dex) DEX="${2-}"; shift 2 ;;
    --app) APP="${2-}"; shift 2 ;;
    --pow) POW="${2-}"; shift 2 ;;
    --edu) EDU="${2-}"; shift 2 ;;
    --luck) LUCK="${2-}"; shift 2 ;;
    --occ-points) OCC_POINTS="${2-}"; shift 2 ;;
    --int-points) INT_POINTS="${2-}"; shift 2 ;;
    --formula) FORMULA="${2-}"; shift 2 ;;
    --occ) OCC_ALLOCATIONS+=("${2-}"); shift 2 ;;
    --int-skill) INT_ALLOCATIONS+=("${2-}"); shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

require_value "--sheet-path" "$SHEET_PATH"
require_value "--age" "$AGE"
require_value "--name" "$NAME"
require_value "--occupation" "$OCCUPATION"
require_value "--gender" "$GENDER"
require_value "--birthplace" "$BIRTHPLACE"
require_value "--int" "$INT_VALUE"
require_value "--str" "$STR"
require_value "--con" "$CON"
require_value "--siz" "$SIZ"
require_value "--dex" "$DEX"
require_value "--app" "$APP"
require_value "--pow" "$POW"
require_value "--edu" "$EDU"
require_value "--luck" "$LUCK"
require_value "--occ-points" "$OCC_POINTS"
require_value "--int-points" "$INT_POINTS"

read -r -a CLI <<< "$COC_CLI_CMD"

"${CLI[@]}" investigator markdown create \
  --output "$SHEET_PATH" \
  --age "$AGE" \
  --name "$NAME" \
  --occupation "$OCCUPATION" \
  --formula "$FORMULA"

"${CLI[@]}" investigator markdown update \
  --file "$SHEET_PATH" \
  --set "identity.sex=$GENDER" \
  --set "identity.birthplace=$BIRTHPLACE"

"${CLI[@]}" investigator points \
  --int "$INT_VALUE" \
  --formula "$FORMULA" \
  --str "$STR" \
  --con "$CON" \
  --siz "$SIZ" \
  --dex "$DEX" \
  --app "$APP" \
  --pow "$POW" \
  --edu "$EDU" \
  --luck "$LUCK"

"${CLI[@]}" investigator skills catalog --format json

ALLOCATE_CMD=(
  "${CLI[@]}" investigator skills allocate
  --file "$SHEET_PATH"
  --occupation-points "$OCC_POINTS"
  --interest-points "$INT_POINTS"
)

for entry in "${OCC_ALLOCATIONS[@]}"; do
  ALLOCATE_CMD+=(--occ "$entry")
done

for entry in "${INT_ALLOCATIONS[@]}"; do
  ALLOCATE_CMD+=(--int "$entry")
done

"${ALLOCATE_CMD[@]}"

"${CLI[@]}" investigator skills validate \
  --file "$SHEET_PATH" \
  --occupation-points "$OCC_POINTS" \
  --interest-points "$INT_POINTS"

"${CLI[@]}" investigator markdown save --file "$SHEET_PATH"
"${CLI[@]}" investigator markdown export --file "$SHEET_PATH" --format json
