# Modulos e Escala

## Objetivo

Definir como o projeto deve crescer sem colapsar em um unico arquivo PTJS.

## Problema

O repositorio atual ja suporta includes e scripts maiores, mas Doom exige:

- muitos arquivos
- ordem clara de bootstrap
- interfaces de modulo
- testes por subsistema

## Convencoes recomendadas

- um modulo por arquivo
- nomes claros por dominio
- arquivo `main.ptjs` apenas como orquestrador
- `include` centralizado em bootstrap
- modulos retornando fabrica ou namespace explicito

## Pastas recomendadas

- `src/bootstrap`
- `src/runtime`
- `src/assets`
- `src/renderer`
- `src/audio`
- `src/game`
- `src/ui`
- `src/debug`

## Contratos

Cada modulo deve declarar:

- o que exporta
- o que depende
- qual estado possui
- qual custo de frame possui

## Gaps do GatoCore

Para codigo desta escala, o projeto principal ainda precisa:

- hardening de parser para bases maiores
- mais testes de includes profundos
- guias fortes de organizacao de modulos
