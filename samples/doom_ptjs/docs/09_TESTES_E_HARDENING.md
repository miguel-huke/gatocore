# Testes e Hardening

## Objetivo

Fechar o gap de qualidade para um projeto deste porte.

## Tipos de teste

- unitario
- integracao
- regressao visual
- regressao de assets
- smoke do jogo
- stress test

## Suites necessarias

### Parser e linguagem

- includes encadeados
- arquivos grandes
- corner cases de parser

### Assets

- WAD valido
- WAD corrompido
- lump faltando
- offset invalido

### Gameplay

- movimento
- colisao
- dano
- pickup
- troca de fase

### Renderer

- frame basico
- paredes
- sprites
- regressao por hash do frame

## Hardening do projeto principal

Tambem faltam:

- fuzzing do parser
- fuzzing do runtime
- multiplataforma
- smoke de TTY e de janela

## Criterios de aceite

- sem crash em assets invalidos conhecidos
- sem leak obvio em ciclo de jogo prolongado
- sem regressao visual nos mapas de referencia
