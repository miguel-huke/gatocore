# Dicionario PTJS

## Objetivo

Este documento concentra, em um so lugar, a referencia pratica da linguagem
PTJS do GatoCore:

- palavras da linguagem
- formas canonicas
- funcoes globais adicionadas pelo runtime
- regras de uso
- nomes de tipos canonicos

Observacao:

Este dicionario cobre principalmente o `nucleo implementado da linguagem`.
Os verbetes tecnicos expandidos ficam em `docs/lista_palavras.md` e sao
carregados pela stdlib tecnica do `gatocore`.

## Escopo

Este dicionario cobre a `superficie especifica do GatoCore`.

Ele `nao` tenta listar toda a biblioteca padrao herdada do JavaScript ou do
QuickJS, como `Math`, `Array`, `Object`, `String`, `Date` e APIs nativas do
engine. Essas continuam existindo conforme o runtime base.

## Ativacao

O modo PTJS e ativado explicitamente:

```txt
--lang=pt
```

Exemplo:

```sh
./bin/gatocore programa.ptjs
./engines/quickjs/qjs --lang=pt programa.ptjs
./engines/quickjs/qjs --std --lang=pt -I stdlib/ptstdlib.js programa.ptjs
```

## Backend nativo

O projeto agora tambem expone um backend nativo local para subconjunto do
PTJS:

```sh
./bin/gatocore ir arquivo.ptjs
./bin/gatocore asm arquivo.ptjs
./bin/gatocore native-build arquivo.ptjs
./bin/gatocore native-run arquivo.ptjs
./bin/gatocore jit arquivo.ptjs
```

Esse fluxo cobre hoje:

- `definir`
- atribuicao `=`
- `mostrar`
- `retornar`
- `se`, `senão`, `enquanto`, `para cada`
- `função`
- inteiros, booleanos, `null`, strings e listas constantes
- chamadas diretas, recursao e `retornar` vazio
- `tamanho de`, `tipo de`, `identificar`, `observar`

## Palavras da linguagem

| Palavra | Categoria | Reservada no modo PT | Significado | Exemplo |
| --- | --- | --- | --- | --- |
| `definir` | declaracao | sim | cria variavel lexical | `definir nome como "gato"` |
| `como` | conector | sim | liga nome e valor em `definir` | `definir x como 1` |
| `mostrar` | statement | sim | imprime com quebra de linha | `mostrar x` |
| `se` | controle | sim | abre condicional | `se ok então ... fim` |
| `então` | conector | sim | separa condicao e bloco | `se ok então` |
| `senão` | controle | sim | abre ramo alternativo | `senão` |
| `fim` | delimitador | sim | fecha bloco PTJS | `fim` |
| `enquanto` | controle | sim | abre laco | `enquanto ativo faça ... fim` |
| `faça` | conector | sim | separa cabecalho e bloco | `enquanto x faça` |
| `para` | controle | sim | inicia `para cada` | `para cada item ...` |
| `cada` | conector | sim | parte de `para cada` | `para cada item ...` |
| `em` | conector | sim | liga binding e colecao | `para cada x em lista` |
| `função` | declaracao | sim | declara funcao | `função soma(a, b) faça ... fim` |
| `retornar` | controle | sim | retorna de funcao | `retornar total` |
| `de` | conector semantico | sim | parte de `tipo de` e `tamanho de` | `tipo de valor` |
| `tipo` | operador contextual | nao | abre `tipo de` | `tipo de valor` |
| `tamanho` | operador contextual | nao | abre `tamanho de` | `tamanho de lista` |
| `identificar` | operador semantico | sim | descreve semanticamente um valor | `identificar texto` |
| `observar` | operador semantico | sim | observa e retorna o proprio valor | `observar x` |

## Variantes aceitas

As formas oficiais sao acentuadas quando aplicavel:

- `então`
- `senão`
- `faça`
- `função`

Por compatibilidade, o parser atual tambem aceita:

- `entao`
- `senao`
- `faca`
- `funcao`

Mesmo assim, a forma recomendada na documentacao e nos exemplos continua
sendo a acentuada.

## Formas canonicas da linguagem

### Declaracao

```txt
definir nome como expressao
```

Exemplo:

```txt
definir total como 10
```

### Exibicao

```txt
mostrar expressao
```

Exemplo:

```txt
mostrar "ola"
```

### Condicional

```txt
se condicao então
  bloco
fim
```

ou

```txt
se condicao então
  bloco
senão
  bloco
fim
```

### Laco

```txt
enquanto condicao faça
  bloco
fim
```

### Iteracao

```txt
para cada item em colecao faça
  bloco
fim
```

### Funcao

```txt
função nome faça
  bloco
fim
```

ou

```txt
função nome(a, b) faça
  bloco
fim
```

### Retorno

```txt
retornar expressao
```

ou

```txt
retornar
```

### Operadores semanticos

```txt
tamanho de valor
tipo de valor
identificar valor
observar valor
```

## Funcoes e operadores do PTJS

### `mostrar valor`

- imprime o valor no stdout
- adiciona quebra de linha
- retorna `indefinido`

Exemplo:

```txt
mostrar "ola"
```

### `tamanho de valor`

- retorna tamanho semantico do valor
- funciona com texto, listas, colecoes com `size` e valores com `byteLength`
- gera erro se o valor nao tiver nocao de tamanho

Exemplo:

```txt
mostrar tamanho de "abc"
```

Resultado:

```txt
3
```

### `tipo de valor`

- retorna nome de tipo canonico em texto

Exemplo:

```txt
mostrar tipo de [1, 2]
```

Resultado:

```txt
"lista"
```

### `identificar valor`

- retorna um descritor estruturado
- nao imprime sozinho

Exemplo:

```txt
mostrar identificar "abc"
```

Resultado esperado:

```txt
{ tipo: "texto", tamanho: 3 }
```

### `observar valor`

- emite uma observacao diagnostica
- retorna o proprio valor

Exemplo:

```txt
mostrar observar "abc"
```

Saida tipica:

```txt
[observar tipo=texto] "abc"
"abc"
```

## Builtins globais do runtime

### Terminal

#### `escrever(valor...)`

- escreve no stdout sem quebra de linha obrigatoria
- aceita um ou mais valores
- retorna `indefinido`

#### `limpar_tela()`

- limpa a tela via ANSI
- retorna `indefinido`

#### `mover_cursor(coluna, linha)`

- move o cursor
- usa coordenadas 1-based
- retorna `indefinido`

#### `ocultar_cursor()`

- oculta o cursor
- retorna `indefinido`

#### `mostrar_cursor()`

- mostra o cursor novamente
- retorna `indefinido`

#### `tamanho_terminal()`

- retorna objeto com `largura` e `altura`

Exemplo:

```txt
definir term como tamanho_terminal()
mostrar term.largura
mostrar term.altura
```

#### `ativar_terminal_cru()`

- coloca o terminal em modo cru quando suportado
- usado para leitura de tecla em tempo real

#### `desativar_terminal_cru()`

- restaura o terminal ao modo normal

#### `ler_tecla(timeout_ms)`

- aguarda ate `timeout_ms` milissegundos
- retorna texto com os bytes lidos
- retorna `nulo` quando nenhuma tecla chegou no prazo

### Tempo

#### `agora_ms()`

- retorna timestamp numerico em milissegundos

#### `esperar(timeout_ms)`

- pausa a execucao por aproximadamente `timeout_ms`
- retorna `indefinido`

### Video

#### `video_suportado()`

- informa se o backend de video do host esta disponivel

#### `video_backend()`

- retorna nome do backend ativo ou disponivel
- no estado atual local, o backend do Doom PTJS e `x11-host`

#### `video_erro()`

- retorna texto com o ultimo diagnostico do backend de video

#### `video_abrir(largura, altura, escala, titulo)`

- abre uma janela grafica do host
- prepara framebuffer para `video_apresentar`
- retorna `booleano`

#### `video_apresentar(frame_rgba)`

- apresenta um frame RGBA vindo de `ArrayBuffer` ou `Uint8Array`
- faz a escala de pixel art no proprio backend

#### `video_entrada()`

- retorna objeto com estado de teclas relevantes da janela
- hoje cobre `left`, `right`, `up`, `down`, `w`, `a`, `s`, `d`, `q`, `e`,
  `tab`, `m`, `r`, `space`, `enter`, `x` e `quit`

#### `video_fechar()`

- fecha a janela grafica atual

### Arquivos

#### `ler_texto(caminho)`

- le arquivo como texto
- retorna `texto`

#### `ler_bytes(caminho)`

- le arquivo como bytes
- retorna `ArrayBuffer`

#### `escrever_texto(caminho, conteudo)`

- grava texto em arquivo
- retorna quantidade de bytes escritos

#### `arquivo_existe(caminho)`

- retorna `true` ou `false`

#### `apagar_arquivo(caminho)`

- remove o arquivo
- retorna `true` ou `false`

Regra de caminho para arquivos:

- caminhos relativos sao resolvidos em relacao ao script PTJS atual

### Execucao e composicao

#### `argumentos()`

- retorna lista de argumentos do script

#### `incluir(caminho)`

- avalia outro script PTJS no mesmo contexto
- includes aninhados preservam resolucao relativa correta

#### `sair(codigo)`

- encerra o processo com codigo opcional
- tenta restaurar o terminal antes de sair

## Stdlib tecnica autocarregada

No fluxo oficial do `gatocore`, alem do runtime base acima, tambem e
carregada `stdlib/ptstdlib.js`.

Essa camada:

- transforma os verbetes de `docs/lista_palavras.md` em funcoes globais
- oferece implementacoes diretas para parte da superficie
- cria construtores tecnicos para recursos e tipos
- permite ligar operacoes de host via `registrar("termo", fn)`

Exemplos de termos uteis nessa camada:

- `resultado`
- `evento`
- `metrica`
- `tokenizar`
- `embedding`
- `indice_vetorial`
- `vizinho_proximo`
- `varrer_arquivo`
- `pcap`
- `pcapng`
- `dissecar`
- `padrao_kkrieger`
- `arena`
- `bitset`
- `fila_circular`
- `pool`
- `vetor_compacto`
- `embedding_compacto`
- `indice_vetorial_compacto`

Para referencia detalhada da stdlib, veja `STDLIB.md`.

## Perfil Kkrieger

O projeto agora documenta `docs/padrao_kkrieger.md` como padrao duro para
estruturas low-level e hot paths.

Na pratica, isso significa:

- preferir typed arrays em caminhos quentes
- evitar `shift()` e outras operacoes com custo de copia evitavel
- usar `arena`, `pool`, `bitset` e `fila_circular` quando houver capacidade
  previsivel
- tratar JSON, logs e strings como fronteira de I/O, nao como formato
  interno de processamento

## Tipos canonicos retornados por `tipo de`

Os nomes de tipo canonicos atualmente documentados pelo runtime sao:

- `indefinido`
- `nulo`
- `booleano`
- `numero`
- `texto`
- `simbolo`
- `funcao`
- `lista`
- `objeto`

Exemplos:

```txt
mostrar tipo de null
mostrar tipo de [1, 2]
mostrar tipo de "abc"
```

Saida:

```txt
"nulo"
"lista"
"texto"
```

## Regras da linguagem

### 1. O modo PTJS e explicito

- a linguagem em portugues so fica ativa com `--lang=pt` ou pelo wrapper
  `gatocore`
- para usar o engine direto com a stdlib tecnica, inclua
  `-I stdlib/ptstdlib.js`

### 2. Blocos fecham com `fim`

- quebras de linha e indentacao nao fecham bloco
- o fechamento estrutural e sempre `fim`

### 3. `tipo` e `tamanho` sao contextuais

- podem ser usados como identificadores comuns
- mas `tipo de` e `tamanho de` continuam sendo operadores semanticos

Exemplo valido:

```txt
definir tamanho como 7
mostrar tamanho
```

### 4. `identificar` e `observar` sao reservados

- no modo PTJS, nao devem ser usados como nomes de variaveis ou funcoes

### 5. `de` e reservado no modo PTJS

- ele existe como parte das formas `tipo de` e `tamanho de`
- fora disso, nao deve ser usado como identificador no dialeto

### 6. Arquivos `.ptjs` devem estar em UTF-8

- a forma oficial das palavras acentuadas pressupoe UTF-8

### 7. O PTJS convive com expressoes JavaScript normais

- expressoes, operadores e objetos do JavaScript base continuam disponiveis
- o dialeto acrescenta construcoes em portugues sobre o parser/runtime

Exemplo:

```txt
definir total como Math.max(3, 7)
mostrar total
```

### 8. `mostrar` e `escrever` nao sao a mesma coisa

- `mostrar` imprime e quebra linha
- `escrever` imprime sem forcar quebra de linha

### 9. Caminhos relativos seguem o script atual

- vale para `ler_texto`
- vale para `ler_bytes`
- vale para `escrever_texto`
- vale para `arquivo_existe`
- vale para `apagar_arquivo`
- vale para `incluir`

### 10. Terminal live depende de ambiente compativel

- as funcoes de terminal foram validadas localmente em Linux
- uso live faz mais sentido em TTY real

## Regras praticas de estilo

- prefira as palavras acentuadas oficiais
- use as formas canonicas documentadas
- feche sempre blocos com `fim`
- prefira `mostrar` para saida simples e `observar` para diagnostico
- prefira `incluir` para compor scripts PTJS do mesmo projeto

## Exemplos curtos

### Variavel

```txt
definir nome como "GatoCore"
mostrar nome
```

### Condicional

```txt
definir ativo como 1

se ativo então
  mostrar "ok"
senão
  mostrar "nao"
fim
```

### Funcao

```txt
função soma(a, b) faça
  retornar a + b
fim

mostrar soma(2, 3)
```

### Loop live de terminal

```txt
ativar_terminal_cru()
ocultar_cursor()

definir rodando como 1

enquanto rodando faça
  limpar_tela()
  mover_cursor(1, 1)
  escrever("Pressione x para sair\n")

  definir tecla como ler_tecla(50)
  se tecla !== null && tecla.indexOf("x") >= 0 então
    rodando = 0
  fim

  esperar(50)
fim

mostrar_cursor()
desativar_terminal_cru()
```

## Limitacao conhecida

O projeto ainda esta em `alpha funcional local`.

Isso significa que:

- a linguagem ja e util e testada localmente
- a stdlib tecnica ja exporta o dicionario como funcoes chamaveis
- mas ainda existem corner cases de parser, operacoes de host sem backend e
  endurecimento em andamento
- este dicionario descreve a superficie atual, nao uma especificacao 1.0
