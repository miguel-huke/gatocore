# Lexical Spec

## Objetivo

Definir os lexemas, tokens e regras de reservacao do modo portugues.

## Regra de compatibilidade

As palavras abaixo sao reservadas apenas quando o parser estiver em modo portugues.
Fora desse modo, o comportamento padrao do QuickJS deve ser preservado.

## Tabela lexical inicial

| Lexema | Token sugerido | Categoria | Reservado em modo pt | Observacoes |
| --- | --- | --- | --- | --- |
| `definir` | `TOK_PT_DEFINIR` | declaracao | sim | inicia declaracao lexical |
| `como` | `TOK_PT_COMO` | conector | sim | liga nome e expressao em `definir` |
| `mostrar` | `TOK_PT_MOSTRAR` | statement | sim | aciona exibicao |
| `se` | `TOK_PT_SE` | controle | sim | abre condicional |
| `então` | `TOK_PT_ENTAO` | conector | sim | separa condicao e bloco |
| `senão` | `TOK_PT_SENAO` | controle | sim | abre ramo alternativo |
| `fim` | `TOK_PT_FIM` | delimitador | sim | fecha blocos do dialeto |
| `enquanto` | `TOK_PT_ENQUANTO` | controle | sim | abre laco |
| `faça` | `TOK_PT_FACA` | conector | sim | separa cabecalho de bloco |
| `para` | `TOK_PT_PARA` | controle | sim | inicia `para cada` |
| `cada` | `TOK_PT_CADA` | conector | sim | liga `para` ao binding |
| `em` | `TOK_PT_EM` | conector | sim | liga binding e iteravel |
| `função` | `TOK_PT_FUNCAO` | declaracao | sim | inicia declaracao de funcao |
| `retornar` | `TOK_PT_RETORNAR` | controle | sim | retorno de funcao |
| `de` | `TOK_PT_DE` | conector semantico | sim | usado em `tamanho de` e `tipo de` |
| `tipo` | `TOK_PT_TIPO` | operador semantico contextual | nao | pode virar identificador quando nao vier seguido de `de` |
| `tamanho` | `TOK_PT_TAMANHO` | operador semantico contextual | nao | pode virar identificador quando nao vier seguido de `de` |
| `identificar` | `TOK_PT_IDENTIFICAR` | operador semantico | sim | expressao unaria semantica |
| `observar` | `TOK_PT_OBSERVAR` | operador semantico | sim | expressao unaria semantica |

## Normalizacao

- acentos fazem parte da forma oficial dos lexemas `função`, `então`, `senão` e `faça`
- o scanner deve aceitar UTF-8 corretamente
- nao deve existir normalizacao silenciosa entre formas acentuadas e sem acento no MVP

## Identificadores

No modo portugues:

- um identificador comum pode conter letras ASCII, `_`, `$` e identificadores Unicode conforme a regra do QuickJS
- palavras reservadas estruturais do modo portugues nao podem ser usadas como identificadores
- `tipo` e `tamanho` sao contextuais: podem ser nomes validos, mas `tipo de` e `tamanho de` continuam sendo operadores

## Espacos e quebras de linha

- espacos e comentarios continuam seguindo a semantica padrao do QuickJS
- quebras de linha nao delimitam blocos por si mesmas
- `fim` e o delimitador estrutural do dialeto

## Regras de lookahead

Os seguintes prefixos exigem lookahead simples:

- `definir` -> espera identificador e depois `como`
- `se` -> espera expressao e depois `então`
- `enquanto` -> espera expressao e depois `faça`
- `para` -> espera `cada`, depois binding, depois `em`, depois expressao e `faça`
- `tamanho` -> espera `de`
- `tipo` -> espera `de`

## Decisoes de implementacao

### Estrategia preferida

1. scanner le identificador normalmente
2. em modo portugues, identificadores com atoms equivalentes aos lexemas reservados sao reclassificados para `TOK_PT_*`
3. lookahead leve continua disponivel para decidir parses ambiguos

### Estrategia evitada

Reordenar agressivamente o conjunto inteiro de keywords nativas do QuickJS so para encaixar o dialeto.

## Casos de teste lexicos minimos

- `definir`
- `mostrar`
- `tamanho de`
- `tipo de`
- `para cada item em lista faça`
- `senão`
- `função`
- `identificar valor`
- `observar valor`
- `definir tamanho como 1` deve ser valido
- `definir tipo como "texto"` deve ser valido
- `definirx` deve permanecer identificador
- `tamanhox` deve permanecer identificador
