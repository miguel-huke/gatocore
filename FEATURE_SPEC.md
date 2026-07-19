# Feature Spec

## Nome

Modo Portugues Operacional

## Status

Alpha funcional local

Com backend nativo local para subconjunto estruturado do PTJS.

## Objetivo

Adicionar ao engine JavaScript um dialeto canonico em portugues com sintaxe,
parser, lowering e runtime explicitos.

## Propriedades obrigatorias

- feature de linguagem, nao biblioteca cosmetica
- parser proprio para o dialeto
- lowering definido para cada construcao
- runtime com suporte explicito para operacoes novas
- ativacao controlada por modo ou flag

## Ativacao

O modo portugues e ativado explicitamente.

Referencia atual:

```txt
--lang=pt
```

Fora desse modo, as palavras do dialeto continuam livres para uso como
identificadores normais em JavaScript tradicional, na medida do possivel.

## Linguagem suportada

Palavras e operadores:

- `definir`
- `como`
- `mostrar`
- `se`
- `então`
- `senão`
- `fim`
- `enquanto`
- `faça`
- `para`
- `cada`
- `em`
- `função`
- `retornar`
- `de`
- `tipo`
- `tamanho`
- `identificar`
- `observar`

Observacoes:

- `tipo` e `tamanho` sao operadores contextuais
- `identificar` e `observar` permanecem reservados no modo portugues

## Statements suportados

- declaracao: `definir nome como expressao`
- exibicao: `mostrar expressao`
- condicional: `se ... então ... senão ... fim`
- laco: `enquanto ... faça ... fim`
- iteracao: `para cada item em colecao faça ... fim`
- funcao: `função nome(...) faça ... fim`
- retorno: `retornar expressao`

## Expressoes semanticas suportadas

- `tamanho de X`
- `tipo de X`
- `identificar X`
- `observar X`

## Runtime de plataforma atual

O prototipo atual ja inclui uma camada de plataforma para:

- terminal ANSI e cursor
- input por tecla com timeout
- tempo e espera
- leitura e escrita de arquivos
- inclusao de scripts PTJS
- acesso a argumentos de script

Tambem inclui uma `stdlib tecnica autocarregada` no fluxo oficial do
`gatocore`, gerada a partir de `docs/lista_palavras.md`.

Essa camada expoe funcoes globais para IA, rede, jogos, automacao,
antivirus e analise offline, com tres modos de comportamento:

- implementacao direta em JS puro
- construcao de recursos tecnicos
- dispatch para operacoes de host via `registrar(...)`

## Backend nativo atual

O fluxo oficial agora tambem inclui:

- `gatocore ir arquivo.ptjs`
- `gatocore asm arquivo.ptjs`
- `gatocore native-build arquivo.ptjs`
- `gatocore native-run arquivo.ptjs`
- `gatocore jit arquivo.ptjs`

Esse backend cobre um subconjunto estruturado do PTJS com IR, assembly
x86_64 SysV, alocacao de registradores e peephole.

Esse subconjunto agora inclui `para cada`, listas constantes, booleanos,
`null` e `retornar` vazio.

## Fora do escopo atual

- renderer grafico dedicado
- audio, musica e SFX
- empacotamento de distribuicao ampla
- port para V8
- Doom 100% PTJS
- backend nativo geral para toda a stdlib tecnica e toda a linguagem
