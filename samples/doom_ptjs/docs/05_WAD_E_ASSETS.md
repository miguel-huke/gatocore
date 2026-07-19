# WAD e Assets

## Objetivo

Definir o pipeline de leitura e validacao de assets para Doom PTJS.

## Escopo do loader

O loader deve cobrir:

- cabecalho do WAD
- diretorio de lumps
- busca por nome
- leitura segura por offset e tamanho
- validacao de limites

## Entidades de asset

- `wad`
- `lump`
- `palette`
- `colormap`
- `flat`
- `patch`
- `sprite`
- `mapa`

## Erros obrigatorios

- arquivo_ausente
- cabecalho_invalido
- offset_invalido
- tamanho_invalido
- lump_ausente
- formato_nao_suportado
- asset_corrompido

## Ordem recomendada

1. leitor de cabecalho
2. leitor do diretorio de lumps
3. lookup por nome
4. PLAYPAL
5. flats e patches
6. mapa
7. sprites

## Estruturas recomendadas

- leitura binaria por `ArrayBuffer` e `DataView`
- indices compactos por offset
- cache de asset com capacidade explicita
- parsing lazy sempre que possivel

## Validacao minima

- todos os offsets dentro do arquivo
- todos os lumps com nome normalizado
- tamanhos coerentes com tipo esperado
- falha rapida em asset corrompido
