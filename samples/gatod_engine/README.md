# Gatod Engine

Sample de engine/editor em PTJS inspirado na experiencia de ferramentas como
Godot, mas entregue nesta base como `prototipo funcional local`.

O que esta implementado aqui:

- editor com janela grafica nativa do host via `video_*`
- toolbar com acoes de cena e projeto
- scene tree
- inspector editavel
- dock de assets
- dock de scripts
- timeline simples
- editor de script integrado com preview, snippets e salvamento local
- timeline visual com keyframes editaveis
- viewport 2D em pixels
- play/stop da cena
- salvamento/carregamento de cena em JSON
- node types basicos (`Node2D`, `Sprite2D`, `Camera2D`, `Control`, `Label`, `TileMap`)
- animacao simples, input map e fisica 2D basica
- hooks de plugin, overlay de monitoramento e profiler basico
- importacao real de assets via `runtime/imports` com hash, metadata e carga de cena JSON
- buses de audio locais com meters e mixagem simples para a demo
- palette de comandos e export de bundle

Uso:

```sh
./bin/gatocore samples/gatod_engine/src/main.ptjs editor
```

Controles em `Play`:

- `WASD` ou setas movem o player
- `Espaco` gera impulso visual no player

Controles do editor:

- `Tab` troca o painel focado
- `Setas` movem a selecao do painel
- `Enter` aciona o painel atual
- `M` abre a palette de comandos
- `R` alterna `Play` / `Editor`
- `E` exporta bundle ou troca script no painel de scripts
- `X` fecha o editor
- clique do mouse muda o foco do painel, seleciona itens e aciona a toolbar
- no editor de script, clique no painel central seleciona a linha
- na timeline, clique no grafico central seleciona o keyframe

Extras do painel de scripts:

- `Seta Esquerda` / `Seta Direita` movem a linha ativa
- `A` / `D` trocam o snippet selecionado
- `I` insere o snippet selecionado
- `C` comenta/descomenta a linha atual
- `S` salva o script em `runtime/scripts/`

Extras do painel de timeline:

- `Seta Esquerda` / `Seta Direita` movem o keyframe selecionado
- `A` / `D` trocam o keyframe selecionado
- `I` adiciona keyframe na posicao atual
- `C` remove o keyframe selecionado
- `Espaco` alterna playback da timeline

Comandos auxiliares:

```sh
./bin/gatocore samples/gatod_engine/src/main.ptjs help
./bin/gatocore samples/gatod_engine/src/main.ptjs scene-pack
./bin/gatocore samples/gatod_engine/src/main.ptjs render-hash
./bin/gatocore samples/gatod_engine/src/main.ptjs diagnostico-video
```

Requisitos do editor:

- sessao grafica local compativel com o backend `video_*` atual
- no estado atual, o backend desktop nativo validado e `x11-host`

Se esses requisitos nao existirem, o sample nao abre a janela do editor.

Nota honesta:

- mouse ja funciona no backend desktop Linux atual
- backend nativo Windows ainda nao existe nesta base

Mapa indexado das solucoes e gaps restantes:

- `docs/GATOD_SOLUTIONS_INDEX.md`
