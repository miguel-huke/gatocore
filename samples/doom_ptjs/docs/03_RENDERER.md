# Renderer

## Objetivo

Definir a trilha de renderer para Doom PTJS.

## Estado atual

Ja existe hoje:

- janela grafica local via builtins nativos do host
- framebuffer RGBA em memoria
- renderer 2.5D por raycasting
- textura procedural em parede, ceu e piso
- sprites billboard para inimigos e pickups
- HUD, crosshair, overlay e minimapa
- fallback ASCII para debug

O que continua faltando:

- backend nativo de janela sem helper externo
- resolucao classica 320x200 com pipeline de escala dedicada
- texturas reais, paleta Doom e flats reais
- sprites reais do jogo
- clipping e casos de renderer mais proximos do original

## Escolha recomendada

Primeira versao:

- framebuffer paletizado em memoria
- upload do frame para janela SDL2
- logica de raycasting e sprites em PTJS

## Etapas

### Etapa 0: prova de janela

- abrir janela
- limpar framebuffer
- apresentar cor solida
- medir frame time

### Etapa 1: mapa wireframe

- desenhar grade do mapa
- desenhar player e direcao
- validar movimento e colisao

### Etapa 2: raycaster base

- raycasting vertical
- altura de parede
- cor por setor ou textura fake
- buffer de profundidade

### Etapa 3: textura e pisos

- texturas de parede
- flats de piso e teto
- paleta
- sombreado simples por distancia

### Etapa 4: sprites

- sprites de inimigos
- sprites de itens
- oclusao por profundidade

## Estruturas recomendadas

- `buffer_fixo` para frame bruto
- `vetor_compacto("u8")` para indices de paleta
- `vetor_compacto("u16")` para depth minima ou colunas
- `arena` para temporarios por frame

## Metas iniciais

- 320x200 interno
- escala de janela 2x ou 3x
- 35 fps como meta de compatibilidade
- 60 fps como meta de tuning

## Gaps do runtime

O projeto ainda precisa ganhar:

- fullscreen e mudanca de resolucao
- mouse look ou captura de mouse
- sincronizacao de frame mais rigida
