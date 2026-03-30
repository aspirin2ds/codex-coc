#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  bash scripts/apply-background.sh \
    --sheet-path <path> \
    [--personal-description <text>] \
    [--ideology-beliefs <text>] \
    [--significant-people <text>] \
    [--meaningful-locations <text>] \
    [--treasured-possessions <text>] \
    [--traits <text>] \
    [--key-connection <text>]

Environment:
  COC_CLI_CMD   Command used to invoke the CLI. Defaults to "bun cli".
EOF
}

COC_CLI_CMD="${COC_CLI_CMD:-bun cli}"
SHEET_PATH=""

PERSONAL_DESCRIPTION=""
IDEOLOGY_BELIEFS=""
SIGNIFICANT_PEOPLE=""
MEANINGFUL_LOCATIONS=""
TREASURED_POSSESSIONS=""
TRAITS=""
KEY_CONNECTION=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --sheet-path) SHEET_PATH="${2-}"; shift 2 ;;
    --personal-description) PERSONAL_DESCRIPTION="${2-}"; shift 2 ;;
    --ideology-beliefs) IDEOLOGY_BELIEFS="${2-}"; shift 2 ;;
    --significant-people) SIGNIFICANT_PEOPLE="${2-}"; shift 2 ;;
    --meaningful-locations) MEANINGFUL_LOCATIONS="${2-}"; shift 2 ;;
    --treasured-possessions) TREASURED_POSSESSIONS="${2-}"; shift 2 ;;
    --traits) TRAITS="${2-}"; shift 2 ;;
    --key-connection) KEY_CONNECTION="${2-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -z "$SHEET_PATH" ]]; then
  echo "Missing required value: --sheet-path" >&2
  usage >&2
  exit 1
fi

read -r -a CLI <<< "$COC_CLI_CMD"

UPDATE_CMD=(
  "${CLI[@]}" investigator markdown update
  --file "$SHEET_PATH"
)

if [[ -n "$PERSONAL_DESCRIPTION" ]]; then
  UPDATE_CMD+=(--set "background.personalDescription=$PERSONAL_DESCRIPTION")
fi
if [[ -n "$IDEOLOGY_BELIEFS" ]]; then
  UPDATE_CMD+=(--set "background.ideologyBeliefs=$IDEOLOGY_BELIEFS")
fi
if [[ -n "$SIGNIFICANT_PEOPLE" ]]; then
  UPDATE_CMD+=(--set "background.significantPeople=$SIGNIFICANT_PEOPLE")
fi
if [[ -n "$MEANINGFUL_LOCATIONS" ]]; then
  UPDATE_CMD+=(--set "background.meaningfulLocations=$MEANINGFUL_LOCATIONS")
fi
if [[ -n "$TREASURED_POSSESSIONS" ]]; then
  UPDATE_CMD+=(--set "background.treasuredPossessions=$TREASURED_POSSESSIONS")
fi
if [[ -n "$TRAITS" ]]; then
  UPDATE_CMD+=(--set "background.traits=$TRAITS")
fi
if [[ -n "$KEY_CONNECTION" ]]; then
  UPDATE_CMD+=(--set "background.keyConnection=$KEY_CONNECTION")
fi

if [[ "${#UPDATE_CMD[@]}" -eq 4 ]]; then
  echo "No background fields were provided." >&2
  exit 1
fi

"${UPDATE_CMD[@]}"
"${CLI[@]}" investigator markdown save --file "$SHEET_PATH"
