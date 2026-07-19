#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
QJS="$ROOT_DIR/engines/quickjs/qjs"
PT_STDLIB="$ROOT_DIR/stdlib/ptstdlib.js"
FILE="${1:-$ROOT_DIR/examples/colecao.ptjs}"
ITERATIONS="${2:-100}"

if [[ ! -f "$FILE" ]]; then
  printf 'benchmark: arquivo nao encontrado: %s\n' "$FILE" >&2
  exit 1
fi

if ! [[ "$ITERATIONS" =~ ^[0-9]+$ ]] || [[ "$ITERATIONS" -lt 1 ]]; then
  printf 'benchmark: numero de iteracoes invalido: %s\n' "$ITERATIONS" >&2
  exit 1
fi

start_ns="$(date +%s%N)"
for ((i = 0; i < ITERATIONS; i++)); do
  "$QJS" --std --lang=pt -I "$PT_STDLIB" "$FILE" >/dev/null
done
end_ns="$(date +%s%N)"

elapsed_ns=$((end_ns - start_ns))
elapsed_ms=$((elapsed_ns / 1000000))
avg_ms=$((elapsed_ms / ITERATIONS))

printf 'Arquivo: %s\n' "${FILE#$ROOT_DIR/}"
printf 'Iteracoes: %s\n' "$ITERATIONS"
printf 'Tempo total: %s ms\n' "$elapsed_ms"
printf 'Tempo medio: %s ms\n' "$avg_ms"
