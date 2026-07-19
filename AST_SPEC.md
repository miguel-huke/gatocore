# AST Spec

## Objetivo

Definir a representacao estrutural do dialeto, mesmo que o QuickJS nao exponha uma AST publica independente.

## Observacao importante

QuickJS mistura parsing e emissao de bytecode em varios pontos.
Por isso, esta especificacao deve ser lida como:

- AST conceitual da feature
- ou representacao estrutural equivalente dentro do parser do engine

## Nos do MVP

### PtDefineStatement

Campos:

- `name`
- `initializer`
- `source_range`

Equivalencia aproximada:

```txt
let name = initializer
```

### PtShowStatement

Campos:

- `argument`
- `source_range`

Lowering:

```txt
__pt_show(argument)
```

### PtIfStatement

Campos:

- `test`
- `consequent`
- `alternate`
- `source_range`

Equivalencia:

```txt
if (test) { consequent } else { alternate }
```

### PtWhileStatement

Campos:

- `test`
- `body`
- `source_range`

Equivalencia:

```txt
while (test) { body }
```

### PtForEachStatement

Campos:

- `binding`
- `iterable`
- `body`
- `source_range`

Equivalencia:

```txt
for (let binding of iterable) { body }
```

### PtFunctionDeclaration

Campos:

- `name`
- `params`
- `body`
- `source_range`

Equivalencia:

```txt
function name(...params) { body }
```

### PtReturnStatement

Campos:

- `argument`
- `source_range`

Equivalencia:

```txt
return argument
```

### PtSemanticUnaryExpression

Campos:

- `operator`
- `argument`
- `source_range`

Operadores iniciais:

- `size_of`
- `type_of`
- `identify`
- `observe`

## Lowering recomendado

### `size_of`

- tentativa de traducao para mecanismo interno equivalente a comprimento
- fallback para intrinsic `__pt_size_of`

### `type_of`

- intrinsic `__pt_type_of`

### `identify`

- intrinsic `__pt_identify`

### `observe`

- intrinsic `__pt_observe`

## Regra de implementacao

Se o parser de QuickJS nao materializar esses nos como estrutura separada, a implementacao ainda deve preservar seus limites conceituais em funcoes distintas, para que:

- a gramatica seja auditavel
- o lowering seja testavel
- a feature nao se torne apenas logica espalhada em switches grandes
