# Audio

## Objetivo

Definir a camada de audio que falta para Doom PTJS.

## Estado atual

Ja existe hoje:

- geracao procedural de WAV em memoria
- efeitos de tiro, hit, dano, pickup, morte e vitoria
- trilhas procedurais simples para titulo, jogo, vitoria e derrota
- disparo de audio a partir de gameplay e estados do jogo

O que continua faltando:

- mixer real de varias vozes com controle fino
- volume separado e persistente para musica e efeitos
- assets reais de audio
- timing mais proximo do jogo original
- backend nativo de audio sem depender de players externos

## Requisitos

- efeitos de tiro
- dor, porta, item e morte
- musica de fase
- volume separado para musica e efeitos

## API minima recomendada

- `audio_iniciar({ sample_rate, canais, frames })`
- `audio_tocar_sfx(nome, opcoes?)`
- `audio_tocar_musica(nome, opcoes?)`
- `audio_parar_musica()`
- `audio_volume_sfx(valor)`
- `audio_volume_musica(valor)`

## Implementacao recomendada

- SDL2 audio callback
- mixer simples no host
- PTJS dispara eventos e controla estado
- host nativo mistura e entrega o buffer final

## Ordem de entrega

1. inicializacao e beep de teste
2. um SFX disparado por tecla
3. musica de loop
4. eventos integrados ao gameplay
5. pan e distancia

## Testes necessarios

- tocar e parar sem vazar recurso
- alternar musica entre mapas
- disparar muitos SFX em sequencia
- validar estabilidade do mixer por varios minutos
