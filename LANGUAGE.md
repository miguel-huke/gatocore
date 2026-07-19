# Language Guide

## Objetivo

Referencia curta para uso diario do GatoCore.

## Como executar

No repositorio:

```sh
make build
./bin/gatocore examples/ola.ptjs
./bin/gatocore examples/tecnico.ptjs
./bin/gatocore repl
./bin/gatocore eval 'mostrar 1'
./bin/gatocore native-run samples/native_backend_demo.ptjs
./bin/gatocore termos
./bin/gatocore version
./bin/gatocore samples/snakegame.ptjs
```

Instalacao local opcional:

```sh
make install-local
gatocore examples/ola.ptjs
gatocore examples/tecnico.ptjs
gatocore repl
gatocore samples/snakegame.ptjs
```

Atalhos via `make`:

```sh
make run FILE=examples/ola.ptjs
make eval CODE='mostrar 1'
make ir FILE=tests/native/ola.ptjs
make asm FILE=tests/native/ola.ptjs
make native-run FILE=tests/native/ola.ptjs
make bench FILE=examples/colecao.ptjs ITERATIONS=20
make snake
make termos
```

Uso direto do engine com a stdlib tecnica:

```sh
./engines/quickjs/qjs --std --lang=pt -I stdlib/ptstdlib.js arquivo.ptjs
```

## Backend nativo

O fluxo nativo atual fica exposto pela CLI:

```sh
./bin/gatocore ir tests/native/ola.ptjs
./bin/gatocore asm tests/native/ola.ptjs
./bin/gatocore native-build tests/native/ola.ptjs
./bin/gatocore native-run tests/native/ola.ptjs
./bin/gatocore jit tests/native/ola.ptjs
```

Esse backend hoje cobre um subconjunto estruturado da linguagem:

- `definir` e atribuicao
- `mostrar` e `retornar`
- `se`, `senão`, `enquanto`, `para cada`
- `função` com ate 6 parametros
- inteiros, booleanos, `null`, strings e listas constantes homogeneas
- chamadas diretas, recursao e `retornar` vazio
- `tamanho de`, `tipo de`, `identificar`, `observar`

Para a referencia detalhada e limites atuais, veja `docs/backend_nativo.md`.

## Formas suportadas

### Declaracao

```txt
definir nome como valor
```

### Exibicao

```txt
mostrar valor
```

### Condicional

```txt
se condicao então
  mostrar "ok"
senão
  mostrar "erro"
fim
```

### Laco

```txt
enquanto condicao faça
  mostrar condicao
fim
```

### Iteracao

```txt
para cada item em colecao faça
  mostrar item
fim
```

### Funcao

```txt
função soma(a, b) faça
  retornar a + b
fim
```

### Operadores semanticos

```txt
tamanho de valor
tipo de valor
identificar valor
observar valor
```

## Runtime de plataforma

### Terminal

- `escrever(valor...)`
- `limpar_tela()`
- `mover_cursor(coluna, linha)`
- `ocultar_cursor()`
- `mostrar_cursor()`
- `tamanho_terminal()`
- `ativar_terminal_cru()`
- `desativar_terminal_cru()`
- `ler_tecla(timeout_ms)`

Exemplo minimo de loop live:

```txt
ativar_terminal_cru()
ocultar_cursor()

definir rodando como 1

enquanto rodando faça
  limpar_tela()
  mover_cursor(1, 1)
  escrever("Pressione x para sair\n")

  definir tecla como ler_tecla(50)
  se tecla !== null && tecla.indexOf("x") >= 0 então
    rodando = 0
  fim

  esperar(50)
fim

mostrar_cursor()
desativar_terminal_cru()
```

### Tempo

- `agora_ms()`
- `esperar(timeout_ms)`

### Arquivos

- `ler_texto(caminho)`
- `ler_bytes(caminho)`
- `escrever_texto(caminho, conteudo)`
- `arquivo_existe(caminho)`
- `apagar_arquivo(caminho)`

### Scripts e processo

- `argumentos()`
- `incluir(caminho)`
- `sair(codigo)`

### Video de host

- `video_suportado()`
- `video_backend()`
- `video_erro()`
- `video_abrir(largura, altura, escala, titulo)`
- `video_apresentar(frame_rgba)`
- `video_entrada()`
- `video_fechar()`

Esses builtins sao a base atual do Doom PTJS em janela e do `Gatod Engine`,
sem helper Python na camada de aplicacao.

## Host e automacao pela stdlib

No fluxo oficial do `gatocore`, a stdlib tecnica roda com `--std` e expone
uma camada de host real acima do runtime base.

Recursos ja funcionais:

- `workspace(raiz)`: listar, stat, criar diretorio, ler e escrever texto ou JSON,
  renomear, remover e executar comandos no diretorio de trabalho
- `segredo(nome, fallback)`: leitura de segredos por ambiente
- `job({ comando, capturar })`: execucao unitria de processo
- `servico({ comando })`: iniciar, consultar estado, aguardar e parar processo
- `sandbox({ comandos_permitidos })`: allowlist simples para execucao
- `http(base_url)`: cliente HTTP GET minimo com `get`, `obter`, `texto` e `json`
- `motor_varredura(...)`: assinaturas, heuristicas, scan, quarentena e restauracao
- `atualizar_banco(fonte, motor)`: carrega base local, objeto ou URL HTTP

## Perfil low-level Kkrieger

O GatoCore agora assume `docs/padrao_kkrieger.md` como referencia dura para
hot paths e estruturas compactas.

Superficie atual para esse perfil:

- `padrao_kkrieger()`
- `buffer_fixo(tamanho, fill?)`
- `arena(tamanho)`
- `bitset(bits)`
- `fila_circular(capacidade)`
- `pool(capacidade, seed?)`
- `vetor_compacto(tipo, dados_ou_tamanho)`
- `embedding_compacto(valor, dimensao?)`
- `indice_vetorial_compacto(lista, dimensao?)`

Exemplo rapido:

```txt
definir a como arena(32)
definir bloco como a.alocar(4, 4)
a.escrever(bloco.valor.offset, "PTJS")
mostrar a.ler_texto(bloco.valor.offset, 4)
```

Exemplo rapido:

```txt
definir ws como workspace(".")
mostrar ws.existe("README.md")

definir cliente como http("https://example.com")
mostrar cliente.base_url
```

## Stdlib tecnica autocarregada

No fluxo oficial do `gatocore`, a ferramenta tambem carrega
`stdlib/ptstdlib.js`.

Isso expoe como funcoes globais os verbetes tecnicos de
`docs/lista_palavras.md`.

Exemplos de termos com implementacao direta:

- `resultado`
- `tokenizar`
- `embedding`
- `indice_vetorial`
- `vizinho_proximo`
- `varrer_arquivo`
- `pcap`
- `pcapng`
- `dissecar`
- `http`
- `porta`
- `workspace`
- `job`
- `servico`
- `segredo`
- `motor_varredura`
- `padrao_kkrieger`
- `arena`
- `bitset`
- `fila_circular`
- `pool`
- `vetor_compacto`
- `embedding_compacto`
- `indice_vetorial_compacto`

Exemplos de termos que funcionam como construtores tecnicos:

- `configuracao`
- `contexto`
- `sessao`
- `entidade`
- `camera`
- `manifesto`

Exemplos de termos que dependem de adaptador ou host:

- `capturar_pacote`
- `abrir_socket`
- `wifi`
- `zigbee`
- `anexar_ebpf`

Esses ultimos retornam erro estruturado por padrao e podem ser conectados a
implementacao real com `registrar("termo", fn)`.

## Regras importantes

- o modo portugues e ativado explicitamente
- arquivos `.ptjs` devem estar em UTF-8
- `tipo` e `tamanho` sao contextuais e podem ser usados como nomes
- `identificar` e `observar` sao reservados no modo portugues
- caminhos relativos em `incluir` e em I/O de arquivo sao relativos ao script atual
- a camada de terminal live atual foi validada localmente em Linux

## Fluxos uteis

### Rodar um arquivo

```sh
gatocore programa.ptjs
```

### Avaliar uma linha

```sh
gatocore eval 'mostrar tipo de "abc"'
```

### Abrir o REPL

```sh
gatocore repl
```

### Validar o projeto

```sh
make test
```

### Ver exemplos completos

```sh
make demo
```

### Rodar o sample live

```sh
make snake
```

### Ver quantos termos tecnicos estao expostos

```sh
make termos
```

## Referencias rapidas

Veja `examples/ola.ptjs`, `examples/controle.ptjs`,
`examples/semanticos.ptjs`, `examples/colecao.ptjs`,
`examples/tecnico.ptjs` e `samples/snakegame.ptjs`.
