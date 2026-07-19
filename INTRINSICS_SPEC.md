# Intrinsics Spec

## Objetivo

Definir os helpers internos que sustentam o lowering do dialeto.

## Escopo

Este documento cobre `intrinsics internas`.

Os builtins de plataforma expostos ao usuario, como `ler_tecla`,
`ler_texto` ou `incluir`, ficam em `BUILTINS_SPEC.md` porque sao superficie
publica e nao intrinsics privadas.

## Intrinsics atuais

### `__pt_show(value)`

Uso:
lowering de `mostrar`.

Contrato:

- recebe um valor
- escreve no stdout
- retorna `undefined`

### `__pt_size_of(value)`

Uso:
lowering de `tamanho de`.

Contrato:

- retorna comprimento semantico
- aceita texto, arrays, colecoes com `size` e valores com `byteLength`
- lanca erro quando a nocao de tamanho nao existir

### `__pt_type_of(value)`

Uso:
lowering de `tipo de`.

Contrato:

- retorna um texto de tipo canonico
- nao depende cegamente do `typeof` cru quando isso reduzir clareza

### `__pt_identify(value)`

Uso:
lowering de `identificar`.

Contrato:

- retorna descritor estruturado
- pode incluir `tipo`, `classe` e `tamanho`

### `__pt_observe(value)`

Uso:
lowering de `observar`.

Contrato:

- emite observacao diagnostica
- retorna o proprio valor

## Registro

Essas intrinsics devem ser registradas durante a criacao do contexto para
manter o lowering estavel mesmo quando a superficie publica crescer.
