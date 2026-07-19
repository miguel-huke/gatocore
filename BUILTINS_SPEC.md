# Builtins Spec

## Objetivo

Definir a superficie visivel ao usuario da linguagem e do runtime de
plataforma.

## Distincao

- builtin: comportamento diretamente chamavel pelo usuario
- intrinsic: helper interno do lowering e do runtime
- stdlib tecnica: camada autocarregada pelo `gatocore`, acima do runtime base

## Builtins de linguagem

### `mostrar`

Forma:

```txt
mostrar expressao
```

Contrato:

- avalia `expressao`
- escreve representacao estavel no stdout
- adiciona quebra de linha
- retorna `indefinido`

### `observar`

Forma:

```txt
observar expressao
```

Contrato:

- avalia `expressao`
- emite diagnostico mais rico que `mostrar`
- retorna o proprio valor

### `identificar`

Forma:

```txt
identificar expressao
```

Contrato:

- retorna descritor semantico estruturado
- nao imprime por si so

## Builtins de terminal

### `escrever(valor...)`

- escreve sem quebra de linha obrigatoria
- aceita um ou mais valores
- retorna `indefinido`

### `limpar_tela()`

- emite sequencia ANSI para limpar a tela
- retorna `indefinido`

### `mover_cursor(coluna, linha)`

- posiciona o cursor com coordenadas 1-based
- retorna `indefinido`

### `ocultar_cursor()` / `mostrar_cursor()`

- controlam visibilidade do cursor
- retornam `indefinido`

### `tamanho_terminal()`

- retorna objeto com pelo menos `largura` e `altura`
- se o tamanho nao puder ser detectado, os campos ainda devem existir

### `ativar_terminal_cru()` / `desativar_terminal_cru()`

- alternam modo cru do terminal quando suportado
- a implementacao deve restaurar o terminal na saida do processo

### `ler_tecla(timeout_ms)`

- aguarda ate `timeout_ms` milissegundos
- retorna texto com os bytes lidos ou `nulo` se nada chegou

## Builtins de tempo

### `agora_ms()`

- retorna timestamp numerico em milissegundos

### `esperar(timeout_ms)`

- bloqueia por aproximadamente `timeout_ms` milissegundos
- retorna `indefinido`

## Builtins de arquivo

### `ler_texto(caminho)`

- le arquivo como texto
- retorna `texto`

### `ler_bytes(caminho)`

- le arquivo como bytes
- retorna `ArrayBuffer`

### `escrever_texto(caminho, conteudo)`

- grava `conteudo` como texto
- retorna quantidade de bytes escritos

### `arquivo_existe(caminho)`

- retorna `booleano`

### `apagar_arquivo(caminho)`

- remove arquivo
- retorna `booleano`

Regra de caminho:

- caminhos relativos em builtins de arquivo sao resolvidos relativamente ao
  script PTJS atual

## Builtins de execucao

### `argumentos()`

- retorna array com os argumentos do script

### `incluir(caminho)`

- avalia outro script PTJS no mesmo contexto
- caminhos relativos sao resolvidos relativamente ao script atual
- atualiza temporariamente a base de resolucao para includes aninhados

### `sair(codigo)`

- encerra o processo com codigo opcional
- deve restaurar o estado do terminal antes de sair

## Builtins de video

### `video_suportado()`

- indica se o backend grafico nativo do host esta disponivel
- hoje o backend entregue e `x11-host`

### `video_backend()`

- retorna identificador textual do backend de video

### `video_erro()`

- retorna texto de diagnostico para a ultima falha do backend

### `video_abrir(largura, altura, escala, titulo)`

- abre janela grafica nativa do host
- prepara framebuffer RGBA com escala inteira
- retorna `booleano`

### `video_apresentar(frame_rgba)`

- recebe `ArrayBuffer` ou `Uint8Array`
- espera frame RGBA no tamanho configurado em `video_abrir`
- faz upload do frame para a janela
- retorna `booleano`

### `video_entrada()`

- retorna objeto com chaves como `left`, `right`, `up`, `down`, `w`, `a`,
  `s`, `d`, `q`, `e`, `tab`, `m`, `r`, `space`, `enter`, `x` e `quit`

### `video_fechar()`

- fecha a janela atual
- libera recursos do backend de video

## Stdlib tecnica do GatoCore

O wrapper `gatocore` agora carrega automaticamente `stdlib/ptstdlib.js`.

Essa camada:

- le `docs/lista_palavras.md`
- transforma os verbetes em funcoes globais
- oferece implementacoes diretas quando possivel
- usa `--std` para acessar host real quando possivel
- despacha para adaptadores quando a operacao ainda depende de privilegio,
  driver ou backend externo

Contratos principais:

### `registrar(nome, fn)` ou `registrar({ nome, executar })`

- registra implementacao para verbo tecnico
- permite conectar termos como `capturar_pacote` ou `wifi`
- retorna `resultado`

### `resultado(ok, valor, erro, meta)`

- cria retorno estruturado e estavel
- e usado pela stdlib para erros e sucesso de operacao

### `tokenizar(texto)`, `embedding(valor)`, `indice_vetorial(lista)`, `vizinho_proximo(indice, consulta, k)`

- formam o nucleo util de IA e busca vetorial em JS puro

### `padrao_kkrieger()`, `buffer_fixo()`, `arena()`, `bitset()`, `fila_circular()`, `pool()`, `vetor_compacto()`

- formam a base low-level atual do PTJS para hot paths
- priorizam capacidade fixa, typed arrays e reuso de memoria
- convivem agora com um backend nativo real para subconjunto do PTJS
- continuam sendo a base de hot path e layout compacto no fluxo interpretado
- seguem o padrao documentado em `docs/padrao_kkrieger.md`

### `varrer(alvo)` e `varrer_arquivo(caminho)`

- executam analise offline simples
- retornam metadados, tipo de arquivo, hash FNV-1a e veredicto basico

### `pcap(alvo)`, `pcapng(alvo)` e `dissecar(pacote)`

- entregam leitura basica offline para analise de trafego
- focam em header parsing e disseccao minima de Ethernet/IPv4/TCP/UDP/ICMP

### `workspace(raiz)`, `job(config)`, `servico(config)` e `sandbox(config)`

- oferecem uma camada minima de operacao de host em PTJS
- cobrem arquivos, diretorio de trabalho, subprocessos e servicos locais
- retornam `resultado` estruturado nas operacoes host

### `segredo(nome, fallback)` e `http(base_url)`

- `segredo` le ambiente com fallback opcional
- `http` cobre GET, texto e JSON sobre `std.urlGet`

### `motor_varredura(config)`, `atualizar_banco(fonte, motor)` e `quarentena(dir)`

- fecham a base local para assinatura, heuristica, scan e isolamento de arquivo
- ainda `nao` equivalem ao engine completo de ClamAV

## Politica de representacao

As representacoes textuais usadas por `mostrar`, `observar` e demais canais
devem ser:

- estaveis
- previsiveis
- adequadas para scripts e para teste automatizado

## Backend nativo atual

No fluxo `gatocore ir|asm|native-build|native-run|jit`, o projeto passa a
ter uma implementacao nativa local para um subconjunto da linguagem.

Superficie hoje coberta no backend nativo:

- `mostrar`
- `retornar`
- `para cada`
- `tamanho de` sobre texto
- `tamanho de` sobre lista constante
- `tipo de`
- `identificar`
- `observar`

Caracteristicas do backend:

- PTJS subset -> IR -> assembly x86_64 SysV
- alocacao linear de registradores para temporarios
- peephole textual na assembly gerada
- runtime C minimo em `runtime/native_runtime.c`

Limite importante:

- isso ainda `nao` significa que toda a stdlib tecnica ou todo o PTJS ja
  rodam como codigo nativo
