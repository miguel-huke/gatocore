# Technical Stdlib

## Objetivo

Documentar a stdlib tecnica autocarregada pelo `gatocore`.

Essa camada transforma os verbetes de `docs/lista_palavras.md` em funcoes
globais reais no fluxo oficial da ferramenta.

Observacao importante:

A stdlib tecnica continua sendo executada no fluxo interpretado sobre
QuickJS. O backend nativo atual do projeto existe, mas cobre um subconjunto
estruturado do PTJS e ainda `nao` compila toda esta camada automaticamente.

## Carregamento

Com o wrapper:

```sh
./bin/gatocore arquivo.ptjs
gatocore arquivo.ptjs
```

A stdlib e carregada automaticamente.

Com o engine direto:

```sh
./engines/quickjs/qjs --std --lang=pt -I stdlib/ptstdlib.js arquivo.ptjs
```

## Fonte de verdade

O arquivo `docs/lista_palavras.md` e a base do inventario tecnico.

Durante o bootstrap da stdlib:

- o markdown e lido
- os verbetes validos sao extraidos
- cada termo vira funcao global
- implementacoes especiais sao aplicadas quando existirem

## Modos de execucao

Na pratica, os verbetes expostos caem em tres grupos.

### 1. Implementacao real em JS puro

Exemplos:

- `resultado`
- `evento`
- `metrica`
- `tokenizar`
- `embedding`
- `indice_vetorial`
- `vizinho_proximo`
- `ranquear`
- `validar`
- `varrer`
- `varrer_arquivo`
- `pcap`
- `pcapng`
- `dissecar`
- `estatistica_protocolo`
- `seguir_fluxo`
- `reassemblar_fluxo`

### 2. Construtores tecnicos

Exemplos:

- `configuracao`
- `contexto`
- `sessao`
- `vetor`
- `vetor2`
- `vetor3`
- `tensor`
- `camera`
- `camera2d`
- `camera3d`
- `entidade`
- `no`
- `no2d`
- `no3d`
- `sprite2d`
- `viewport`
- `arvore_cena`
- `cena_empacotada`
- `sinal`
- `animacao`
- `animador`
- `mapa_entrada`
- `configuracao_projeto`
- `gerenciador_projeto`
- `painel_dock`
- `inspetor`
- `plugin_editor`
- `bus_audio`
- `componente`
- `cena`
- `manifesto`
- `provedor`
- `modelo`
- `http`
- `porta`
- `skill`
- `workflow`
- `workspace`
- `job`
- `servico`
- `sandbox`
- `gateway`
- `motor_varredura`
- `quarentena`
- `padrao_kkrieger`
- `arena`
- `bitset`
- `fila_circular`
- `pool`
- `vetor_compacto`
- `indice_vetorial_compacto`

### 3. Dispatch para host ou adaptador

Exemplos:

- `capturar_pacote`
- `abrir_socket`
- `anexar_ebpf`
- `envenenar_arp`
- `redirecionar_icmp`
- `wifi`
- `zigbee`
- `ubertooth`
- `runtime_docker`

Por padrao, esses verbos retornam erro estruturado:

```txt
adaptador_ausente
```

Eles podem ganhar comportamento real via:

```txt
registrar("capturar_pacote", function (...) { ... })
```

## Namespace `gatocore`

A stdlib expone o objeto global `gatocore` com utilitarios de introspeccao:

- `gatocore.listar_termos()`
- `gatocore.descrever_termo(nome)`
- `gatocore.registrar_operacao(nome, fn)`
- `gatocore.registrar_construtor(nome, fn)`
- `gatocore.registrar_politica(nome, fn)`
- `gatocore.host_std`
- `gatocore.host_os`

Tambem existem atalhos globais, como `registrar(...)`.

## Recursos de host implementados

As capacidades abaixo ja tem backend real quando o fluxo oficial usa
`gatocore` ou o engine com `--std`.

### Workspace e arquivos

- `workspace(raiz)`
- `abrir(caminho)`
- `segredo(nome, fallback)`

### Processos e servicos

- `job({ comando, capturar })`
- `servico({ comando })`
- `sandbox({ comandos_permitidos })`
- `runtime_docker()`

### Rede e integracao

- `http(base_url)`
- `provedor(base_url)`
- `provedor_modelo(...)`
- `gateway(...)`
- `canal_mensagem(nome)`

### Antivirus e operacao de scan

- `assinatura_binaria(...)`
- `heuristica(...)`
- `motor_varredura(...)`
- `atualizar_banco(fonte, motor)`
- `quarentena(diretorio)`
- `restaurar_quarentena(...)`

### Estruturas compactas e hot path

- `padrao_kkrieger()`
- `buffer_fixo(tamanho, fill?)`
- `arena(tamanho)`
- `bitset(bits)`
- `fila_circular(capacidade)`
- `pool(capacidade, seed?)`
- `vetor_compacto(tipo, dados_ou_tamanho)`
- `embedding_compacto(valor, dimensao?)`
- `indice_vetorial_compacto(lista, dimensao?)`

Esses verbetes existem para aplicar o padrao documentado em
`docs/padrao_kkrieger.md`: capacidade explicita, reuso de memoria e menos
alocacao em hot path.

Eles tambem servem como base de dados e layout para a evolucao do backend
nativo descrito em `docs/backend_nativo.md`.

### Engine/editor

Exemplos:

- `no2d("Player", { x: 32, y: 48 })`
- `sprite2d("Heroi", { cor: "#44aa88" })`
- `viewport({ largura: 320, altura: 180, escala: 3 })`
- `arvore_cena(raiz)`
- `cena_empacotada(raiz)`
- `configuracao_projeto({ "display/window/size/viewport_width": 1280 })`
- `plugin_editor({ nome: "Hot Reload" })`

## Exemplo de host

```txt
definir ws como workspace(".")
mostrar ws.existe("README.md")

definir tarefa como job({
  comando: ["/usr/bin/printf", "ok"],
  capturar: 1
})
mostrar tarefa.executar().valor.saida
```

## Exemplos rapidos

### Resultado

```txt
definir r como resultado(1, "ok")
mostrar r.ok
mostrar r.valor
```

### Busca vetorial

```txt
definir idx como indice_vetorial([
  "gato curioso",
  "roteamento tcp",
  "motor de jogo"
])

mostrar vizinho_proximo(idx, "gato", 1)[0].item
```

### Registro de operacao

```txt
registrar("capturar_pacote", function (iface) {
  return { tipo_recurso: "captura_teste", interface: iface, ativo: true }
})

mostrar capturar_pacote("eth0").ativo
```

## Limite importante

Todos os verbetes do dicionario tecnico agora sao `chamaveis`, mas isso `nao`
significa que todos ja tenham backend nativo, acesso privilegiado ou
equivalencia com ferramentas como Wireshark, Kismet, ClamAV ou engines de
jogo completos.

A stdlib fecha o gap entre documentacao e superficie executavel. O gap de
runtime nativo avancado continua sendo trabalho futuro.
