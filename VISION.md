# Vision

## Nome de trabalho

GatoCore

## Declaração

GatoCore existe para provar que uma feature de linguagem em portugues operacional formalizado pode ser implementada no nivel do engine JavaScript, com gramatica propria, semantica previsivel e execucao direta no motor.

O projeto nao quer "parecer pseudocodigo".
O projeto quer ser linguagem de verdade.

## Problema

JavaScript e flexivel e poderoso, mas sua superficie sintatica possui alta variacao, muitos atalhos e diversas formas equivalentes de expressar a mesma intencao. Isso aumenta:

- custo de aprendizagem
- custo de leitura
- entropia sintatica para geracao por IA
- risco de ambiguidades quando se busca uma linguagem mais canonica

O projeto parte da seguinte tese:
uma linguagem menor, mais regular e mais explicita pode ser melhor para ensino, automacao e geracao assistida, desde que sua resolucao aconteca dentro do engine.

## Visao de produto

O usuario deve conseguir escrever:

```txt
definir texto como "gato.exe"
definir tamanho como tamanho de texto
mostrar tamanho
```

e obter execucao direta no engine modificado, sem depender de tradutor externo como mecanismo principal.

## Visao tecnica

O produto final deve combinar:

- lexer com tokens em portugues
- parser com gramaticas proprias para statements e expressoes semanticas
- lowering estavel para estruturas internas do engine
- builtins e intrinsics controladas no runtime
- modo de ativacao explicito para evitar conflitos com JavaScript tradicional

## Resultado esperado do prototipo

Na primeira versao util, o projeto deve entregar:

- engine QuickJS modificado
- suporte a um nucleo pequeno da linguagem
- CLI experimental para arquivos e codigo inline
- mensagens de erro especificas
- documentacao suficiente para evoluir sem depender de memoria oral

## Estrategia geral

O projeto avancara em dois trilhos paralelos:

- trilho de implementacao: engine, parser, lowering, runtime, CLI e testes
- trilho de especificacao: visao, escopo, gramatica, semantica, erros e compatibilidade

## Decisao estrutural

QuickJS e a base inicial.
V8 fica para uma fase posterior, somente depois de:

- MVP funcional
- semantica congelada
- gramatica estabilizada
- conjunto minimo de testes

## Criterio de sucesso

O prototipo tera cumprido sua missao inicial quando:

- palavras em portugues forem reconhecidas como elementos nativos da linguagem
- a nova gramatica for aceita pelo parser
- o lowering estiver integrado ao pipeline de execucao do engine
- programas simples em portugues rodarem diretamente no motor
- a feature estiver documentada como recurso real de linguagem
