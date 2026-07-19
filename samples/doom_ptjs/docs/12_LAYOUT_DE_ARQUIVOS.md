# Layout de Arquivos

## Estrutura sugerida

```txt
samples/doom_ptjs/
  README.md
  docs/
  assets/
  src/
    main.ptjs
    bootstrap/
    runtime/
    assets/
    renderer/
    audio/
    game/
    ui/
    debug/
  tests/
```

## Arquivos de codigo recomendados

### Bootstrap

- `src/main.ptjs`
- `src/bootstrap/config.ptjs`
- `src/bootstrap/includes.ptjs`

### Runtime

- `src/runtime/video.ptjs`
- `src/runtime/input.ptjs`
- `src/runtime/audio.ptjs`
- `src/runtime/time.ptjs`

### Assets

- `src/assets/wad.ptjs`
- `src/assets/lumps.ptjs`
- `src/assets/palette.ptjs`
- `src/assets/map.ptjs`
- `src/assets/textures.ptjs`

### Renderer

- `src/renderer/framebuffer.ptjs`
- `src/renderer/raycast.ptjs`
- `src/renderer/sprites.ptjs`
- `src/renderer/present.ptjs`

### Game

- `src/game/state.ptjs`
- `src/game/player.ptjs`
- `src/game/world.ptjs`
- `src/game/collision.ptjs`
- `src/game/weapons.ptjs`
- `src/game/enemies.ptjs`

### UI

- `src/ui/hud.ptjs`
- `src/ui/menu.ptjs`
- `src/ui/screens.ptjs`

### Debug

- `src/debug/profiler.ptjs`
- `src/debug/overlay.ptjs`
- `src/debug/metrics.ptjs`

## Estrategia de bootstrap

- `main.ptjs` monta config e chama bootstrap
- bootstrap carrega modulos em ordem
- cada modulo devolve namespace explicito
- o loop principal fica isolado do carregamento de assets
