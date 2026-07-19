# Gap Index

## Objetivo

Detalhar tudo que ainda falta para o projeto `Doom 100% PTJS`, expandindo os
itens de `docs/DOOM_READINESS.md` em entregaveis concretos.

## Bloco 1: jogo em si

Ja existe hoje:

- loop principal basico
- tela de titulo
- fluxo de vitoria e derrota
- jogador, camera e controle
- colisao com mapa
- armas, municao e dano basicos
- monstros simples com perseguicao curta
- HUD e feedback base

Ainda falta implementar:

- menu principal
- menu de pausa
- fluxo de inicio de fase
- fluxo de fim de fase
- portas, chaves e triggers
- armas, municao e dano no nivel do original
- monstros, IA e pathing no nivel do original
- projeteis, impactos e morte
- HUD, feedback e telas completos

Entregaveis minimos:

- mover pelo mapa
- atirar
- causar dano
- receber dano
- concluir fase

## Bloco 2: renderer

Ja existe hoje:

- framebuffer RGBA
- upload do frame para janela GTK
- renderer 2.5D em pixel art
- paredes, ceu, piso e sprites basicos
- profundidade por coluna
- escala de janela fixa

Ainda falta implementar:

- renderer paletizado
- pisos e tetos no nivel do original
- sprites reais de entidades
- Z e clipping mais proximos do original
- escalonamento de resolucao mais forte
- modo debug de colisoes e raycasts

Decisao recomendada:

- criar backend de host via SDL2 como trilha principal

## Bloco 3: audio

Ja existe hoje:

- efeitos procedurais
- musica procedural simples
- disparo por evento de gameplay

Ainda falta implementar:

- mixer
- volumes independentes
- fila de eventos de audio
- sincronizacao com gameplay e menus

## Bloco 4: WAD e assets

Falta implementar:

- leitor binario de WAD
- parser de cabecalho
- parser de diretorio de lumps
- validacao de limites e offsets
- leitura de PLAYPAL
- leitura de COLORMAP
- leitura de mapas
- leitura de patches, flats e sprites
- normalizacao de erros de asset

## Bloco 5: superficie para projeto grande

Falta implementar:

- convencoes de modulos por arquivo
- bootstrap modular
- contratos de include
- carregamento ordenado de dependencias
- testes de bases grandes
- regras de naming e de layout

## Bloco 6: performance

Falta implementar:

- benchmark de frame time
- benchmark de parse de WAD
- benchmark de renderer
- benchmark de colisao
- benchmark de sprites
- profiling por modulo
- metas de frame e memoria

## Bloco 7: sair de alpha

Falta implementar:

- contrato de linguagem
- politica de compatibilidade
- regressao maior
- fuzzing
- multiplataforma
- distribuicao empacotada
- changelog
- artefatos de build
- docs de usuario final

## Prioridade recomendada

P0:

- renderer de janela
- WAD reader
- loop principal
- mapa + colisao
- player + input

P1:

- paredes, pisos, tetos
- sprites e entidades
- armas e inimigos
- HUD
- audio base

P2:

- menus completos
- musica
- tuning de performance
- hardening multiplataforma
- polishing de release
