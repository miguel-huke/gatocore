# Gatod Engine

## Objetivo

Registrar a base atual do `Gatod Engine`, sample de engine/editor em PTJS
inspirado em stacks como Godot, e mapear o que foi entregue versus o que ainda
falta para uma paridade mais alta.

## Referencia externa usada

Como referencia de produto e arquitetura, o alvo comparativo atual e a linha
estavel mais recente do Godot `4.6.1`, mantendo tambem compatibilidade mental
com a linha `4.6`.

## Blocos de produto observados no Godot moderno

Os grupos abaixo resumem o que um engine/editor estilo Godot precisa cobrir.

- editor com project manager, scene tree, inspector, filesystem dock e output
- sistema de `nodes`, `scenes`, `resources` e serializacao
- viewport e renderer 2D/3D
- input map, sinais, scripting e tool scripts
- animacao, timeline e playback
- audio buses e mixers
- fisica 2D/3D, colisao e areas
- importacao/exportacao de assets e builds
- plugins de editor, depuracao, profiling e configuracao de projeto

## Entregue nesta base

Hoje o `samples/gatod_engine/` ja entrega:

- editor local com janela grafica nativa do host via `video_*`
- suporte de mouse no editor desktop Linux atual
- scene tree
- inspector editavel
- filesystem/assets dock
- painel de scripts e timeline
- editor de script integrado com preview, snippets e salvamento local
- timeline visual com keyframes editaveis
- viewport 2D em pixels
- play/stop
- nodes basicos: `Node2D`, `Sprite2D`, `Camera2D`, `Control`, `Label`, `TileMap`
- configuracao de projeto
- salvamento e carregamento de cena em JSON
- input map simples
- animacao simples
- fisica 2D simples para demo local
- hooks de plugin e monitoramento/profiler basicos
- importacao real de assets com metadata e carga de cena JSON
- buses de audio locais com mixagem simples e meters
- command palette e export de bundle local
- teste automatizado de estado, serializacao, render hash e termos de stdlib

## O que ainda falta para paridade alta

- renderer 3D real
- pipeline de shader/material de verdade
- audio buses e mixer completos em nivel de produto
- pipeline completo de importacao/renderizacao de imagens, audio, malhas, fontes e cenas externas
- export templates e builds multiplataforma
- navegacao, particles, light2d/light3d e fisica mais completa
- debugger, monitoramento e profiler em nivel de produto
- compilador/exportador no nivel de produto do Godot
- editor de script com linguagem, refatoracao e depuracao integrados

## Relacao com o projeto principal

O `Gatod Engine` existe para provar que PTJS ja consegue sustentar um editor
de engine local com viewport e toolchain visual.

Ele `nao` significa que o GatoCore ja tenha substituido um engine do porte do
Godot. Ele mostra a direcao e a fundacao pratica dentro do runtime atual.

O detalhamento indexado do que ja ganhou solucao, do que esta parcial e do que
segue aberto fica em `docs/GATOD_SOLUTIONS_INDEX.md`.
