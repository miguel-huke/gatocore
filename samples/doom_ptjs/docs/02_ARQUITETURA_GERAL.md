# Arquitetura Geral

## Decisao principal

Arquitetura recomendada:

- PTJS para gameplay, assets e orquestracao
- host runtime dedicado para janela, framebuffer, input e audio
- `x11-host` como backend atual de janela e SDL2 como evolucao recomendada

## Camadas

### Camada 1: linguagem

- PTJS
- parser e runtime ja existentes no GatoCore

### Camada 2: host do jogo

- janela
- framebuffer
- teclado
- mouse
- audio
- temporizacao de frame

### Camada 3: engine Doom PTJS

- loop
- mapa
- colisao
- renderer
- audio router
- assets
- gameplay
- UI

## Regras de acoplamento

- gameplay nao fala direto com SDL
- gameplay fala com interfaces de `video`, `audio`, `input` e `assets`
- renderer nao conhece regras de menu, inventario ou IA
- parser de WAD nao conhece renderer

## Interfaces minimas

Video:

- `video_abrir(largura, altura, escala, titulo)`
- `video_apresentar(frame_rgba)`
- `video_entrada()`
- `video_fechar()`
- `video_backend()`

Input:

- `estado_teclado()`
- `estado_mouse()`
- `capturar_cursor(ativo)`

Audio:

- `audio_iniciar(config)`
- `audio_tocar_sfx(id, volume?, pan?)`
- `audio_tocar_musica(id, loop?)`
- `audio_parar_musica()`

Assets:

- `carregar_wad(caminho)`
- `obter_lump(nome)`
- `obter_mapa(nome)`
- `obter_sprite(nome)`
- `obter_flat(nome)`

## Loop recomendado

Separar:

- `processar_input`
- `simular`
- `renderizar`
- `apresentar`

Com acumulador de tempo para estabilidade:

- fixed timestep para simulacao
- apresentacao desacoplada quando possivel
