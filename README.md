# GatoCore

Dialeto PTJS sobre QuickJS para executar JavaScript em portugues com parser,
lowering e runtime proprios.

## Estado atual

O projeto esta em `alpha funcional local`.

Hoje ele ja entrega:

- execucao de arquivos `.ptjs`
- `eval`, REPL e wrapper `gatocore`
- backend nativo local para subconjunto estruturado do PTJS
- parser do dialeto em portugues
- runtime semantico para `mostrar`, `tipo de`, `tamanho de`,
  `identificar` e `observar`
- runtime de plataforma para terminal, tempo, arquivos e `incluir`
- stdlib tecnica autocarregada pelo `gatocore`, gerada a partir de
  `docs/lista_palavras.md`
- fundacao de host para workspace, processos, servicos, segredos, HTTP GET,
  quarentena e motor de varredura em PTJS
- perfil low-level orientado a `padrao kkrieger` na stdlib, com estruturas
  compactas para hot path
- exemplos, sample live e suite automatizada local

O projeto ainda `nao` roda Doom 100% PTJS no sentido de fidelidade completa ao
jogo original. A base hoje ja inclui um demo com janela grafica nativa do
host, input na janela, renderer 2.5D em pixels com textura procedural,
sprites billboard, minimapa e audio procedural em loop, sem helper Python, mas
parser de mapa Doom real, WAD real, sprites, texturas, armas e a propria
fidelidade completa do jogo continuam faltando. O diagnostico detalhado esta
em `docs/DOOM_READINESS.md`.

Tambem existe agora um sample `Gatod Engine` em `samples/gatod_engine/`: um
editor local em PTJS com janela grafica nativa do host via `video_*`,
scene tree, inspector, filesystem dock, scripts, timeline, viewport 2D em
pixels, play/stop e serializacao de cena. O mapa dessa base e do que ainda
falta para paridade maior fica em `docs/GATOD_ENGINE.md`.

Tambem `nao` existe ainda paridade total de produto com ClamAV e NullClaw.
O gap honesto para esse alvo, junto do que ja foi entregue agora, esta em
`docs/PRODUCT_PARITY.md`.

Tambem `nao` existe ainda um backend PTJS -> assembly `geral` para toda a
linguagem e toda a stdlib. O que agora existe e um backend nativo real para
um subconjunto estruturado do PTJS, com IR, alocacao de registradores,
peephole, AOT e execucao local estilo JIT. A referencia fica em
`docs/backend_nativo.md` e a politica dura de implementacao continua em
`docs/padrao_kkrieger.md`.

## Linguagem e runtime

Superficie principal do dialeto:

- `definir nome como valor`
- `mostrar valor`
- `se ... então ... senão ... fim`
- `enquanto ... faça ... fim`
- `para cada item em colecao faça ... fim`
- `função nome(...) faça ... fim`
- `retornar valor`
- `tamanho de valor`
- `tipo de valor`
- `identificar valor`
- `observar valor`

Runtime de plataforma ja disponivel:

- terminal: `escrever`, `limpar_tela`, `mover_cursor`, `ocultar_cursor`,
  `mostrar_cursor`, `tamanho_terminal`, `ativar_terminal_cru`,
  `desativar_terminal_cru`, `ler_tecla`
- tempo: `agora_ms`, `esperar`
- arquivos: `ler_texto`, `ler_bytes`, `escrever_texto`, `arquivo_existe`,
  `apagar_arquivo`
- execucao: `argumentos`, `incluir`, `sair`

Stdlib tecnica autocarregada pelo `gatocore`:

- verbetes de `docs/lista_palavras.md` viram funcoes globais reais
- parte da superficie tem implementacao direta em JS puro, como
  `resultado`, `tokenizar`, `embedding`, `indice_vetorial`,
  `varrer_arquivo`, `pcap`, `pcapng` e `dissecar`
- parte da superficie agora usa host real via `--std`, como `workspace`,
  `job`, `servico`, `segredo`, `http`, `motor_varredura`,
  `atualizar_banco` e `quarentena`
- parte da superficie agora cobre estruturas compactas para baixo nivel,
  como `arena`, `bitset`, `fila_circular`, `pool`, `vetor_compacto`,
  `embedding_compacto` e `indice_vetorial_compacto`
- verbos que ainda dependem de host ou privilegio retornam erro
  estruturado por padrao e podem ganhar implementacao com
  `registrar("nome", fn)`

Caminhos relativos em `incluir` e nos builtins de arquivo sao resolvidos
relativamente ao proprio script PTJS atual.

## Uso rapido

No repositorio:

```sh
make build
./bin/gatocore examples/ola.ptjs
./bin/gatocore examples/tecnico.ptjs
./bin/gatocore eval 'mostrar tipo de "abc"'
./bin/gatocore repl
./bin/gatocore samples/snakegame.ptjs
./bin/gatocore samples/doom_ptjs/src/main.ptjs demo
./bin/gatocore samples/doom_ptjs/src/main.ptjs demo-janela
./bin/gatocore samples/doom_ptjs/src/main.ptjs diagnostico-video
./bin/gatocore samples/gatod_engine/src/main.ptjs help
./bin/gatocore samples/gatod_engine/src/main.ptjs diagnostico-video
./bin/gatocore native-run samples/native_backend_demo.ptjs
./bin/gatocore termos
make demo
make test
```

Atalhos via `make`:

```sh
make run FILE=examples/ola.ptjs
make eval CODE='mostrar 1'
make ir FILE=tests/native/ola.ptjs
make asm FILE=tests/native/ola.ptjs
make native-run FILE=tests/native/ola.ptjs
make bench FILE=examples/colecao.ptjs ITERATIONS=20
make snake
make gatod
make termos
```

Instalacao local opcional:

```sh
make install-local
gatocore examples/ola.ptjs
gatocore examples/tecnico.ptjs
gatocore repl
gatocore samples/snakegame.ptjs
gatocore samples/gatod_engine/src/main.ptjs help
gatocore native-run samples/native_backend_demo.ptjs
```

Remocao do link local:

```sh
make uninstall-local
```

## Exemplo minimo

```txt
função soma(a, b) faça
  retornar a + b
fim

definir total como soma(2, 3)
mostrar total
```

Execucao:

```sh
./bin/gatocore meu_programa.ptjs
```

Uso direto do engine com a stdlib tecnica:

```sh
./engines/quickjs/qjs --std --lang=pt -I stdlib/ptstdlib.js meu_programa.ptjs
```

## Backend nativo

O `gatocore` agora expone um backend nativo local para Linux x86_64:

```sh
./bin/gatocore ir tests/native/ola.ptjs
./bin/gatocore asm tests/native/ola.ptjs
./bin/gatocore native-build tests/native/ola.ptjs
./bin/gatocore native-run tests/native/ola.ptjs
./bin/gatocore jit tests/native/ola.ptjs
```

Esse fluxo cobre um subconjunto estruturado do PTJS com:

- `definir`, atribuicao, `mostrar`, `retornar`
- `se`, `senão`, `enquanto`, `para cada`, `função`
- inteiros, booleanos, `null`, strings e listas constantes
- chamadas diretas, recursao e `retornar` vazio
- `tamanho de`, `tipo de`, `identificar`, `observar`

O mapa honesto do que entrou e do que ainda falta fica em
`docs/backend_nativo.md`.

## Apps e jogos de terminal

O runtime atual ja permite programas live no terminal com:

- leitura de tecla em modo cru
- redraw com ANSI
- loop com tempo
- leitura e escrita de arquivos
- inclusao de outros scripts `.ptjs`

O sample live atual fica em `samples/snakegame.ptjs` e foi validado em Linux
local via TTY.

Para o objetivo `Doom 100% PTJS`, agora existe uma pasta dedicada de projeto
e documentacao em `samples/doom_ptjs/`.

Essa pasta tambem ja inclui uma base executavel inicial com janela grafica
nativa do host, renderer 2.5D em pixels, input na janela, audio procedural em
loop, loader de WAD em memoria, mapa de demo, inimigos, pickups, combate
simples, diagnostico de video e testes proprios.

Tambem existe `samples/gatod_engine/`, um sample de editor/engine local em
PTJS com janela nativa do host, viewport 2D, scene tree, inspector, scripts,
timeline e serializacao de cena.

## Stdlib tecnica

O `gatocore` agora carrega automaticamente `stdlib/ptstdlib.js`.

Essa camada usa `docs/lista_palavras.md` como fonte de termos e exporta
funcoes globais para:

- IA e busca vetorial
- rede e analise offline
- jogos e estruturas de simulacao
- agentes, workflows e recursos operacionais
- antivirus e scan de arquivos
- wireless, captura e MITM controlado via dispatch

Ha tres classes praticas de comportamento:

- implementacao real em JS puro
- construtores de recursos e tipos tecnicos
- dispatch para operacoes de host via `registrar("termo", fn)`

## Arquivos importantes

- `bin/gatocore`: wrapper principal de uso
- `compiler/ptjs_native.js`: compilador PTJS subset -> IR -> assembly
- `engines/quickjs`: engine modificado
- `examples`: programas `.ptjs` pequenos e diretos
- `runtime/native_runtime.c`: runtime C minimo do backend nativo
- `samples`: samples maiores, incluindo terminal live
- `samples/doom_ptjs`: pacote documental do projeto Doom PTJS
- `samples/gatod_engine`: sample de engine/editor local em PTJS
- `snippets`: banco reutilizavel de keywords, IR, ABI, peephole e toolchain
- `tests`: fixtures de compatibilidade, lexer, parser, runtime e integracao
- `tools/test_pt.sh`: suite principal do dialeto
- `tools/test_cli.sh`: smoke tests da CLI
- `tools/test_native.sh`: suite do backend nativo
- `tools/demo_examples.sh`: demonstracao completa dos exemplos
- `tools/benchmark_pt.sh`: benchmark simples
- `LANGUAGE.md`: referencia curta da linguagem e do runtime
- `STDLIB.md`: referencia da stdlib tecnica autocarregada
- `BUILTINS_SPEC.md`: contratos da superficie visivel
- `docs/backend_nativo.md`: estado, limites e comandos do backend nativo
- `docs/RELEASE.md`: checklist de release local
- `docs/dicionario.md`: dicionario da linguagem, funcoes e regras
- `docs/lista_palavras.md`: banco de palavras propostas para IA, rede, jogos e baixo nivel
- `docs/padrao_kkrieger.md`: padrao duro de desenvolvimento low-level e estruturas compactas
- `docs/DOOM_READINESS.md`: o que ainda falta para Doom e para sair de alpha
- `docs/GATOD_ENGINE.md`: estado e gap do sample de engine/editor em PTJS
- `docs/PRODUCT_PARITY.md`: o que ainda falta para ClamAV e NullClaw 100% PTJS

## Fluxos recomendados

Para ver exemplos com codigo e saida:

```sh
make demo
```

Para validar o projeto:

```sh
make test
```

Para validar so o backend nativo:

```sh
make native-test
```

Para abrir o sample live:

```sh
make snake
```

Para contar os verbetes expostos pela stdlib:

```sh
make termos
```

Para ver a versao local:

```sh
./bin/gatocore version
```

## Limites atuais

- o modo portugues continua sendo ativado explicitamente
- a distribuicao continua local ao repositorio ou via link em `~/.local/bin`
- a camada live atual e focada em terminal ANSI e foi validada em Linux
- a stdlib tecnica cobre todos os verbetes do dicionario como funcoes
  chamaveis, mas varias operacoes sensiveis ainda dependem de adaptadores
  ou implementacao nativa especifica
- o backend nativo atual cobre um subconjunto estruturado do PTJS, nao ainda
  a linguagem inteira nem a stdlib tecnica completa
- no backend nativo, listas hoje sao constantes homogeneas e ainda nao ha
  objetos nem colecoes dinamicas gerais
- Doom 100% PTJS ainda nao existe neste repositorio
- ainda existem corner cases de parser em endurecimento, especialmente em
  alguns statements de expressao apos declaracoes `função ... fim`
- a linguagem ainda nao tem contrato de compatibilidade de release estavel
# gatocore
