# Gatod Solutions Index

Indice consolidado das solucoes aplicadas ao `Gatod Engine`, incluindo o que
entrou agora, o que ficou parcial e o que ainda continua como gap real de
produto.

## Itens originalmente faltantes

| Gap original | Status atual | Solucao aplicada nesta base |
| --- | --- | --- |
| renderer 3D real | pendente | ainda nao existe renderer 3D; a base segue 2D |
| pipeline de shader/material de verdade | pendente | ainda nao existe pipeline dedicado de materiais/shaders |
| audio buses e mixer completos | parcial | existem `audio_buses`, mixagem local da demo, `meters` e estado de clipping |
| importacao real de imagens, audio, malhas, fontes e cenas externas | parcial | `runtime/imports` agora gera assets reais com tipo, tamanho, hash e preview; cenas JSON podem ser carregadas |
| export templates e builds multiplataforma | pendente | segue apenas export de bundle JSON local |
| editor de script integrado | entregue | painel contextual com preview, cursor de linha, snippets, comentario e salvamento em `runtime/scripts/` |
| editor de animacao/timeline visual | entregue | timeline agora tem visualizacao grafica, selecao de keyframe e edicao de posicao |
| sistema de plugins com ciclo de vida mais rico | entregue basico | plugins agora recebem hooks reais (`startup`, `frame`, `scene_saved`, `scene_loaded`, `asset_imported`, `script_saved`, `mode_changed`) |
| navegacao, particles, light2d/light3d e fisica mais completa | pendente | a fisica segue simples e nao ha pipeline de navegacao/particles/lights |
| profiler, debugger e monitoramento em nivel de produto | parcial | `profiler`, overlay de metricas, feed de plugins e meters de audio estao integrados; debugger dedicado ainda nao existe |
| compilador/exportador no nivel de produto do Godot | pendente | ainda nao existe trilho de exportacao/build de produto |
| editor de script com linguagem, refatoracao e depuracao integrados | parcial | o editor integrado existe, mas sem parser semantico dedicado, refatoracao ou depuracao interativa |
| janela desktop nativa Windows | pendente | o backend atual segue `x11-host`; mouse e clique estao implementados no desktop Linux atual |

## Arquivos principais das solucoes novas

- `samples/gatod_engine/src/engine/api.ptjs`
- `samples/gatod_engine/src/engine/render2d.ptjs`
- `samples/gatod_engine/src/editor/runtime.ptjs`
- `tests/gatod/development_state.ptjs`
- `tests/gatod/import_assets.ptjs`

## Solucoes entregues agora

### 1. Editor de script integrado

- preview contextual do script selecionado
- cursor de linha independente da lista de scripts
- snippets basicos de PTJS
- comentario de linha
- salvamento local em `runtime/scripts/`

### 2. Timeline visual/editavel

- grafico compacto de keyframes
- selecao de trilha e keyframe
- mover keyframe em frames
- adicionar/remover keyframe
- reproducao integrada ao step do projeto

### 3. Plugins com hooks reais

- feed de eventos de plugin no projeto
- atualizacao de estado por plugin
- hooks executados em eventos relevantes do editor/engine

### 4. Monitoramento e profiler

- `step_ms`, `render_ms`, medias moveis, contadores de import/save/edit
- overlay resumido para o painel contextual
- exposicao no `buildState` do editor

### 5. Mouse no desktop Linux atual

- `video_entrada()` agora expone `mouse_x`, `mouse_y`, `mouse_left`, `mouse_middle`, `mouse_right` e `mouse_inside`
- clique de mouse foca paineis, aciona toolbar, seleciona linhas do editor de script e keyframes da timeline
- integracao entregue no backend `x11-host`

### 6. Importacao real de assets

- leitura de arquivos reais em `runtime/imports`
- deteccao de tipo por extensao
- hash FNV-1a e tamanho em bytes
- preview textual quando aplicavel
- carga de cena externa em JSON para o projeto atual

## O que ainda e gap real

- renderer 3D
- shaders/materiais reais
- mixer de audio em nivel de produto
- importacao/renderizacao real de formatos externos completos
- backend desktop Windows
- export multiplataforma
- debugger/refatoracao integrados
- fisica/navegacao/luzes/particles mais completos
