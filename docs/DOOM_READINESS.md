# Doom Readiness

## Objetivo

Registrar de forma objetiva:

- o que ja existe hoje em PTJS
- o que ainda falta para `Doom 100% PTJS`
- o que ainda falta para o projeto deixar de ser `alpha funcional`

## Fundacao ja pronta

O repositorio ja tem:

- parser do dialeto em portugues
- CLI `gatocore`, `eval`, REPL e execucao de arquivos `.ptjs`
- controle de fluxo, funcoes, colecoes e operadores semanticos
- runtime para impressao e observacao
- runtime de terminal com ANSI, cursor, raw mode e leitura de tecla
- runtime de tempo com `agora_ms` e `esperar`
- runtime de arquivo com texto e bytes
- `incluir(caminho)` com resolucao relativa ao script atual
- samples e testes automatizados locais

Isso ja e suficiente para:

- scripts PTJS nao triviais
- demos live em terminal
- jogos ASCII simples
- prototipos de loaders, loops de jogo e ferramentas de asset

## O que falta para Doom 100% PTJS

### 1. O proprio Doom em PTJS

Ja existe uma base jogavel:

- loop principal com titulo, jogo, vitoria e derrota
- renderer ASCII de debug e renderer 2.5D em pixels
- mapa de demo com colisao, inimigos, pickups e combate simples
- HUD base, arma em tela e overlays de estado

Ainda falta o corpo para equivalencia real de produto:

- parser de mapas Doom reais
- sistema de armas e inimigos no nivel do jogo original
- menus, flows de fase, segredos e regras completas de gameplay
- fidelidade visual e de conteudo equivalente ao Doom original

### 2. Camada de renderizacao adequada

Ja existe uma primeira camada grafica local:

- janela grafica nativa do host
- framebuffer em pixels com textura procedural
- input pela propria janela
- sprites billboard e minimapa
- fallback ASCII no terminal

Ainda falta um backend mais forte de produto, preferencialmente nativo e sem
helper externo adicional, com melhor timing, mouse, fullscreen, textura real,
320x200 classico e integracao mais proxima do jogo final.

### 3. Audio

Ja existe:

- sintese procedural simples
- efeitos de tiro, dano, pickup, morte e vitoria
- musica procedural simples em loop

Ainda faltam mixer de verdade, canais, assets reais de audio, timing mais
rigido e audio no padrao do Doom original.

### 4. Pipeline de assets e WAD

Ainda faltam:

- leitor de WAD em PTJS
- validacao dos lumps
- carregamento de texturas, paletas, mapas e sprites
- especificacao clara de formatos e erros para assets

### 5. Superficie para projeto grande

Para um codigo do tamanho de Doom, ainda faltam:

- convencoes mais fortes de organizacao de modulos
- estrategia de includes grandes ou modulo real por arquivo
- testes para bases de codigo muito maiores
- hardening do parser para casos de larga escala

### 6. Performance e profiling

Ainda faltam:

- benchmark orientado a frame time
- profiling de renderer e parsing de assets
- metas minimas de desempenho
- estrategia de otimizar pontos criticos

## O que falta para deixar de ser alpha funcional

### 1. Contrato de linguagem

- congelar gramatica por versao
- definir politica de compatibilidade
- declarar o que e estavel e o que ainda e provisorio

### 2. Mais testes e hardening

- regressao maior
- casos invalidos pesados
- stress tests
- fuzzing do parser e do runtime
- validacao multiplataforma
- fechamento de corner cases de parser ainda abertos

### 3. Distribuicao

- empacotamento fora do repositorio
- releases versionadas
- changelog
- artefatos de build

### 4. CI e matriz de ambientes

- Linux, macOS e Windows
- builds limpos recorrentes
- testes de TTY e smoke de samples

### 5. Documentacao de usuario final

- tutorial mais didatico
- referencia de runtime mais completa
- guias de port e de troubleshooting

## O que esta entregue nesta rodada

Esta rodada fechou a parte `mais viavel agora` do gap:

- runtime de terminal para apps live
- runtime de arquivo e bytes
- `incluir(caminho)` com base relativa por script
- sample live `samples/snakegame.ptjs`
- pasta `samples/doom_ptjs/` com documentacao dedicada do projeto Doom PTJS
- prototipo executavel do Doom PTJS com renderer ASCII de debug e modo de
  janela, textura procedural, sprites billboard, arma em tela, minimapa,
  mapa de demo mais aberto, player/collision, inimigos basicos, pickups,
  combate simples, loader de WAD em memoria, input na janela, audio
  procedural e testes de base
- testes de runtime para terminal, arquivos e include
- docs atualizadas com status real do projeto

## Conclusao

O projeto saiu de um prototipo de linguagem apenas textual para uma base
local que ja suporta apps e jogos simples de terminal em PTJS.

Mesmo assim, `Doom 100% PTJS` ainda continua sendo um objetivo futuro, nao
uma capacidade entregue hoje.
