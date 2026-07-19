# Gameplay e Logica

## Objetivo

Mapear os modulos de gameplay que ainda faltam.

## Modulos obrigatorios

- `jogo`
- `mundo`
- `mapa`
- `player`
- `camera`
- `colisao`
- `entidades`
- `armas`
- `projeteis`
- `inimigos`
- `hud`
- `menus`

## Fluxos centrais

### Loop

- ler input
- atualizar estado
- resolver colisao
- disparar eventos
- renderizar

### Combate

- ataque do player
- hit detection
- dano em alvo
- resposta do inimigo
- morte

### Progressao

- inicio da fase
- coleta de item
- abertura de porta
- gatilho de script
- saida da fase

## Ordem de implementacao

1. player + colisao
2. mundo + setores
3. uma arma
4. um inimigo
5. HUD
6. menus

## Regras de projeto

- dados do mapa separados de logica de entidade
- update deterministico quando possivel
- temporarios por frame em `arena`
- listas quentes em estruturas compactas quando a escala crescer
