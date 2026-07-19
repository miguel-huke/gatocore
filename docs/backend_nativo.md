# Backend Nativo PTJS

## Objetivo

Documentar o backend nativo atual do GatoCore.

Ele materializa o fluxo:

`PTJS subset -> IR -> assembly x86_64 SysV -> binario nativo`

## Estado atual

O backend nativo existe e funciona localmente em Linux x86_64.

Hoje ele entrega:

- tokenizer e parser proprios para um subconjunto estruturado do PTJS
- lowering para IR explicita
- alocacao linear de registradores para temporarios
- peephole textual sobre a assembly emitida
- AOT com `native-build`
- execucao estilo JIT local com `native-run` e `jit`
- runtime C minimo para `mostrar`, `observar`, `identificar` e `tamanho de`
- listas compactas constantes, `para cada`, booleanos, `null` e `retornar` vazio

## Comandos

```sh
./bin/gatocore ir arquivo.ptjs
./bin/gatocore asm arquivo.ptjs
./bin/gatocore native-build arquivo.ptjs
./bin/gatocore native-run arquivo.ptjs
./bin/gatocore jit arquivo.ptjs
```

Atalhos via `make`:

```sh
make ir FILE=tests/native/ola.ptjs
make asm FILE=tests/native/ola.ptjs
make native-build FILE=tests/native/ola.ptjs
make native-run FILE=tests/native/ola.ptjs
make jit FILE=tests/native/ola.ptjs
make native-test
```

## Subconjunto suportado

Statements:

- `definir nome como expr`
- `nome = expr`
- `mostrar expr`
- `retornar`
- `retornar expr`
- `se ... então ... senão ... fim`
- `enquanto ... faça ... fim`
- `para cada item em colecao faça ... fim`
- `função nome(...) faça ... fim`
- chamada de funcao por nome

Expressoes:

- inteiros
- booleanos
- `null`
- strings
- listas constantes homogeneas, inclusive aninhadas
- identificadores
- chamadas diretas
- `+`, `-`, `*`, `/`, `%`
- `==`, `!=`, `<`, `<=`, `>`, `>=`
- `&&`, `||`, `!`
- `tamanho de`
- `tipo de`
- `identificar`
- `observar`

## Restricoes atuais

- alvo unico: Linux x86_64 SysV
- no maximo 6 parametros por funcao
- listas nativas hoje sao constantes homogeneas
- comparacoes nativas hoje suportam numeros e igualdade escalar simples
- `tamanho de` nativo hoje suporta texto e lista
- `para cada` nativo hoje suporta texto e lista
- ainda nao ha objetos, stdlib inteira ou host runtime no backend nativo
- ainda nao ha SSA completa, FFI ampla ou JIT residente em memoria

## Arquivos centrais

- `compiler/ptjs_native.js`
- `runtime/native_runtime.c`
- `snippets/`
- `tools/test_native.sh`
- `tests/native/`
- `samples/native_backend_demo.ptjs`

## Resultado pratico

O projeto agora tem uma base real para evoluir o `padrao kkrieger` no sentido
forte.

O que ainda falta para um backend geral do PTJS:

- ampliar o subset para o dialeto inteiro
- acrescentar objetos e colecoes dinamicas
- suportar mais builtins e a stdlib tecnica no lowering nativo
- estabilizar ABI, FFI e multiplataforma
- mover de linear-scan simples para pipeline de otimizacao mais profunda
