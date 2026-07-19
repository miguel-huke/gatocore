# Release Guide

## Objetivo

Checklist operacional para validar uma release local do prototipo.

## Passos

### 1. Build

```sh
make build
```

### 2. Suite

```sh
make test
```

Isso cobre:

- fixtures da linguagem
- runtime de plataforma
- smoke tests da CLI `gatocore`
- suite dedicada do backend nativo

### 3. Demo

```sh
make demo
```

### 4. Benchmark simples

```sh
make bench
```

Opcional com parametros:

```sh
make bench FILE=examples/colecao.ptjs ITERATIONS=50
```

### 5. Smoke manual da CLI

```sh
./bin/gatocore version
./bin/gatocore eval 'mostrar 1'
./bin/gatocore eval 'mostrar workspace(".").existe("README.md")'
./bin/gatocore examples/ola.ptjs
./bin/gatocore native-run tests/native/ola.ptjs
./bin/gatocore asm tests/native/ola.ptjs
./bin/gatocore repl
```

### 6. Smoke manual do runtime live

```sh
./bin/gatocore samples/snakegame.ptjs
```

Validacao minima:

- a tela limpa e redesenha
- o cursor some e volta ao sair
- o sample responde a `x` ou ao fluxo normal de fim de jogo

## Instalacao local

```sh
make install-local
```

Isso cria um link simbolico em `~/.local/bin/gatocore`.

Para remover:

```sh
make uninstall-local
```

## Resultado esperado

Uma release local e considerada valida quando:

- `make build` termina sem erro
- `make test` passa integralmente
- `make demo` mostra codigo e saida dos exemplos
- `./bin/gatocore version` responde
- pelo menos um `.ptjs` roda pela CLI principal
- pelo menos um `.ptjs` roda pelo backend nativo
- o sample live de terminal roda em TTY

## Escopo e maturidade

Esta checklist valida uma `release local alpha funcional`.

Ela nao substitui o trabalho ainda faltante para:

- sair de alpha
- virar distribuicao estavel
- rodar Doom 100% PTJS

Para esse gap maior, veja `docs/DOOM_READINESS.md`.

Para o gap de paridade de produto com ClamAV e NullClaw, veja
`docs/PRODUCT_PARITY.md`.

Para o estado e limites do backend nativo, veja `docs/backend_nativo.md`.
