# Doom PTJS

Pasta de referencia para transformar o objetivo de `Doom 100% PTJS` em um
projeto executavel por etapas, usando como base o diagnostico de
`docs/DOOM_READINESS.md`.

Esta pasta `nao` contem Doom pronto. Ela contem:

- mapa detalhado do que falta
- arquitetura recomendada
- divisao por modulos
- milestones com criterio de aceite
- layout inicial de projeto
- uma base executavel inicial do projeto

## Estrutura

- `docs/00_GAP_INDEX.md`: tudo que falta, em detalhe
- `docs/01_VISAO_E_ESCOPO.md`: objetivo, limites e definicao de sucesso
- `docs/02_ARQUITETURA_GERAL.md`: arquitetura recomendada
- `docs/03_RENDERER.md`: plano do renderer e framebuffer
- `docs/04_AUDIO.md`: plano de audio
- `docs/05_WAD_E_ASSETS.md`: pipeline de WAD, lumps e validacao
- `docs/06_GAMEPLAY_E_LOGICA.md`: modulos de jogo
- `docs/07_MODULOS_E_ESCALA.md`: organizacao para codigo grande
- `docs/08_PERFORMANCE_E_PROFILING.md`: metas e estrategia de tuning
- `docs/09_TESTES_E_HARDENING.md`: estrategia de testes
- `docs/10_SAIR_DE_ALPHA.md`: o que falta para o projeto deixar de ser alpha
- `docs/11_ROADMAP_EXECUTAVEL.md`: milestones ordenados
- `docs/12_LAYOUT_DE_ARQUIVOS.md`: estrutura sugerida de codigo
- `docs/13_IMPLEMENTADO_NESTA_BASE.md`: o que ja virou codigo real
- `src/main.ptjs`: bootstrap inicial do sample

## Caminho recomendado

Para o projeto Doom em PTJS, a trilha recomendada agora e:

1. manter PTJS como linguagem e logica principal
2. manter QuickJS modificado como runtime de desenvolvimento
3. criar extensao de host com framebuffer + audio, preferencialmente SDL2
4. portar o renderer, WAD loader e gameplay por modulos
5. usar o backend nativo PTJS apenas onde o subset cobrir hot paths de forma
   segura

## Estado real

Hoje o repositorio ja suporta:

- parser PTJS
- input e terminal live
- arquivos e bytes
- includes relativos
- backend nativo subset

E esta pasta agora ja entrega:

- janela grafica nativa do host via builtins PTJS de video
- renderer 2.5D em pixel buffer com textura procedural, sprites billboard,
  arma, HUD e minimapa
- input na propria janela grafica
- sintese local de audio e musica procedural em loop
- fallback ASCII de debug em terminal
- diagnostico de video para detectar por que a janela nao abriu
- mapa de demo mais aberto para combate e pickups visiveis desde o inicio
- player com movimento, strafe e rotacao
- inimigos basicos com perseguicao e dano
- pickups de vida, municao e armadura
- combate hitscan simples
- estados de titulo, vitoria e derrota
- loader de WAD com fixture em memoria
- profiler e testes iniciais do projeto Doom PTJS

Ainda faltam parser de mapa Doom real, WAD real, texturas/sprites do jogo,
armas/IA/HUD com fidelidade de Doom original e pipeline de assets completo.
Esta pasta existe para fechar esse gap sem misturar roadmap com promessa de
entrega pronta.

## Requisitos do demo com janela

- sessao grafica local com `DISPLAY`
- `paplay` ou `aplay` para efeitos sonoros e musica

Sem isso, o sample faz fallback para o renderer ASCII no terminal.

## Comandos uteis

```sh
./bin/gatocore samples/doom_ptjs/src/main.ptjs frame
./bin/gatocore samples/doom_ptjs/src/main.ptjs wad-selftest
./bin/gatocore samples/doom_ptjs/src/main.ptjs profiler
./bin/gatocore samples/doom_ptjs/src/main.ptjs demo
./bin/gatocore samples/doom_ptjs/src/main.ptjs demo-janela
./bin/gatocore samples/doom_ptjs/src/main.ptjs diagnostico-video
```
