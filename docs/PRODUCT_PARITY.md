# Product Parity

## Objetivo

Registrar com honestidade:

- o que ja existe hoje em PTJS para aproximar produtos grandes
- o que ainda falta para uma replica `100% PTJS` e `100% funcional` de
  ClamAV e NullClaw
- o que foi implementado nesta rodada para reduzir esse gap

## Conclusao curta

O projeto `ainda nao` chegou a uma replica completa de produto para ClamAV
ou NullClaw.

O que existe agora e uma fundacao compartilhada bem mais forte:

- host runtime real com `--std`
- workspace, processos, servicos e segredos
- HTTP GET, provedor, gateway local e canal de mensagem
- motor local de varredura com assinaturas, heuristicas, base externa e
  quarentena

Isso torna `viavel construir MVPs e prototipos funcionais em PTJS`.
Ainda `nao` torna honesto afirmar paridade total de produto.

## Fundacao compartilhada ja pronta

O GatoCore ja tem:

- parser PTJS, CLI, REPL e `eval`
- runtime de terminal, tempo, arquivos e `incluir`
- stdlib tecnica autocarregada
- workspace com I/O, JSON, rename, remove e execucao local
- `job`, `servico`, `sandbox`, `segredo`
- `http`, `provedor`, `provedor_modelo`, `gateway`, `canal_mensagem`
- `motor_varredura`, `assinatura_binaria`, `heuristica`,
  `atualizar_banco`, `quarentena`
- suite automatizada local cobrindo linguagem, CLI e stdlib

## O que ainda falta para NullClaw 100% PTJS

### Rede e canais

- HTTP completo com metodos alem de GET
- streaming, SSE e WebSocket reais
- upload multipart e webhooks
- sockets de cliente e servidor

### Providers e execucao

- clientes reais de provedores de modelo
- autenticacao robusta por chave, token e refresh
- retry, timeout, rate limit e fallback por politica
- roteamento por modelo, custo e health

### Operacao de produto

- daemon persistente
- scheduler e cron persistentes
- persistencia forte com banco real e migracoes
- multiusuario, sessoes duraveis e auditoria
- observabilidade de producao
- empacotamento, instalacao e atualizacao

### Seguranca e isolamento

- sandbox forte de processos e ferramentas
- Docker e WASM reais no runtime
- controle fino de permissoes
- tunel, gateway exposto e auth de borda

## O que ainda falta para ClamAV 100% PTJS

### Engine de antivirus

- parser de muitos formatos e containers
- descompressao e extracao recursiva
- limites contra bombs e entradas hostis
- desempenho nativo de scan em larga escala
- paralelismo e tuning de memoria

### Ecossistema de assinatura

- formato de base equivalente a CVD e derivados
- validacao criptografica de base
- atualizador no nivel de `freshclam`
- compatibilidade ampla de regras e bytecode

### Modos de operacao

- daemon tipo `clamd`
- CLI completa tipo `clamscan`
- on-access scanning real
- integracao de mail filtering
- operacao de servico endurecida

## O que foi desenvolvido nesta rodada

- o fluxo oficial do `gatocore` passou a executar PTJS com `--std`
- a stdlib ganhou host real para workspace, processo, servico, segredo e
  HTTP GET
- a base de scan local ganhou motor, quarentena e atualizacao de banco
- o projeto ganhou um backend nativo local para subconjunto do PTJS com IR,
  assembly x86_64, register allocation, peephole, AOT e `jit` local
- a suite ganhou testes para host operacional, scan engine e recursos
  tecnicos
- o runner de testes foi endurecido para nao abortar silenciosamente em
  casos de sucesso que saem com erro

## Resultado pratico

Hoje o projeto esta mais perto de:

- um clone `MVP local` de NullClaw em PTJS
- uma ferramenta `offline de scan tecnico` inspirada em ClamAV
- um runtime PTJS mais alinhado a `docs/padrao_kkrieger.md` para estruturas
  compactas e hot paths

Ainda falta bastante para:

- paridade total de produto
- operacao robusta em producao
- afirmar `100% das funcionalidades 100% em PTJS`
- afirmar `PTJS -> assembly nativo` como pipeline geral para toda a
  linguagem, stdlib tecnica e produtos grandes
