# Visao e Escopo

## Objetivo

Definir o que significa `Doom 100% PTJS` neste repositorio.

## Definicao de sucesso

O projeto sera considerado funcional quando:

- carregar um WAD suportado
- abrir uma janela grafica
- renderizar uma fase jogavel
- permitir mover, mirar e atirar
- executar monstros e regras basicas de combate
- tocar audio e efeitos
- concluir ao menos uma fase completa

## O que 100% PTJS significa aqui

Significa:

- logica de jogo em PTJS
- carregamento de assets em PTJS quando viavel
- orquestracao do jogo em PTJS
- regras, entidades, mapas, menus e HUD em PTJS

Nao significa:

- ausencia total de host nativo
- ausencia total de C no engine
- ausencia total de extensao de runtime

## Escopo do MVP de Doom PTJS

O MVP deve entregar:

- uma fase jogavel
- raycaster ou renderer equivalente
- player, colisao e portas
- uma arma funcional
- um inimigo funcional
- HUD minimo
- um WAD reader funcional para o fluxo suportado

## Fora do MVP

- editor
- multiplayer
- modding completo
- compatibilidade total com todos os WADs e PWADs
- menus avancados
- renderer acelerado por GPU desde o dia 1

## Restricoes

- seguir o `padrao kkrieger`
- manter a logica central em PTJS
- evitar acoplamento excessivo entre gameplay e backend grafico
- separar dados de asset, renderer e simulacao
