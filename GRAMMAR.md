# Grammar

## Objetivo

Definir a gramatica canonica do MVP em portugues operacional.

## Convencoes

- blocos sao fechados por `fim`
- a primeira versao evita sintaxe opcional excessiva
- listas de parametros reutilizam a sintaxe padrao do engine entre parenteses

## EBNF inicial

```ebnf
programa            ::= elemento*

elemento            ::= declaracao_funcao
                      | statement

statement           ::= declaracao
                      | exibicao
                      | condicional
                      | enquanto
                      | para_cada
                      | retorno
                      | expr_stmt

declaracao          ::= "definir" identificador "como" expressao
exibicao            ::= "mostrar" expressao
condicional         ::= "se" expressao "então" bloco ("senão" bloco)? "fim"
enquanto            ::= "enquanto" expressao "faça" bloco "fim"
para_cada           ::= "para" "cada" binding "em" expressao "faça" bloco "fim"
declaracao_funcao   ::= "função" identificador parametros? "faça" bloco "fim"
retorno             ::= "retornar" expressao?
expr_stmt           ::= expressao

bloco               ::= elemento_bloco*
elemento_bloco      ::= statement
binding             ::= identificador
parametros          ::= "(" lista_parametros? ")"
lista_parametros    ::= identificador ("," identificador)*

expressao           ::= expr_semantica
                      | expr_base

expr_semantica      ::= tamanho_expr
                      | tipo_expr
                      | identificar_expr
                      | observar_expr

tamanho_expr        ::= "tamanho" "de" expressao
tipo_expr           ::= "tipo" "de" expressao
identificar_expr    ::= "identificar" expressao
observar_expr       ::= "observar" expressao
```

## Observacao sobre `expr_base`

`expr_base` pode reutilizar o parser de expressoes ja existente no QuickJS, desde que:

- o modo portugues esteja ativo
- expressoes semanticas sejam capturadas antes do fluxo generico
- a linguagem nao aceite combinacoes que contrariem a forma canonica

## Formas canonicamente validas

```txt
definir nome como 10
mostrar nome

se tamanho de nome então
  mostrar nome
fim

enquanto condicao faça
  mostrar condicao
fim

para cada item em lista faça
  mostrar item
fim

função principal faça
  retornar 1
fim

função soma(a, b) faça
  retornar a + b
fim
```

## Formas invalidas

```txt
definir nome 10
mostrar de nome
se condição mostrar nome fim
enquanto condição nome fim
função faça
```

## Precedencia de parse recomendada

### Statements

1. `função`
2. `definir`
3. `mostrar`
4. `se`
5. `enquanto`
6. `para cada`
7. `retornar`
8. expressao generica

### Expressoes

1. `tamanho de`
2. `tipo de`
3. `identificar`
4. `observar`
5. expressao base do QuickJS

## Lowering de referencia

- `definir nome como expr` -> declaracao lexical equivalente
- `mostrar expr` -> chamada de intrinsic de exibicao
- `se`/`senão`/`fim` -> fluxo condicional normal
- `enquanto`/`faça`/`fim` -> fluxo de laco normal
- `para cada`/`em`/`faça`/`fim` -> lowering para `for...of`
- `retornar expr` -> retorno padrao
- `tamanho de expr` -> intrinsic ou acesso semantico de comprimento
- `tipo de expr` -> intrinsic de tipo semantico
- `identificar expr` -> intrinsic de descritor
- `observar expr` -> intrinsic de observacao com retorno do proprio valor
