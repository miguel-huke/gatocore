#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLI="$ROOT_DIR/bin/gatocore"
PASS_COUNT=0

normalize_output() {
  local input="$1"
  local line
  local out=""
  local first=1

  while IFS= read -r line; do
    case "$line" in
      "flatpak: error while loading shared libraries:"*)
        continue
        ;;
    esac
    if [[ $first -eq 1 ]]; then
      out="$line"
      first=0
    else
      out+=$'\n'"$line"
    fi
  done <<< "$input"

  printf '%s' "$out"
}

run_success_case() {
  local program="$1"
  local expected_file="$2"
  local actual
  local expected
  local status

  set +e
  actual="$("$CLI" native-run "$program" </dev/null 2>&1)"
  status=$?
  set -e
  actual="$(normalize_output "$actual")"
  expected="$(<"$expected_file")"

  if [[ $status -ne 0 ]]; then
    printf 'FAIL %s\n' "${program#$ROOT_DIR/}"
    printf 'expected success but command exited with status %d\n' "$status"
    printf 'actual:\n%s\n' "$actual"
    return 1
  fi

  if [[ "$actual" != "$expected" ]]; then
    printf 'FAIL %s\n' "${program#$ROOT_DIR/}"
    printf 'expected:\n%s\n' "$expected"
    printf 'actual:\n%s\n' "$actual"
    return 1
  fi

  printf 'PASS %s\n' "${program#$ROOT_DIR/}"
  PASS_COUNT=$((PASS_COUNT + 1))
}

for program in "$ROOT_DIR"/tests/native/*.ptjs; do
  base="${program%.ptjs}"
  if [[ ! -f "${base}.out" ]]; then
    printf 'FAIL %s\n' "${program#$ROOT_DIR/}"
    printf 'missing expectation file for %s\n' "${program#$ROOT_DIR/}"
    exit 1
  fi
  run_success_case "$program" "${base}.out"
done

printf '\n%d native tests passed\n' "$PASS_COUNT"
