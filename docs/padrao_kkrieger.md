# Padrao Kkrieger

## Objetivo

Definir o `padrao kkrieger` como referencia dura de desenvolvimento para o
GatoCore quando o codigo estiver em:

- hot paths
- loops por frame
- estruturas de runtime de baixo nivel
- pipelines de scan, rede, jogo e IA local

O nome vem da filosofia associada ao `.kkrieger`: `gerar mais e armazenar
menos`, manter estruturas compactas e tratar custo de memoria como requisito
de arquitetura, nao como detalhe posterior.

## O que este padrao significa no GatoCore

No estado atual do projeto, `padrao kkrieger` ja inclui um backend nativo
real para um subconjunto estruturado do PTJS.

Ainda assim, ele `nao` significa que o PTJS inteiro ou a stdlib tecnica
inteira ja compilem automaticamente para assembly nativo em todos os fluxos.

Ele significa que o projeto deve ser desenhado para:

- minimizar estado persistido e estruturas inchadas
- preferir geracao procedimental e reconstrucao deterministica
- reduzir alocacao em tempo de execucao
- usar layouts compactos e typed arrays quando o caminho for critico
- separar I/O e serializacao da parte numerica e iterativa

## Regras duras

### 1. Hot path sem alocacao evitavel

- loops criticos nao devem criar arrays, objetos ou strings por iteracao sem
  necessidade real
- quando houver buffer reutilizavel, ele deve ser reutilizado

### 2. Capacidade explicita

- estruturas de alto uso devem declarar capacidade maxima
- crescimento implicito so e aceitavel fora do hot path

### 3. Layout compacto primeiro

- preferir `Uint8Array`, `Uint16Array`, `Uint32Array`, `Float32Array`,
  `Float64Array` e `DataView`
- preferir `bitset`, `arena`, `pool`, `fila_circular` e `vetor_compacto`
  em vez de objetos aninhados quando a carga for intensiva

### 4. Gerar em vez de armazenar

- derivar dados a partir de sementes, regras ou tabelas pequenas quando isso
  reduzir armazenamento e estado mutavel
- snapshots grandes e caches extensos precisam de justificativa

### 5. Strings fora do caminho critico

- usar strings apenas em fronteiras de CLI, logs, arquivos e protocolo
- dentro de pipeline numerico, preferir ids, enums e offsets

### 6. Serializacao so na borda

- `JSON.stringify`, markdown rico e estruturas de log detalhadas devem ficar
  fora dos loops centrais
- o formato de execucao deve ser mais compacto que o formato de debug

### 7. Estruturas de reuso obrigatorias

- filas frequentes devem usar `fila_circular` ou outra estrutura de reuso
- lotes de objetos repetidos devem usar `pool`
- buffers temporarios devem preferir `arena`

### 8. Modo debug separado do modo rapido

- diagnostico verboso e dumps ricos nao devem ser a unica forma de operacao
- caminhos de producao precisam continuar enxutos

### 9. Custo de copia e custo de cache importam

- evitar concatenacao repetida de arrays
- preferir copia unica com tamanho conhecido
- preferir acesso sequencial de memoria

### 10. Assembly e nativo sao obrigacao incremental

- o projeto agora deve manter coerencia entre stdlib compacta e backend
  nativo subset
- a existencia do backend nativo nao autoriza regressao para estruturas
  inchadas no caminho interpretado

## Superficie atual do padrao no projeto

Nesta rodada, o padrao foi materializado em dois niveis.

### Estruturas compactas

- `padrao_kkrieger()`
- `buffer_fixo(tamanho, fill?)`
- `arena(tamanho)`
- `bitset(bits)`
- `fila_circular(capacidade)`
- `pool(capacidade, seed?)`
- `vetor_compacto(tipo, dados_ou_tamanho)`
- `embedding_compacto(valor, dimensao?)`
- `indice_vetorial_compacto(lista, dimensao?)`

Tambem foram alinhados hot paths ja existentes:

- `fila()` agora evita `shift()` em loop frequente
- `stream()` agora evita `shift()` em loop frequente
- `reassemblar_fluxo()` agora faz copia unica com tamanho total precomputado
- `indice_vetorial()` passou a usar matriz compacta em `Float32Array`

### Backend nativo real

Agora tambem existe:

- `compiler/ptjs_native.js`
- `runtime/native_runtime.c`
- `snippets/` como base reutilizavel de keywords, IR, ABI, peephole e toolchain
- comandos `ir`, `asm`, `native-build`, `native-run` e `jit`
- lowering PTJS subset -> IR -> assembly x86_64 SysV
- alocacao linear de registradores para temporarios
- peephole textual sobre assembly

## Regras de projeto para novas features

Toda feature nova que toque execucao intensiva deve responder explicitamente:

1. Qual e o layout de memoria?
2. Qual e a capacidade maxima esperada?
3. Onde ocorre alocacao em loop?
4. O estado pode ser gerado a partir de seed ou tabela compacta?
5. Existe forma compacta separada do modo debug?

Se a resposta for ruim, a feature ainda nao esta pronta para entrar.

## O que ainda falta para um padrao kkrieger completo

Mesmo com esta rodada, ainda faltam etapas grandes:

- alocador e layout mais compactos no proprio runtime do engine
- ampliar o backend nativo para a linguagem inteira
- SSA mais rica e pipeline de otimizacao mais profunda
- perfil de release com stripping e pack de artefatos
- contratos de FFI e ABI para chamadas nativas de baixo custo

## Mapeamento apos esta rodada

### Ja aplicado

- estruturas compactas de stdlib
- reuso em filas e streams
- busca vetorial mais compacta
- documentacao dura de arquitetura
- backend nativo subset com AOT local, JIT local via build temporario,
  register allocation e peephole

### Proximo nivel tecnico

- `buffer_fixo` e `arena` em samples grandes
- mais pipelines de scan e jogo sobre `bitset`, `pool` e `vetor_compacto`
- reduzir JSON e objetos temporarios em samples operacionais

### Nivel futuro

- ampliar IR e lowering para mais construcoes do PTJS
- adicionar objetos, colecoes dinamicas e mais builtins ao backend nativo
- explorar IR para assembly adicional ou WASM
- endurecer toolchain de build orientada a tamanho

## Regra final

No GatoCore, `padrao kkrieger` passa a significar:

`memoria, tamanho e custo de runtime sao restricoes de primeira classe`.

Nao e um tema estetico do projeto. E uma politica de implementacao.
