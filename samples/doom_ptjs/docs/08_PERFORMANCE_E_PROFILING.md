# Performance e Profiling

## Objetivo

Definir como medir e otimizar Doom PTJS.

## Metricas minimas

- frame time medio
- p95 de frame time
- tempo de update
- tempo de render
- tempo de parse de WAD
- uso de memoria

## Metas iniciais

- boot do jogo em menos de 2 segundos para WAD suportado
- 35 fps em resolucao interna base
- sem crescimento continuo de memoria durante 10 minutos

## Ferramentas necessarias

- cronometro por modulo
- contadores por frame
- modo debug de overlay
- benchmark automatizado

## Hot paths previstos

- raycasting
- sampling de textura
- sprites
- colisao
- parsing de mapa

## Regras kkrieger

- nada de arrays temporarios por coluna sem necessidade
- preferir buffers fixos e typed arrays
- separar debug do caminho normal
- evitar stringificacao em loop

## Entregaveis

- benchmark de renderer
- benchmark de WAD
- benchmark de colisao
- relatorio de tuning por milestone
