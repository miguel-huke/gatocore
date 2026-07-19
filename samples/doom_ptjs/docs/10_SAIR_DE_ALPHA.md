# Sair de Alpha

## Objetivo

Traduzir a secao de `docs/DOOM_READINESS.md` sobre alpha em entregaveis.

## Bloco 1: contrato de linguagem

Falta:

- congelar gramatica por versao
- definir politica de compatibilidade
- marcar o que e estavel
- marcar o que e experimental

## Bloco 2: testes

Falta:

- regressao maior
- casos invalidos pesados
- stress tests
- fuzzing
- validacao multiplataforma

## Bloco 3: distribuicao

Falta:

- pacote fora do repositorio
- release versionada
- changelog
- artefatos de build

## Bloco 4: CI

Falta:

- Linux
- macOS
- Windows
- smoke de CLI
- smoke de TTY
- smoke de samples grandes

## Bloco 5: docs de usuario

Falta:

- tutorial
- troubleshooting
- referencia mais completa
- guia de instalacao

## Condicao de saida de alpha

O projeto pode deixar de ser alpha quando:

- contrato de linguagem estiver congelado por release
- parser estiver endurecido
- CI rodar em matriz minima
- distribuicao estiver empacotada
- docs de usuario estiverem publicaveis
