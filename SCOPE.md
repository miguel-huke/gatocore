# Scope

## Escopo inicial

O escopo inicial de GatoCore e a implementacao de uma feature experimental de linguagem sobre QuickJS, ativada por modo explicito, com foco em scripts, fluxo de controle e expressoes semanticas simples em portugues.

## O que entra no MVP

- fork do QuickJS dentro de `engines/quickjs`
- estudo e mapeamento dos pontos de extensao do engine
- modo de linguagem em portugues ativado explicitamente
- conjunto inicial de palavras reservadas em portugues
- parsing nativo de statements basicos
- parsing nativo de expressoes semanticas prefixadas
- lowering para operacoes internas do motor
- builtins e intrinsics minimas para executar o nucleo da linguagem
- CLI experimental para execucao de arquivos e codigo inline
- testes minimos de lexer, parser e execucao

## Construcoes obrigatorias do MVP

### Statements

- `definir identificador como expressao`
- `mostrar expressao`
- `se expressao então ... fim`
- `se expressao então ... senão ... fim`
- `enquanto expressao faça ... fim`
- `para cada identificador em expressao faça ... fim`
- `função identificador faça ... fim`
- `função identificador(parametros) faça ... fim`
- `retornar expressao`

### Expressoes semanticas

- `tamanho de X`
- `tipo de X`
- `identificar X`
- `observar X`

## Modo de compatibilidade

O modo portugues nao deve ser implicitamente misturado ao JavaScript tradicional na primeira versao.

A ativacao inicial prevista e por flag de CLI, por exemplo:

```txt
qjs --lang=pt arquivo.ptjs
```

Extensao de arquivo dedicada pode ser adicionada depois, mas nao e requisito inicial.

## Escopo documental

Este repositorio deve manter como base minima:

- visao
- escopo
- nao objetivos
- principios
- mapa do engine
- especificacao da feature
- especificacao lexical
- gramatica
- AST ou representacao estrutural equivalente
- builtins e intrinsics
- erros

## Recorte tecnico inicial

O MVP nao vai cobrir todo o JavaScript.
Ele vai cobrir um subconjunto pequeno, canonicamente definido, suficiente para:

- declarar valores
- inspecionar propriedades semanticas basicas
- exibir resultados
- controlar fluxo
- declarar funcoes simples
- iterar colecoes

## Criterios de aceite do escopo

O escopo inicial esta correto se:

- qualquer nova palavra proposta puder ser justificada em termos de semantica unica
- cada construcao do MVP tiver forma canonica e lowering definidos
- houver um caminho de implementacao claro no QuickJS
- for possivel dizer com precisao o que esta fora da versao alfa
