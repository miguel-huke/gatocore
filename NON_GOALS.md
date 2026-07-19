# Non Goals

## Nao objetivos da primeira versao

### Linguagem natural livre

GatoCore nao tentara interpretar portugues livre, frases naturais ou formulacoes subjetivas.

### Cobertura total de JavaScript

O projeto nao tentara espelhar toda a linguagem JavaScript no MVP.
O foco e um nucleo pequeno, coeso e testavel.

### Transpiler como nucleo da proposta

Ferramentas de traducao podem existir no futuro, mas nao sao o centro do projeto.
A feature precisa existir no engine.

### Biblioteca cosmetica

Nao basta fornecer funcoes JS com nomes em portugues.
O objetivo e alterar lexer, parser, lowering e runtime.

### Multiplos sinonimos

Nao haverá dezenas de formas equivalentes para expressar a mesma operacao.
Sinônimos reduzem previsibilidade e aumentam ambiguidade.

### Compatibilidade total com Node ou navegador

O primeiro compromisso e com o prototipo do engine, nao com integracao ampla de ecossistema.

### Port imediato para V8

V8 nao e prioridade do MVP.
Portar cedo demais adicionaria complexidade excessiva.

### Sistema de tipos novo

O projeto nao vai introduzir um type system completo, inferencia de tipos ou checker separado na primeira versao.

### Metaprogramacao avancada

Macros, metalinguagens, DSLs embarcadas e geracao de gramatica nao fazem parte da fase inicial.

### Otimizacao prematura

O foco inicial e corretude, clareza de arquitetura e capacidade de evolucao.
Benchmark vira depois da primeira cadeia funcional.
