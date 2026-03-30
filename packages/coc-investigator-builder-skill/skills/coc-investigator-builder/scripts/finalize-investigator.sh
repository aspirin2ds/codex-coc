#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  bash scripts/finalize-investigator.sh \
    --sheet-path <path> \
    --occ-points <n> \
    --int-points <n> \
    [--era <text>] \
    [--residence <text>] \
    [--player-name <text>] \
    [--credit-rating <n>] \
    [--cash <text>] \
    [--assets <text>] \
    [--spending-level <text>]

Environment:
  COC_CLI_CMD   Command used to invoke the CLI. Defaults to "bun cli".
EOF
}

COC_CLI_CMD="${COC_CLI_CMD:-bun cli}"
SHEET_PATH=""
OCC_POINTS=""
INT_POINTS=""
ERA=""
RESIDENCE=""
PLAYER_NAME=""
CREDIT_RATING=""
CASH=""
ASSETS=""
SPENDING_LEVEL=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --sheet-path) SHEET_PATH="${2-}"; shift 2 ;;
    --occ-points) OCC_POINTS="${2-}"; shift 2 ;;
    --int-points) INT_POINTS="${2-}"; shift 2 ;;
    --era) ERA="${2-}"; shift 2 ;;
    --residence) RESIDENCE="${2-}"; shift 2 ;;
    --player-name) PLAYER_NAME="${2-}"; shift 2 ;;
    --credit-rating) CREDIT_RATING="${2-}"; shift 2 ;;
    --cash) CASH="${2-}"; shift 2 ;;
    --assets) ASSETS="${2-}"; shift 2 ;;
    --spending-level) SPENDING_LEVEL="${2-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -z "$SHEET_PATH" || -z "$OCC_POINTS" || -z "$INT_POINTS" ]]; then
  echo "Missing required values." >&2
  usage >&2
  exit 1
fi

read -r -a CLI <<< "$COC_CLI_CMD"

IDENTITY_CMD=(
  "${CLI[@]}" investigator markdown update
  --file "$SHEET_PATH"
)

if [[ -n "$ERA" ]]; then
  IDENTITY_CMD+=(--set "identity.era=$ERA")
fi
if [[ -n "$RESIDENCE" ]]; then
  IDENTITY_CMD+=(--set "identity.residence=$RESIDENCE")
fi
if [[ -n "$PLAYER_NAME" ]]; then
  IDENTITY_CMD+=(--set "identity.playerName=$PLAYER_NAME")
fi

if [[ "${#IDENTITY_CMD[@]}" -gt 4 ]]; then
  "${IDENTITY_CMD[@]}"
fi

FINANCE_CMD=(
  "${CLI[@]}" investigator markdown update
  --file "$SHEET_PATH"
)

if [[ -n "$CREDIT_RATING" ]]; then
  FINANCE_CMD+=(--set "finance.creditRating=$CREDIT_RATING")
fi
if [[ -n "$CASH" ]]; then
  FINANCE_CMD+=(--set "finance.cash=$CASH")
fi
if [[ -n "$ASSETS" ]]; then
  FINANCE_CMD+=(--set "finance.assets=$ASSETS")
fi
if [[ -n "$SPENDING_LEVEL" ]]; then
  FINANCE_CMD+=(--set "finance.spendingLevel=$SPENDING_LEVEL")
fi

if [[ "${#FINANCE_CMD[@]}" -gt 4 ]]; then
  "${FINANCE_CMD[@]}"
fi

"${CLI[@]}" investigator skills validate \
  --file "$SHEET_PATH" \
  --occupation-points "$OCC_POINTS" \
  --interest-points "$INT_POINTS"

"${CLI[@]}" investigator markdown save --file "$SHEET_PATH"
"${CLI[@]}" investigator markdown export --file "$SHEET_PATH" --format json
