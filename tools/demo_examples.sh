#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
QJS="$ROOT_DIR/engines/quickjs/qjs"
PT_STDLIB="$ROOT_DIR/stdlib/ptstdlib.js"

cd "$ROOT_DIR"

if command -v rg >/dev/null 2>&1; then
  example_files() {
    rg --files "$ROOT_DIR/examples" -g '*.ptjs' | LC_ALL=C sort
  }
else
  example_files() {
    find "$ROOT_DIR/examples" -type f -name '*.ptjs' | LC_ALL=C sort
  }
fi

while IFS= read -r file; do
  rel="${file#$ROOT_DIR/}"
  printf '========================================\n'
  printf 'Arquivo: %s\n' "$rel"
  printf 'Comando:\n'
  printf '  %s --std --lang=pt -I %s %s\n' "./engines/quickjs/qjs" "stdlib/ptstdlib.js" "$rel"
  printf '\nCodigo:\n'
  nl -ba "$file"
  printf '\nSaida:\n'
  "$QJS" --std --lang=pt -I "$PT_STDLIB" "$file"
  printf '\n'
done < <(example_files)
