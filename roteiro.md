# Roteiro Completo — Implementação de Nova Feature de Linguagem no Engine JavaScript

## Objetivo

Implementar uma nova feature de linguagem diretamente no engine JavaScript, permitindo escrever código em português operacional formalizado, com resolução semântica integrada ao motor, sem depender de biblioteca, transpiler ou runtime externo como mecanismo principal.

O foco explícito do projeto é a opção 4 discutida anteriormente:
modificar o engine e criar uma feature nova de linguagem, com nova gramática, novos tokens, nova resolução semântica e integração real à execução do motor.

A meta não é apenas “parecer pseudocódigo”.
A meta é fazer o engine aceitar e executar esse pseudocódigo como linguagem de verdade.

---

## Escopo Real do Projeto

Você está construindo:

- uma extensão real da linguagem JavaScript
- implementada dentro de um engine
- com gramática própria em português
- com lowering para estruturas internas do motor
- com builtins e intrinsics específicos
- com capacidade futura de proposta formal de linguagem e eventual padronização

Isso significa que o projeto possui dois trilhos:

- trilho 1: implementação prática em engine modificado
- trilho 2: especificação formal da feature como recurso de linguagem

---

## Resultado Esperado

Ao final, o usuário deverá ser capaz de escrever algo semanticamente próximo disto:

definir texto como "gato.exe"
definir tamanho como tamanho de texto
mostrar tamanho

E isso deverá ser entendido diretamente pelo engine, sem etapa obrigatória de tradução externa.

---

## Arquitetura Geral

Fluxo desejado:

código fonte em português
→ tokenização nativa do engine
→ parsing nativo do engine
→ AST estendida
→ lowering para representação intermediária ou nós internos equivalentes
→ geração de bytecode / execução normal do engine
→ resultado

Regra central:
a sintaxe em português deve ser resolvida na camada de linguagem, não apenas como função de biblioteca.

---

## Decisão de Base Tecnológica

### Engine inicial recomendado

QuickJS deve ser o ponto de partida.

Motivos:
- menor complexidade estrutural
- código mais compacto
- build rápido
- boa legibilidade para estudo de lexer, parser e runtime
- ideal para prototipagem de nova gramática

### Engine alvo posterior

V8 pode ser alvo posterior.

Motivos:
- relevância industrial
- proximidade com ecossistema Node e Chromium
- possibilidade futura de demonstração mais forte

Restrição:
V8 é muito mais complexo, exige conhecimento profundo de parser, AST interna, builtins, infraestrutura C++ e Torque.

Decisão recomendada:
- fase 1 a 12: QuickJS
- fase posterior: V8

---

## Fase 0 — Documento de Fundação

### Objetivo

Congelar o objetivo técnico e impedir desvio de arquitetura.

### Entregáveis

Criar os seguintes arquivos conceituais:
- VISION.md
- SCOPE.md
- NON_GOALS.md
- PRINCIPLES.md

### Conteúdo obrigatório

Definir explicitamente:
- o projeto é uma modificação de engine
- o projeto não é apenas biblioteca JS
- o projeto não usa transpiler como núcleo da proposta
- o projeto quer nova feature de linguagem
- a linguagem será português operacional formalizado
- o foco inicial é scripts, lógica semântica e comandos estruturados
- a gramática será restrita e canônica
- a ambiguidade será tratada como erro, não como flexibilidade

### Critério de conclusão

O projeto passa a ter uma base formal única.
Nada fora desse escopo entra nas primeiras fases.

---

## Fase 1 — Estudo do Engine Escolhido

### Objetivo

Entender exatamente onde a modificação precisa acontecer.

### QuickJS

Estudar:
- tokenização
- parser
- representação de expressões
- criação de funções internas
- builtins
- processo de compilação
- execução

### Itens para mapear

Identificar no código-fonte:
- onde palavras reservadas são reconhecidas
- onde identificadores viram tokens
- onde statements são parseados
- onde expressões especiais são parseadas
- onde builtins são registrados
- onde o bytecode é emitido
- onde o runtime resolve operações internas

### Entregável

Criar um documento:
- ENGINE_MAP.md

### Esse documento deve listar

- arquivo
- função
- responsabilidade
- impacto esperado da modificação

---

## Fase 2 — Definição Formal da Feature

### Objetivo

Definir a feature como recurso de linguagem, não só como implementação improvisada.

### Entregável

Criar:
- FEATURE_SPEC.md

### Definir:

#### Palavras reservadas iniciais
- definir
- como
- mostrar
- se
- então
- senão
- fim
- enquanto
- faça
- para
- cada
- em
- função
- retornar
- de
- tipo
- tamanho
- identificar
- observar

#### Estruturas iniciais
- declaração de variável
- chamada de exibição
- condição
- laço
- função
- retorno
- expressão semântica simples

#### Expressões semânticas iniciais
- tamanho de X
- tipo de X
- identificar X

#### Forma canônica
Exemplos:
- definir nome como valor
- mostrar valor
- se condição então ... fim
- enquanto condição faça ... fim
- tamanho de valor

#### Restrições
- verbo sempre primeiro quando aplicável
- ordem fixa
- sem sinônimos na primeira versão
- sem linguagem natural livre
- sem inferência subjetiva

### Critério de conclusão

Toda feature inicial deve estar descrita semanticamente antes de codificar.

---

## Fase 3 — Definição Léxica

### Objetivo

Transformar as palavras da linguagem em tokens do engine.

### Entregáveis

Criar:
- LEXICAL_SPEC.md

### Itens a definir

Para cada palavra reservada:
- lexema
- token interno
- categoria
- prioridade
- se pode ser usada como identificador em algum modo ou não

### Exemplo de categorias

- declaração
- controle de fluxo
- operador semântico
- conector
- builtin semântico

### Critério de conclusão

Cada palavra nova deve ter um token formalmente definido.

---

## Fase 4 — Modificação do Lexer

### Objetivo

Fazer o engine reconhecer as palavras em português como tokens nativos.

### Implementação

Modificar a rotina que identifica palavras reservadas e identificadores.

### Ações

- adicionar novos tokens ao enum interno
- mapear strings portuguesas para tokens
- preservar compatibilidade com o restante do motor
- garantir que palavras comuns da nova linguagem não sejam tratadas como identificadores genéricos quando forem reservadas

### Casos iniciais para suportar

- definir
- como
- mostrar
- tamanho
- de
- se
- então
- senão
- fim

### Testes necessários

- tokenização de cada palavra isolada
- tokenização em sequência
- mistura com identificadores comuns
- diferenciação correta entre palavra reservada e identificador válido

### Critério de conclusão

O lexer deve produzir os tokens corretos para a nova sintaxe.

---

## Fase 5 — Definição Sintática

### Objetivo

Formalizar a gramática da feature.

### Entregáveis

Criar:
- GRAMMAR.md

### Definir produções iniciais

#### Declaração
definir identificador como expressão

#### Exibição
mostrar expressão

#### Expressão semântica
tamanho de expressão
tipo de expressão
identificar expressão

#### Condição
se expressão então bloco fim
se expressão então bloco senão bloco fim

#### Laço
enquanto expressão faça bloco fim

#### Função
função identificador com parâmetros faça bloco fim

ou outra forma fixa, desde que seja escolhida e congelada

### Regra central

Cada produção deve ter:
- forma canônica
- exemplos válidos
- exemplos inválidos
- lowering esperado

### Critério de conclusão

A linguagem inicial deve estar formalmente gramaticada.

---

## Fase 6 — Modificação do Parser para Statements

### Objetivo

Adicionar parsing real para as novas estruturas de comando.

### Statements iniciais

- definir
- mostrar
- se
- enquanto
- função
- retornar

### Ações

- localizar o switch ou fluxo principal de parsing de statements
- adicionar casos para os novos tokens
- construir os nós correspondentes
- garantir propagação correta de erro sintático

### Casos essenciais

#### Definição de variável
definir x como 10

Deve virar um statement equivalente a declaração de variável com inicialização.

#### Exibição
mostrar x

Deve virar uma chamada de builtin ou intrinsic apropriada.

### Critério de conclusão

O parser reconhece e estrutura statements do novo dialeto.

---

## Fase 7 — Modificação do Parser para Expressões Semânticas

### Objetivo

Adicionar parsing real para expressões como “tamanho de texto”.

### Expressões iniciais

- tamanho de X
- tipo de X
- identificar X
- observar X

### Estratégia

Essas expressões devem ser parseadas como operadores semânticos especiais.
Não devem depender de serem chamadas como funções JS comuns, exceto se isso for a estratégia de lowering interno.

### Lowering desejado

- tamanho de X → operação interna equivalente a length
- tipo de X → operação interna equivalente a typeof ou tipo semântico
- identificar X → builtin ou intrinsic própria

### Critério de conclusão

O parser produz nós adequados para expressões semânticas.

---

## Fase 8 — Definição da AST Estendida

### Objetivo

Representar a nova sintaxe no nível estrutural.

### Entregáveis

Criar:
- AST_SPEC.md

### Nós necessários inicialmente

- SemanticDefineStatement
- SemanticShowStatement
- SemanticIfStatement
- SemanticWhileStatement
- SemanticSizeOfExpression
- SemanticTypeOfExpression
- SemanticIdentifyExpression

### Para cada nó definir

- campos
- posição no source
- filhos
- lowering esperado
- equivalência aproximada em JS

### Observação

Se o engine não usar uma AST explícita como estrutura externa, documentar a equivalência interna usada no parser e na emissão.

### Critério de conclusão

Cada construção nova deve ter representação estrutural clara.

---

## Fase 9 — Lowering Semântico

### Objetivo

Transformar os novos nós da linguagem em operações internas que o engine já consiga executar ou que possam ser adicionadas com mínimo acoplamento.

### Estratégias possíveis

#### Estratégia A — Lowering para construções já existentes
Exemplo:
- definir x como y → let x = y
- tamanho de texto → texto.length

#### Estratégia B — Lowering para builtins ou intrinsics internas
Exemplo:
- tamanho de texto → __intrinsic_length(texto)
- mostrar x → __intrinsic_show(x)
- identificar x → __intrinsic_identify(x)

### Recomendação

Usar lowering híbrido:
- onde houver equivalência clara, reutilizar mecanismo interno existente
- onde houver semântica nova, usar intrinsic nova

### Critério de conclusão

Toda construção nova deve ter um caminho de execução claro dentro do engine.

---

## Fase 10 — Builtins e Intrinsics

### Objetivo

Criar funções internas reais para comportamentos novos ou mais controlados.

### Casos iniciais

- mostrar
- identificar
- observar
- tipo semântico, se diferir de typeof
- operações futuras do dicionário semântico

### Regras

- builtins devem ser registradas no runtime do engine
- intrinsics devem ter semântica estável
- comportamento deve ser documentado
- custo observável deve ser previsível

### Entregáveis

Criar:
- BUILTINS_SPEC.md
- INTRINSICS_SPEC.md

### Critério de conclusão

As operações novas devem existir no runtime do motor, não apenas em camada JS superficial.

---

## Fase 11 — Tratamento de Erros

### Objetivo

Garantir diagnósticos bons para a nova linguagem.

### Definir mensagens para

- palavra reservada fora de posição
- uso incorreto de “como”
- expressão incompleta
- bloco “se” sem “fim”
- uso inválido de “de”
- operador semântico aplicado a alvo incompatível

### Entregável

Criar:
- ERRORS.md

### Critério de conclusão

Todo erro comum da feature deve gerar mensagem específica e compreensível.

---

## Fase 12 — Testes Léxicos e Sintáticos

### Objetivo

Impedir regressões e validar comportamento.

### Criar suíte para

#### Lexer
- tokens isolados
- sequências válidas
- mistura com identificadores
- palavras parcialmente coincidentes

#### Parser
- statements válidos
- expressões válidas
- blocos válidos
- erros esperados

#### Casos mínimos
- definir texto como "a"
- mostrar texto
- definir tamanho como tamanho de texto
- se tamanho de texto então mostrar texto fim

### Critério de conclusão

A nova feature precisa ter cobertura mínima de parsing.

---

## Fase 13 — Testes de Execução

### Objetivo

Validar semântica real da feature.

### Casos essenciais

- declaração e leitura de variável
- mostrar valores
- calcular tamanho
- identificar tipos
- executar condições
- executar laços
- definir e chamar função

### Critério de conclusão

O comportamento observável precisa estar correto e estável.

---

## Fase 14 — Primeira CLI do Dialeto

### Objetivo

Distribuir o engine modificado como ferramenta de uso real.

### Entregáveis

Criar executável próprio, por exemplo:
- gato
- gatojs
- ptjs
- outro nome definido pelo projeto

### Capacidades mínimas

- executar arquivo
- abrir REPL
- mostrar versão
- executar código inline
- opção de modo estrito da nova sintaxe

### Exemplo conceitual de uso

executável arquivo_da_linguagem

### Critério de conclusão

O projeto deixa de ser só patch interno e vira ferramenta usável.

---

## Fase 15 — Congelamento da Gramática Inicial

### Objetivo

Evitar explosão de complexidade.

### Decisão

Após primeira versão funcional, congelar:
- palavras reservadas iniciais
- forma canônica
- sintaxe de bloco
- sintaxe de declaração
- sintaxe das expressões semânticas

### O que não fazer ainda

- múltiplos sinônimos
- liberdade excessiva de português
- macros avançadas
- inferência semântica ambígua
- gramática natural livre

### Critério de conclusão

A versão inicial passa a ter identidade estável.

---

## Fase 16 — Especificação Formal da Linguagem

### Objetivo

Transformar o protótipo em linguagem documentada.

### Entregáveis

Criar:
- LANGUAGE_SPEC.md
- SEMANTICS.md
- STANDARD_LIBRARY.md

### Conteúdo

#### Sintaxe
formas válidas da linguagem

#### Semântica
o que cada construção significa

#### Resolução
como operações são avaliadas

#### Observabilidade
o que é visível para o usuário

#### Compatibilidade
como convive com JavaScript existente, se conviver

### Critério de conclusão

A linguagem deve poder ser entendida sem ler o código do engine.

---

## Fase 17 — Projeto de Compatibilidade

### Objetivo

Definir como a nova feature convive com JavaScript tradicional.

### Possibilidades

#### Modo isolado
Arquivos da nova linguagem usam extensão própria e parser entra em modo português.

#### Feature flag
O engine ativa o modo novo por opção explícita.

#### Namespace de execução
A feature só vale em contexto especial.

### Recomendação

Usar modo isolado por arquivo ou flag no começo.

Motivo:
- reduz conflitos
- simplifica parser
- facilita testes

### Critério de conclusão

A entrada na nova gramática deve ser controlada e previsível.

---

## Fase 18 — Expansão do Dicionário Semântico

### Objetivo

Aumentar a expressividade da linguagem com cuidado.

### Começar com núcleos

#### Núcleo básico
- definir
- mostrar
- tamanho
- tipo
- identificar

#### Controle
- se
- senão
- fim
- enquanto
- faça

#### Dados
- texto
- número
- lista
- objeto

#### Ações semânticas futuras
- observar
- validar
- transformar
- responder
- comparar
- carregar
- salvar

### Regra

Cada nova palavra só entra se tiver:
- forma canônica
- semântica única
- lowering definido
- testes

### Critério de conclusão

O crescimento da linguagem precisa ser controlado.

---

## Fase 19 — Integração com Resolução Semântica Real

### Objetivo

Atingir o ponto que motivou o projeto:
a resolução deve ocorrer na camada da linguagem dentro do engine.

### Isso significa

- o engine reconhece a estrutura semântica
- o parser entende a intenção sintática
- o lowering produz operação interna estável
- o runtime executa essa operação sem depender de biblioteca JS superficial como mecanismo principal

### Exemplo desejado

“tamanho de texto” não deve ser só açúcar estético improvisado fora do motor.
Deve existir como construção reconhecida e resolvida pelo engine.

### Critério de conclusão

A nova linguagem passa a existir como recurso real do motor.

---

## Fase 20 — Refatoração Interna

### Objetivo

Separar implementação provisória de arquitetura estável.

### Itens de refatoração

- centralizar tokens novos
- centralizar gramática nova
- separar lowering da lógica de parsing
- organizar builtins e intrinsics
- padronizar mensagens de erro
- limpar duplicações

### Critério de conclusão

A base fica sustentável para expansão futura.

---

## Fase 21 — Benchmark e Observabilidade

### Objetivo

Entender custo, estabilidade e ergonomia.

### Medir

- tempo de tokenização
- tempo de parsing
- tempo de execução
- diferença para construções JS equivalentes
- impacto da nova gramática no engine

### Observar

- clareza da linguagem
- previsibilidade
- facilidade de geração por IA
- legibilidade humana

### Critério de conclusão

A feature deve estar mensurada minimamente.

---

## Fase 22 — Preparação para Proposta de Linguagem

### Objetivo

Estruturar a feature como proposta formal, mesmo que inicialmente privada.

### Entregáveis

Criar:
- PROPOSAL.md
- MOTIVATION.md
- PRIOR_ART.md
- USE_CASES.md

### Descrever

- problema que a feature resolve
- por que isso não é só biblioteca
- por que a feature merece existir no nível da linguagem
- quais casos de uso a justificam
- qual seria o impacto em engines e ferramentas
- como a feature poderia coexistir com a linguagem atual

### Critério de conclusão

A ideia deixa de ser apenas implementação experimental e vira proposta articulada.

---

## Fase 23 — Port para Outro Engine

### Objetivo

Provar que a feature não depende conceitualmente de um engine específico.

### Ordem recomendada

- protótipo sólido em QuickJS
- documentação consolidada
- só então tentar V8

### Para V8 estudar

- scanner
- parser
- AST interna
- builtins
- Torque
- intrinsics
- pipeline de execução

### Alerta

Portar cedo demais vai travar o projeto.

### Critério de conclusão

A feature mostra portabilidade conceitual entre engines.

---

## Fase 24 — Ferramentas de Ecossistema

### Objetivo

Permitir adoção real.

### Criar depois que a sintaxe estiver estável

- syntax highlight
- exemplos oficiais
- manual da linguagem
- suíte de testes pública
- documentação de builtins
- guia de migração e compatibilidade

### Observação

Essas ferramentas vêm depois da estabilidade do engine, não antes.

---

## Fase 25 — Versão Alfa Pública

### Objetivo

Abrir para uso experimental controlado.

### Condições mínimas

- lexer funcional
- parser funcional
- statements básicos funcionais
- expressões semânticas iniciais funcionais
- builtins básicas prontas
- CLI própria
- testes mínimos
- documentação mínima

### O que deve estar claro

- é alfa
- gramática ainda pode mudar
- escopo inicial é limitado
- o foco é provar a feature, não substituir todo JavaScript ainda

---

## Fase 26 — Estabilização

### Objetivo

Preparar uma versão realmente séria.

### Fazer

- congelar gramática inicial
- consolidar dicionário inicial
- remover experimentos ruins
- melhorar erros
- aumentar cobertura de testes
- estabilizar builtins
- documentar semântica observável

### Critério de conclusão

A versão deixa de ser apenas experimento de laboratório.

---

## Fase 27 — Meta de Longo Prazo

### Objetivo

Preparar o caminho para a ambição maior:
uma linguagem mais fácil para IA gerar do que linguagens tradicionais.

### Isso exige

- gramática baixa em ambiguidade
- formas canônicas
- pouca entropia sintática
- semântica previsível
- poucas maneiras equivalentes de dizer a mesma coisa
- documentação formal
- muitos exemplos corretos

### Observação central

A vantagem para IA não nasce de “português bonito”.
Nasce de:
- regularidade
- formalidade
- previsibilidade
- semântica estável

---

## Roadmap Técnico Resumido

### Etapa 1
Escolher engine e mapear arquitetura

### Etapa 2
Especificar a feature formalmente

### Etapa 3
Adicionar tokens portugueses ao lexer

### Etapa 4
Adicionar parsing de statements

### Etapa 5
Adicionar parsing de expressões semânticas

### Etapa 6
Definir AST ou representação estrutural equivalente

### Etapa 7
Implementar lowering para construções internas

### Etapa 8
Criar builtins e intrinsics necessárias

### Etapa 9
Executar e testar casos mínimos

### Etapa 10
Criar CLI própria

### Etapa 11
Congelar gramática inicial

### Etapa 12
Escrever especificação formal da linguagem

### Etapa 13
Expandir dicionário semântico com disciplina

### Etapa 14
Medir, refatorar e estabilizar

### Etapa 15
Portar para outro engine apenas depois da maturidade do protótipo

---

## O que Não Fazer no Início

- não tentar suportar português livre
- não tentar cobrir todo JavaScript
- não permitir dezenas de sinônimos
- não misturar engine mod com transpiler como se fossem a mesma coisa
- não depender de biblioteca JS como núcleo da proposta
- não portar para V8 cedo demais
- não crescer o léxico antes de estabilizar sintaxe e lowering

---

## Definição Final do Projeto

Este projeto é uma implementação de nova feature de linguagem no nível do engine JavaScript, com gramática em português operacional formalizado, resolução semântica integrada ao motor e foco em tornar programação mais previsível, legível e futuramente mais fácil de gerar por IA.

O foco principal é explícito:
modificação do engine para criar uma feature nova de linguagem, e não apenas uma camada de biblioteca, transpiler ou runtime externo.

---

## Critério de Sucesso Final

O projeto terá atingido seu objetivo inicial quando:

- o engine reconhecer palavras e estruturas em português como tokens nativos
- o parser aceitar a gramática nova
- as construções novas tiverem lowering estável
- builtins e intrinsics estiverem integradas ao runtime
- programas simples em português rodarem diretamente no engine modificado
- a feature estiver documentada como recurso formal de linguagem