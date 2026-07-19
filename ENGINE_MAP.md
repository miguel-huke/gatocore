# Engine Map

## Base analisada

- engine: QuickJS
- origem: `https://github.com/bellard/quickjs.git`
- commit observado: `f113949`

## Resumo

QuickJS concentra lexer, parser, emissao de bytecode e boa parte do runtime em `engines/quickjs/quickjs.c`.
Para a feature em portugues, os pontos principais de mudanca estao no scanner, no parser de statements/expressoes, no lowering para bytecode e na inicializacao de runtime/contexto.

## Mapa dos pontos criticos

| Area | Arquivo | Funcao ou simbolo | Responsabilidade atual | Impacto esperado da feature |
| --- | --- | --- | --- | --- |
| Atomos e palavras reservadas | `engines/quickjs/quickjs-atom.h` | bloco `DEF(...)` inicial | Define os primeiros atoms, incluindo os que o parser trata como keywords | Adicionar atoms do dialeto ou reservar atoms para palavras do modo portugues |
| Limites de keywords | `engines/quickjs/quickjs.c:1049` | `JS_ATOM_LAST_KEYWORD`, `JS_ATOM_LAST_STRICT_KEYWORD` | Define quais atoms entram na classificacao de palavra reservada | Pode exigir ajuste se as novas palavras virarem keywords completas |
| Enumeracao de tokens | `engines/quickjs/quickjs.c:21243` | bloco `TOK_*` | Lista tokens do parser, incluindo keywords nativas | Inserir tokens para `definir`, `como`, `mostrar`, `então`, `senão`, `fim`, `faça` e operadores semanticos |
| Classificacao de identificador | `engines/quickjs/quickjs.c:22152` | `update_token_ident` | Converte `TOK_IDENT` em keyword quando o atom pertence ao conjunto reservado | Estender a conversao para o modo portugues ou criar uma camada adicional de reclassificacao |
| Reclassificacao contextual | `engines/quickjs/quickjs.c:22182` | `reparse_ident_token` | Reinterpreta identificador ou keyword conforme modo e contexto da funcao | Pode ser util para mudar entre JS puro e modo portugues sem contaminar todo o parser |
| Leitura de identificadores | `engines/quickjs/quickjs.c:22194` | `parse_ident` | Construi atoms para identificadores e nomes escapados | Pode ser mantida quase intacta; a mudanca principal e na classificacao posterior |
| Scanner principal | `engines/quickjs/quickjs.c:22242` | `next_token` | Tokeniza o codigo fonte, incluindo comentarios, strings, numeros e identificadores | Principal ponto para reconhecer tokens do dialeto e manter `got_lf` e lookahead corretos |
| Scanner simplificado | `engines/quickjs/quickjs.c:23083` | `simple_next_token` | Faz lookahead leve em casos como `import`, `let` e similares | Pode precisar reconhecer `de`, `então`, `faça` e outros conectores usados em lookahead |
| Emissao de bytecode | `engines/quickjs/quickjs.c:23277` | `emit_op` | Emite opcodes no bytecode da funcao atual | Sera reutilizado pelo lowering da nova sintaxe |
| Entrada de expressoes | `engines/quickjs/quickjs.c:27726` | `js_parse_expr` | Entrada principal do parser de expressoes | Precisara delegar para expressoes semanticas como `tamanho de X` e `tipo de X` |
| Parsing de statements | `engines/quickjs/quickjs.c:27900` | `js_parse_statement_or_decl` | Grande dispatcher de statements e declaracoes | Ponto central para introduzir `definir`, `mostrar`, `se ... então ... fim`, `enquanto ... faça ... fim` e `retornar` |
| Parsing de variaveis | `engines/quickjs/quickjs.c:27928` | `js_parse_var` | Implementa declaracoes `var`, `let`, `const` e sua emissao | E a principal referencia para o lowering de `definir nome como valor` |
| Elementos do programa | `engines/quickjs/quickjs.c:31438` | `js_parse_source_element` | Escolhe entre funcao, import, export e statement no nivel superior | Pode precisar reconhecer o modo portugues ja no topo do arquivo |
| Parse do programa | `engines/quickjs/quickjs.c:36477` | `js_parse_program` | Inicializa o parsing do arquivo e fecha retorno final | Deve continuar como entrada do arquivo, apenas com suporte ao novo dialeto |
| Inicializacao do parser | `engines/quickjs/quickjs.c:36529` | `js_parse_init` | Prepara estado de parsing | Candidato natural para receber uma flag de linguagem no estado do parser |
| Pipeline de compilacao e execucao | `engines/quickjs/quickjs.c:36587` | `__JS_EvalInternal` | Inicializa parse state, chama `js_parse_program`, cria funcao e executa | Pode transportar flag `lang=pt` do frontend ate o parser |
| Execucao do objeto compilado | `engines/quickjs/quickjs.c:36547` | `JS_EvalFunctionInternal` | Executa bytecode ou modulo compilado | Em geral nao precisa mudar, desde que o lowering gere bytecode valido |
| Criacao de contexto | `engines/quickjs/quickjs.c:2199` | `JS_NewContext` | Registra intrinsics base do QuickJS | Ponto para registrar intrinsics internas do dialeto |
| API de intrinsics | `engines/quickjs/quickjs.h:397` | `JS_AddIntrinsic*` | Superficie publica de registro de intrinsics | Serve como modelo para `JS_AddIntrinsicPortuguese` ou equivalente |
| Helpers globais da shell | `engines/quickjs/quickjs-libc.c:4061` | `js_std_add_helpers` | Expõe `console`, `print`, `performance` e `scriptArgs` | Pode ser referencia para builtins de shell, mas `mostrar` deve viver no runtime/language mode, nao so aqui |
| Entrada da CLI | `engines/quickjs/qjs.c:49` | `eval_buf` | Chama `JS_Eval` ou `JS_EvalFunction` | Ponto para encaminhar modo portugues e decidir compilacao global/modulo |
| Execucao de arquivo | `engines/quickjs/qjs.c:78` | `eval_file` | Carrega arquivo e decide flags de avaliacao | Bom lugar para adicionar `--lang=pt` ou extensao dedicada |
| Contexto customizado da CLI | `engines/quickjs/qjs.c:107` | `JS_NewCustomContext` | Cria contexto e registra modulos `std` e `os` | Pode registrar recursos extras do prototipo, se necessario |
| Bootstrap da shell | `engines/quickjs/qjs.c:453` | `main` | Inicializa runtime, contexto, loader e ajudares | Vai precisar de parsing de flags e eventual REPL do modo portugues |

## Conclusoes tecnicas

### 1. O centro da implementacao esta em `quickjs.c`

Lexer, parser, lowering e runtime basico estao concentrados no mesmo arquivo.
Isso reduz espalhamento da mudanca, mas aumenta a necessidade de disciplina para manter a feature isolada.

### 2. Keywords em QuickJS dependem de atoms

Os primeiros atoms definidos em `quickjs-atom.h` alimentam a classificacao de keywords no parser.
Isso significa que existe uma decisao de arquitetura logo no inicio:

- promover palavras em portugues a keywords de primeira classe
- ou tratar o dialeto por reclassificacao controlada em modo portugues

Para o prototipo, a recomendacao e adicionar tokens dedicados e uma classificacao explicita condicionada ao modo portugues, evitando reordenar a estrutura inteira de keywords nativas.

### 3. `definir` deve reutilizar o caminho de declaracao

`js_parse_var` mostra claramente como QuickJS baixa declaracoes para bytecode.
O caminho mais seguro para `definir` e reaproveitar esse fluxo sem reinventar emissao de escopo.

### 4. Expressoes semanticas entram melhor pelo parser de expressoes

`tamanho de X`, `tipo de X` e similares devem entrar antes de cair no fluxo generico de expressoes JS, para evitar ambiguidades e para permitir lowering previsivel.

### 5. O runtime ja oferece pontos claros para intrinsics

`JS_NewContext` e as funcoes `JS_AddIntrinsic*` ja estabelecem um padrao para extensoes internas.
Isso favorece intrinsics como:

- `__pt_show`
- `__pt_size_of`
- `__pt_type_of`
- `__pt_identify`
- `__pt_observe`

## Ordem sugerida de patch

1. adicionar flag de linguagem no frontend da CLI
2. transportar a flag para o parser
3. introduzir novos atoms e tokens do dialeto
4. classificar palavras do modo portugues no scanner
5. criar helpers de parser para statements em portugues
6. criar helpers de parser para expressoes semanticas
7. baixar para bytecode reutilizando opcodes existentes quando possivel
8. registrar intrinsics minimas no contexto
9. criar testes de tokenizacao, parsing e execucao
