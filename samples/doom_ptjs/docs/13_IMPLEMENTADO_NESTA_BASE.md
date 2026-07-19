# Implementado Nesta Base

## Objetivo

Registrar o que ja virou codigo real dentro de `samples/doom_ptjs/`.

## Entregue agora

- bootstrap modular em `src/bootstrap/`
- configuracao inicial do projeto em `src/bootstrap/config.ptjs`
- profiler e metricas simples em `src/debug/`
- leitor de WAD com fixture em memoria em `src/assets/wad.ptjs`
- mapa de demo e colisao base em `src/game/`
- player com movimento, strafe, rotacao, vida, armadura e municao em `src/game/player.ptjs`
- entidades em `src/game/entities.ptjs` com inimigos, pickups e combate hitscan
- renderer ASCII com raycasting de debug em `src/renderer/`
- renderer em pixel buffer com textura procedural, sprites billboard,
  minimapa, crosshair e arma em `src/renderer/pixels.ptjs`
- HUD de jogo, overlay de titulo, vitoria e derrota em `src/ui/hud.ptjs`
- backend de janela local em `src/runtime/window.ptjs` sobre builtins
  nativos de video do host
- sintese local de efeitos e musica em loop em `src/runtime/audio.ptjs`
- loop live de terminal e de janela com fallback diagnostico em
  `src/runtime/terminal.ptjs`
- comando principal em `src/main.ptjs`
- testes de WAD, frame, movimento, combate, pickup, audio e pixel frame em
  `tests/doom/`

## Comandos que funcionam hoje

```sh
./bin/gatocore samples/doom_ptjs/src/main.ptjs frame
./bin/gatocore samples/doom_ptjs/src/main.ptjs wad-selftest
./bin/gatocore samples/doom_ptjs/src/main.ptjs profiler
./bin/gatocore samples/doom_ptjs/src/main.ptjs demo
./bin/gatocore samples/doom_ptjs/src/main.ptjs demo-janela
./bin/gatocore samples/doom_ptjs/src/main.ptjs diagnostico-video
```

## O que isso prova

- a pasta do Doom deixou de ser apenas documental
- o projeto ja tem um prototipo executavel de arquitetura
- o repositorio ja consegue testar parsing de WAD, renderer ASCII e grafico,
  gameplay inicial com janela grafica local e trilha procedural, sem helper
  Python

## O que continua faltando

- parser de mapa Doom real
- texturas, sprites e audio reais do jogo
- armas, IA e HUD com fidelidade de Doom original
- pipeline de assets completo
