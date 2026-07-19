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
      "make["*": Entering directory "*)
        continue
        ;;
      "make["*": Leaving directory "*)
        continue
        ;;
      "make -C "*)
        continue
        ;;
      "'qjs' is up to date."*)
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

assert_eq() {
  local name="$1"
  local actual="$2"
  local expected="$3"

  if [[ "$actual" != "$expected" ]]; then
    printf 'FAIL %s\n' "$name"
    printf 'expected:\n%s\n' "$expected"
    printf 'actual:\n%s\n' "$actual"
    exit 1
  fi
  printf 'PASS %s\n' "$name"
  PASS_COUNT=$((PASS_COUNT + 1))
}

assert_contains() {
  local name="$1"
  local actual="$2"
  local expected="$3"

  if [[ "$actual" != *"$expected"* ]]; then
    printf 'FAIL %s\n' "$name"
    printf 'expected output containing:\n%s\n' "$expected"
    printf 'actual:\n%s\n' "$actual"
    exit 1
  fi
  printf 'PASS %s\n' "$name"
  PASS_COUNT=$((PASS_COUNT + 1))
}

actual="$("$CLI" eval 'mostrar 1' 2>&1)"
actual="$(normalize_output "$actual")"
assert_eq "cli-eval" "$actual" "1"

actual="$("$CLI" eval 'mostrar resultado(1, "ok").ok' 2>&1)"
actual="$(normalize_output "$actual")"
assert_eq "cli-eval-stdlib" "$actual" "true"

actual="$("$CLI" eval 'mostrar workspace(".").existe("README.md")' 2>&1)"
actual="$(normalize_output "$actual")"
assert_eq "cli-eval-host" "$actual" "true"

actual="$("$CLI" examples/ola.ptjs 2>&1)"
actual="$(normalize_output "$actual")"
assert_eq "cli-run-file" "$actual" "\"ola, mundo\""

actual="$("$CLI" native-run tests/native/ola.ptjs 2>&1)"
actual="$(normalize_output "$actual")"
assert_eq "cli-native-run" "$actual" "\"ola, mundo\""

actual="$("$CLI" asm tests/native/ola.ptjs 2>&1)"
actual="$(normalize_output "$actual")"
assert_contains "cli-asm" "$actual" ".globl main"

actual="$("$CLI" samples/doom_ptjs/src/main.ptjs wad-selftest 2>&1)"
actual="$(normalize_output "$actual")"
assert_contains "cli-doom-wad" "$actual" "\"tipo=PWAD\""

actual="$("$CLI" samples/doom_ptjs/src/main.ptjs help 2>&1)"
actual="$(normalize_output "$actual")"
assert_contains "cli-doom-help-window" "$actual" "\"  demo-janela\""
assert_contains "cli-doom-help-diagnostic" "$actual" "\"  diagnostico-video\""

actual="$("$CLI" samples/doom_ptjs/src/main.ptjs diagnostico-video 2>&1)"
actual="$(normalize_output "$actual")"
assert_contains "cli-doom-diagnostic-backend" "$actual" "\"backend=x11-host\""

actual="$("$CLI" samples/gatod_engine/src/main.ptjs help 2>&1)"
actual="$(normalize_output "$actual")"
assert_contains "cli-gatod-help" "$actual" "\"Gatod Engine\""
assert_contains "cli-gatod-help-diagnostic" "$actual" "\"  diagnostico-video\""

actual="$("$CLI" samples/gatod_engine/src/main.ptjs render-hash 2>&1)"
actual="$(normalize_output "$actual")"
assert_eq "cli-gatod-render-hash" "$actual" "\"36135531\""

actual="$("$CLI" samples/gatod_engine/src/main.ptjs diagnostico-video 2>&1)"
actual="$(normalize_output "$actual")"
assert_contains "cli-gatod-diagnostic-backend" "$actual" "\"backend=x11-host\""
assert_contains "cli-gatod-diagnostic-supported" "$actual" "\"suportado=true\""

actual="$("$CLI" version 2>&1)"
actual="$(normalize_output "$actual")"
assert_contains "cli-version" "$actual" "GatoCore alpha funcional local"
assert_contains "cli-version-native" "$actual" "Backend nativo:"

printf '\n%d CLI tests passed\n' "$PASS_COUNT"
