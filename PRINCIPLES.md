# Principles

## 1. Engine first

A semantica da linguagem deve ser resolvida no engine.
Camadas externas podem existir, mas nao definem o nucleo da proposta.

## 2. Forma canonica

Cada construcao deve ter uma forma principal, curta e previsivel.
Variacoes livres devem ser evitadas no inicio.

## 3. Ambiguidade como erro

Se uma leitura nao for claramente decidivel, a linguagem deve rejeitar a entrada.
Flexibilidade nao pode comprometer determinismo.

## 4. MVP pequeno e completo

Melhor uma linguagem pequena com pipeline completo do que uma linguagem grande sem coerencia de execucao.

## 5. Lowering explicito

Toda construcao nova deve ter lowering documentado.
Nada entra por "magia" sem caminho tecnico rastreavel.

## 6. Compatibilidade controlada

O modo portugues deve ser isolado e ativado explicitamente para reduzir conflitos com o JavaScript tradicional.

## 7. Erros bons fazem parte da linguagem

Mensagens de erro nao sao detalhe de implementacao.
Diagnostico claro e parte central da experiencia da linguagem.

## 8. Crescimento disciplinado

Cada nova palavra ou forma sintatica so entra se tiver:

- semantica unica
- forma canonica
- lowering definido
- testes planejados

## 9. Documentacao antes da expansao

Quando a linguagem crescer, a documentacao deve crescer junto.
O projeto nao deve depender de conhecimento informal para manter coerencia.

## 10. Prioridade para previsibilidade

O projeto busca reduzir entropia sintatica para humanos e para IA.
Regularidade vale mais do que "naturalidade".
