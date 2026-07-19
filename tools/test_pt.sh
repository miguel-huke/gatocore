#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENGINE_DIR="$ROOT_DIR/engines/quickjs"
QJS="$ENGINE_DIR/qjs"
PT_STDLIB="$ROOT_DIR/stdlib/ptstdlib.js"
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
  local mode="$3"
  local actual
  local expected
  local status
  local -a cmd

  cmd=("$QJS")
  if [[ "$mode" == "pt" ]]; then
    cmd+=("--std" "--lang=pt" "-I" "$PT_STDLIB")
  fi
  cmd+=("$program")

  set +e
  actual="$("${cmd[@]}" </dev/null 2>&1)"
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

run_error_case() {
  local program="$1"
  local expected_file="$2"
  local mode="$3"
  local actual
  local expected
  local status
  local -a cmd

  cmd=("$QJS")
  if [[ "$mode" == "pt" ]]; then
    cmd+=("--std" "--lang=pt" "-I" "$PT_STDLIB")
  fi
  cmd+=("$program")

  set +e
  actual="$("${cmd[@]}" </dev/null 2>&1)"
  status=$?
  set -e
  actual="$(normalize_output "$actual")"
  expected="$(<"$expected_file")"

  if [[ $status -eq 0 || "$actual" != *"$expected"* ]]; then
    printf 'FAIL %s\n' "${program#$ROOT_DIR/}"
    printf 'expected error containing:\n%s\n' "$expected"
    printf 'actual:\n%s\n' "$actual"
    return 1
  fi

  printf 'PASS %s\n' "${program#$ROOT_DIR/}"
  PASS_COUNT=$((PASS_COUNT + 1))
}

make -C "$ENGINE_DIR" qjs >/dev/null
cd "$ROOT_DIR"

if command -v rg >/dev/null 2>&1; then
  test_files() {
    (
      cd "$ROOT_DIR/tests"
      rg --files . -g '*.ptjs' -g '*.js' -g '!native/**' \
        | sed "s#^\\./#$ROOT_DIR/tests/#"
    ) | LC_ALL=C sort
  }
else
  test_files() {
    find "$ROOT_DIR/tests" \
      -path "$ROOT_DIR/tests/native" -prune -o \
      -type f \( -name '*.ptjs' -o -name '*.js' \) -print | LC_ALL=C sort
  }
fi

while IFS= read -r program; do
  case "$program" in
    *.ptjs)
      base="${program%.ptjs}"
      mode="pt"
      ;;
    *.js)
      base="${program%.js}"
      mode="js"
      ;;
    *)
      printf 'FAIL %s\n' "${program#$ROOT_DIR/}"
      printf 'unsupported test extension for %s\n' "${program#$ROOT_DIR/}"
      exit 1
      ;;
  esac
  if [[ -f "${base}.out" ]]; then
    run_success_case "$program" "${base}.out" "$mode"
  elif [[ -f "${base}.err" ]]; then
    run_error_case "$program" "${base}.err" "$mode"
  else
    printf 'FAIL %s\n' "${program#$ROOT_DIR/}"
    printf 'missing expectation file for %s\n' "${program#$ROOT_DIR/}"
    exit 1
  fi
done < <(test_files)

printf '\n%d tests passed\n' "$PASS_COUNT"
