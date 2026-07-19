# Dicionario Tecnico de Expansao PTJS

## Objetivo

Este documento substitui a antiga lista tematica por um formato de
`dicionario tecnico para desenvolvimento`.

Ele existe para registrar palavras candidatas, nomes canonicos e superficies
de API que podem ser promovidas futuramente para:

- builtins
- modulos nativos
- palavras contextuais
- tipos de runtime
- ferramentas de apoio

Este arquivo `nao` descreve apenas o que ja existe. A referencia do que esta
implementado hoje continua em `docs/dicionario.md`.

Atualizacao importante:

No fluxo oficial do `gatocore`, os verbetes deste arquivo agora sao usados
como fonte para a `stdlib/ptstdlib.js`, que os exporta como funcoes globais
chamaveis.

## Escopo

O foco aqui e responder a pergunta:

`quais nomes e formas sao necessarios para construir software serio em PTJS?`

Por isso, o documento cobre vocabulario tecnico para:

- IA e sistemas cognitivos
- ciberseguranca defensiva e baixo nivel
- engenharia de rede
- jogos e simulacao
- plataformas de agentes e automacao
- antivirus e deteccao
- analise de trafego, MITM controlado e wireless

## Como ler um verbete

Cada verbete usa a seguinte estrutura:

| Campo | Significado |
| --- | --- |
| `Termo` | nome candidato em PTJS |
| `Classe` | verbo, recurso, tipo, evento, modulo ou politica |
| `Camada` | parser, runtime, stdlib, ffi, host ou ferramenta |
| `Uso tecnico` | funcao concreta no sistema |
| `Forma sugerida` | superficie recomendada para API ou sintaxe |

## Status de execucao atual

Os verbetes deste dicionario agora se dividem, na pratica, em tres modos:

- implementacao real em JS puro
- construtores e descritores tecnicos
- dispatch de host, com erro estruturado ate que exista adaptador registrado

## Regras editoriais

- Preferir `verbos` para operacoes com efeito colateral.
- Preferir `substantivos` para recursos, handles, objetos e entidades.
- Preferir `compostos com underscore` quando o conceito tecnico exigir duas ou
  mais palavras.
- Promover para palavra da linguagem apenas o que realmente justificar parser.
- Preferir `builtin` ou `modulo` antes de criar keyword nova.
- Em areas sensiveis, como kernel, captura ofensiva e MITM, preferir nomes que
  deixem claro o contexto controlado ou laboratorial.
- Nenhum verbete deve virar feature real sem semantica, erros, testes e docs.

## Perfil Kkrieger e estruturas compactas

Esta secao registra os verbetes que sustentam o `padrao kkrieger` no
GatoCore: capacidade fixa, geracao procedimental, hot path com poucas
alocacoes e estruturas compactas.

| Termo | Classe | Camada | Uso tecnico | Forma sugerida |
| --- | --- | --- | --- | --- |
| `padrao_kkrieger` | politica | stdlib | perfil duro de desenvolvimento low-allocation | `padrao_kkrieger()` |
| `buffer_fixo` | tipo | stdlib | bloco de bytes sem redimensionamento | `buffer_fixo(4096)` |
| `arena` | recurso | stdlib | alocador linear sobre buffer fixo | `definir a como arena(65536)` |
| `bitset` | tipo | stdlib | flags compactas por bit | `bitset(2048)` |
| `fila_circular` | recurso | stdlib | ring buffer de capacidade fixa | `fila_circular(128)` |
| `pool` | recurso | stdlib | reuso de slots sem realloc frequente | `pool(256)` |
| `vetor_compacto` | tipo | stdlib | typed array com contrato PTJS | `vetor_compacto("f32", 256)` |
| `embedding_compacto` | tipo | stdlib | embedding em `Float32Array` | `embedding_compacto(texto, 32)` |
| `indice_vetorial_compacto` | recurso | stdlib | indice row-major com embeddings compactos | `indice_vetorial_compacto(lista, 32)` |
| `ir` | tipo | compiler | representacao intermediaria para lowering nativo | `gatocore ir programa.ptjs` |
| `assembly` | tipo | compiler | saida textual da fase nativa | `gatocore asm programa.ptjs` |
| `aot` | politica | compiler | compilacao antecipada para binario nativo | `gatocore native-build programa.ptjs` |
| `jit` | politica | compiler | execucao local por build temporario | `gatocore jit programa.ptjs` |
| `registrador` | tipo | compiler | localizacao rapida para temporarios | `alocar_registrador(tmp)` |
| `spill` | evento | compiler | queda de temporario para stack | `registrar_spill(tmp)` |
| `peephole` | politica | compiler | otimizacao local sobre assembly | `aplicar_peephole(saida)` |
| `abi` | tipo | compiler | contrato de chamada e layout | `abi("sysv_amd64")` |
| `ffi` | recurso | runtime | ponte para codigo nativo externo | `ffi("libscanner.so")` |
| `toolchain` | recurso | compiler | compilador, assembler e linker do alvo | `toolchain("linux_x86_64")` |
| `snippet` | recurso | compiler | fragmento reutilizavel de parser, IR ou asm | `carregar_snippet("asm/prologue")` |

## Verbetes transversais

Palavras desta secao sao uteis em quase qualquer dominio tecnico.

| Termo | Classe | Camada | Uso tecnico | Forma sugerida |
| --- | --- | --- | --- | --- |
| `abrir` | verbo | runtime | abre recurso persistente | `abrir(caminho)` |
| `adaptador` | recurso | runtime | representa backend ou driver plugavel | `definir a como adaptador("wifi")` |
| `agendar` | verbo | runtime | agenda execucao futura ou recorrente | `agendar(tarefa, intervalo)` |
| `amostra` | recurso | stdlib | unidade basica de dado, evento ou frame | `definir item como amostra(bruta)` |
| `analisar` | verbo | stdlib | extrai estrutura sem executar | `analisar(entrada)` |
| `buffer` | tipo | runtime | bloco de bytes mutavel | `definir b como buffer(1024)` |
| `canal` | recurso | runtime | via de comunicacao ou stream | `definir c como canal("eventos")` |
| `capacidade` | politica | runtime | permissao de usar recurso sensivel | `exigir_capacidade("rede")` |
| `checkpoint` | recurso | runtime | snapshot de estado recuperavel | `salvar_checkpoint(nome)` |
| `coletar` | verbo | runtime | agrega eventos, metricas ou amostras | `coletar("telemetria")` |
| `configuracao` | recurso | stdlib | conjunto nomeado de parametros | `carregar_configuracao("dev")` |
| `contexto` | recurso | runtime | estado de execucao com escopo definido | `definir ctx como contexto()` |
| `estado` | recurso | runtime | snapshot atual de maquina, sessao ou fluxo | `mostrar estado de sessao` |
| `evento` | tipo | runtime | notificacao estruturada | `emitir_evento("concluido")` |
| `fila` | recurso | runtime | estrutura de trabalho assincorona | `definir q como fila()` |
| `janela_tempo` | recurso | stdlib | intervalo movel para agregacao | `janela_tempo(5_000)` |
| `metrica` | tipo | runtime | medida numerica observavel | `registrar_metrica("latencia", valor)` |
| `perfil` | recurso | runtime | conjunto de configuracoes e capacidades | `carregar_perfil("captura")` |
| `registrar` | verbo | runtime | grava log, evento, handler ou extensao | `registrar(plugin)` |
| `resultado` | tipo | stdlib | retorno estruturado com sucesso ou erro | `definir r como resultado(ok, dado)` |
| `sessao` | recurso | runtime | contexto conversacional, de rede ou de jogo | `definir s como sessao()` |
| `snapshot` | recurso | runtime | imagem consistente de estado | `salvar_snapshot("fase1")` |
| `stream` | recurso | runtime | sequencia incremental de dados | `definir s como stream(arquivo)` |
| `validar` | verbo | stdlib | checa contrato antes de usar | `validar(configuracao)` |

## IA e sistemas cognitivos

### Dados, tensores e treinamento

| Termo | Classe | Camada | Uso tecnico | Forma sugerida |
| --- | --- | --- | --- | --- |
| `amostrador` | recurso | stdlib | seleciona itens para treino ou busca | `definir s como amostrador(dados)` |
| `atencao` | recurso | stdlib | bloco de atencao de modelo sequencial | `criar_atencao(config)` |
| `batch` | recurso | stdlib | lote de exemplos processados juntos | `definir lote como batch(dados, 32)` |
| `classe` | tipo | stdlib | categoria de classificacao | `classificar(texto)` |
| `classificar` | verbo | stdlib | produz rotulo ou score de classe | `classificar(amostra)` |
| `corpus` | recurso | stdlib | conjunto textual ou multimodal fonte | `carregar_corpus("docs")` |
| `dimensao` | tipo | stdlib | eixo logico de tensor | `dimensao(tensor)` |
| `embedding` | tipo | stdlib | vetor semantico denso | `gerar_embedding(texto)` |
| `epoca` | recurso | stdlib | ciclo completo de treinamento | `treinar(epocas=3)` |
| `eixo` | tipo | stdlib | eixo numerico de tensor | `somar(eixo=1)` |
| `gradiente` | tipo | stdlib | derivada usada em otimizacao | `mostrar gradiente de perda` |
| `inferir` | verbo | runtime | executa modelo em modo de inferencia | `inferir(modelo, entrada)` |
| `janela_contexto` | recurso | stdlib | limite de tokens ou itens no contexto | `modelo.janela_contexto` |
| `lote` | recurso | stdlib | nome em portugues para batch | `lote(dados, tamanho=32)` |
| `loss` | tipo | stdlib | alias tecnico para perda | `mostrar loss de treino` |
| `modelo` | recurso | runtime | handle para modelo carregado | `definir m como carregar_modelo("x")` |
| `normalizar` | verbo | stdlib | padroniza escala ou forma | `normalizar(vetor)` |
| `otimizador` | recurso | stdlib | aplica regra de atualizacao | `definir opt como otimizador("adam")` |
| `parametro` | recurso | stdlib | peso ou hiperparametro de modelo | `listar_parametros(modelo)` |
| `perda` | tipo | stdlib | funcao objetivo do treinamento | `calcular_perda(saida, alvo)` |
| `quantizar` | verbo | runtime | reduz precisao numerica para deploy | `quantizar(modelo, bits=8)` |
| `tensor` | tipo | stdlib | estrutura numerica n-dimensional | `tensor([1, 2, 3])` |
| `token` | tipo | stdlib | unidade discreta de texto | `tokenizar(texto)` |
| `tokenizar` | verbo | stdlib | converte texto em tokens | `tokenizar("ola mundo")` |
| `treinar` | verbo | runtime | executa ciclo de treinamento | `treinar(modelo, dados)` |
| `validar_modelo` | verbo | runtime | mede desempenho em validacao | `validar_modelo(modelo, base)` |
| `vetor` | tipo | stdlib | sequencia numerica unidimensional | `definir v como vetor([1, 2])` |
| `vetorizar` | verbo | stdlib | converte item em forma numerica | `vetorizar(documento)` |

### Inferencia, recuperacao e orquestracao cognitiva

| Termo | Classe | Camada | Uso tecnico | Forma sugerida |
| --- | --- | --- | --- | --- |
| `agente` | recurso | runtime | executor que combina modelo, memoria e ferramentas | `definir a como agente(config)` |
| `avaliador` | recurso | runtime | julga qualidade de resposta ou acao | `avaliador("seguranca")` |
| `contexto_modelo` | recurso | runtime | estado montado para chamada do modelo | `montar_contexto_modelo()` |
| `ferramenta` | recurso | runtime | funcao registrada para uso por agente | `registrar_ferramenta("busca", fn)` |
| `fallback_modelo` | recurso | runtime | rota secundaria para falha de modelo | `configurar_fallback_modelo(a, b)` |
| `guardrail` | politica | runtime | regra de seguranca e conformidade | `aplicar_guardrail(sessao)` |
| `indice_vetorial` | recurso | runtime | estrutura de busca aproximada | `criar_indice_vetorial()` |
| `memoria_curta` | recurso | runtime | contexto recente e efemero | `sessao.memoria_curta` |
| `memoria_longa` | recurso | runtime | armazenamento persistente semantico | `sessao.memoria_longa` |
| `mensagem_modelo` | tipo | stdlib | mensagem estruturada para chat | `mensagem_modelo("usuario", texto)` |
| `pipeline` | recurso | runtime | encadeamento de etapas de inferencia | `pipeline([etapa1, etapa2])` |
| `prompt` | recurso | stdlib | instrucao ou contexto textual | `montar_prompt(dados)` |
| `provedor_modelo` | recurso | runtime | backend externo de modelos | `provedor_modelo("local")` |
| `rag` | recurso | runtime | recuperacao aumentada por geracao | `executar_rag(pergunta)` |
| `ranquear` | verbo | stdlib | ordena itens por score | `ranquear(candidatos)` |
| `recuperar` | verbo | runtime | busca documentos ou memoria relevante | `recuperar(indice, consulta)` |
| `reranquear` | verbo | runtime | reordena candidatos com modelo melhor | `reranquear(lista)` |
| `rota_modelo` | recurso | runtime | politica de escolha de modelo | `rota_modelo("codigo")` |
| `sessao_agente` | recurso | runtime | ciclo de vida completo de um agente | `definir s como sessao_agente()` |
| `subagente` | recurso | runtime | agente especializado subordinado | `delegar_para(subagente)` |
| `stream_resposta` | recurso | runtime | resposta incremental de inferencia | `stream_resposta(sessao)` |
| `temperatura` | recurso | stdlib | parametro de amostragem de modelo | `inferir(modelo, x, temperatura=0.2)` |
| `top_k` | recurso | stdlib | limite de candidatos por passo | `top_k=40` |
| `top_p` | recurso | stdlib | filtro probabilistico acumulado | `top_p=0.95` |
| `turno` | recurso | runtime | interacao individual em sessao | `registrar_turno(sessao, msg)` |
| `vizinho_proximo` | recurso | stdlib | busca por proximidade vetorial | `vizinho_proximo(indice, q)` |

## Kernel, baixo nivel e ciberseguranca defensiva

Estas palavras sao candidatas para `uso defensivo, auditoria e laboratorio`.
Quando exigirem privilegios ou impacto em sistema, devem ficar atras de
capabilidades explicitas.

| Termo | Classe | Camada | Uso tecnico | Forma sugerida |
| --- | --- | --- | --- | --- |
| `anexar_ebpf` | verbo | ffi | prende programa eBPF em hook suportado | `anexar_ebpf(probe, programa)` |
| `aplicar_politica` | verbo | runtime | ativa regra de seguranca ou execucao | `aplicar_politica("seccomp")` |
| `auditar_processo` | verbo | ffi | coleta trilha de execucao de processo | `auditar_processo(pid)` |
| `capabilidade` | politica | runtime | permissao granular para operacao sensivel | `exigir_capabilidade("kernel")` |
| `contexto_processo` | recurso | ffi | snapshot de registradores, memoria e pid | `contexto_processo(pid)` |
| `driver` | recurso | ffi | adaptador nativo de dispositivo | `carregar_driver("x")` |
| `evento_kernel` | tipo | ffi | evento vindo de tracepoint ou audit | `ouvir_evento_kernel()` |
| `gancho` | recurso | ffi | ponto de interceptacao controlada | `registrar_gancho("execve")` |
| `heap` | tipo | ffi | regiao de memoria dinamica | `mapear_heap(pid)` |
| `integridade` | politica | runtime | conjunto de verificacoes de consistencia | `verificar_integridade(alvo)` |
| `ioctl` | verbo | ffi | chamada de controle especifica de device | `ioctl(fd, codigo, dados)` |
| `kernel` | recurso | ffi | alvo de introspeccao ou telemetria | `informacoes_kernel()` |
| `mapa_ebpf` | recurso | ffi | mapa compartilhado de dados eBPF | `ler_mapa_ebpf(nome)` |
| `memoria_protegida` | recurso | ffi | regiao com politica de acesso especial | `marcar_memoria_protegida(ptr)` |
| `modulo_kernel` | recurso | ffi | extensao nativa do kernel | `listar_modulos_kernel()` |
| `namespace` | recurso | ffi | isolamento de recursos do kernel | `entrar_namespace("net")` |
| `pagina_memoria` | tipo | ffi | bloco de memoria paginado | `inspecionar_pagina(endereco)` |
| `perfil_seccomp` | politica | ffi | politica de syscalls permitidas | `aplicar_politica(perfil_seccomp)` |
| `procfs` | recurso | ffi | interface de introspeccao em `/proc` | `ler_procfs("self/status")` |
| `quarentena_memoria` | politica | ffi | isolamento de regiao suspeita | `quarentena_memoria(pid, regiao)` |
| `rastro_syscall` | recurso | ffi | trilha de syscalls por processo | `rastro_syscall(pid)` |
| `secao_critica` | recurso | runtime | bloco com garantias de exclusao | `entrar_secao_critica(nome)` |
| `socket_raw` | recurso | ffi | socket de baixo nivel para inspeccao | `abrir_socket_raw("icmp")` |
| `stack` | tipo | ffi | pilha de execucao | `capturar_stack(pid)` |
| `sysfs` | recurso | ffi | interface de atributos de dispositivos | `ler_sysfs("class/net")` |
| `thread` | recurso | runtime | unidade de execucao concorrente | `criar_thread(fn)` |
| `tracepoint` | recurso | ffi | ponto de observacao do kernel | `listar_tracepoints()` |
| `tracar_processo` | verbo | ffi | acompanha execucao com eventos | `tracar_processo(pid)` |
| `verificar_assinatura` | verbo | ffi | valida assinatura digital ou selo | `verificar_assinatura(arquivo)` |
| `zona_memoria` | tipo | ffi | classificacao de area de memoria | `classificar_zona_memoria(ptr)` |

## Engenharia de rede

### Transporte, roteamento e observabilidade

| Termo | Classe | Camada | Uso tecnico | Forma sugerida |
| --- | --- | --- | --- | --- |
| `abrir_socket` | verbo | runtime | cria endpoint de comunicacao | `abrir_socket("tcp")` |
| `aceitar_conexao` | verbo | runtime | aceita cliente em socket servidor | `aceitar_conexao(servidor)` |
| `asn` | tipo | stdlib | sistema autonomo de roteamento | `asn(64512)` |
| `bind` | verbo | runtime | associa socket a endereco local | `bind(socket, endereco)` |
| `capturar_pacote` | verbo | ffi | coleta pacote bruto de interface | `capturar_pacote("eth0")` |
| `certificado` | recurso | runtime | material criptografico de identidade | `carregar_certificado("cert.pem")` |
| `cidr` | tipo | stdlib | notacao de prefixo de rede | `cidr("10.0.0.0/24")` |
| `conexao` | recurso | runtime | sessao de transporte ativa | `definir c como conexao(socket)` |
| `dns` | recurso | stdlib | resolucao de nomes | `consultar_dns("exemplo.com")` |
| `dhcp` | recurso | stdlib | descoberta e atribuicao de rede | `solicitar_dhcp(interface)` |
| `escutar` | verbo | runtime | coloca socket em modo servidor | `escutar(socket, 128)` |
| `firewall` | recurso | ffi | politica de filtro e passagem | `aplicar_firewall(regras)` |
| `fluxo` | recurso | runtime | sequencia ordenada de pacotes | `seguir_fluxo(id)` |
| `http` | recurso | stdlib | cliente e servidor HTTP | `http.get(url)` |
| `jitter` | tipo | stdlib | variacao de latencia | `medir_jitter(fluxo)` |
| `latencia` | tipo | stdlib | atraso fim a fim | `medir_latencia(alvo)` |
| `mtu` | tipo | stdlib | unidade maxima de transmissao | `consultar_mtu(interface)` |
| `multicast` | recurso | runtime | grupo de distribuicao one-to-many | `entrar_multicast(grupo)` |
| `nexthop` | tipo | stdlib | proximo salto de rota | `definir nh como nexthop(ip)` |
| `pacote` | tipo | stdlib | unidade logica de rede | `decodificar_pacote(bytes)` |
| `pcap` | recurso | stdlib | formato classico de captura | `ler_pcap("dump.pcap")` |
| `pcapng` | recurso | stdlib | formato moderno de captura | `ler_pcapng("dump.pcapng")` |
| `porta` | tipo | stdlib | endpoint numerico de servico | `porta(443)` |
| `quadro` | tipo | stdlib | unidade de camada de enlace | `decodificar_quadro(bytes)` |
| `rota` | recurso | runtime | regra de encaminhamento | `consultar_rota(destino)` |
| `rotear` | verbo | runtime | encaminha pacote entre dominios | `rotear(pacote, tabela)` |
| `sni` | tipo | stdlib | nome de servidor em TLS | `extrair_sni(handshake)` |
| `socket` | recurso | runtime | handle de transporte | `definir s como socket("udp")` |
| `subrede` | tipo | stdlib | bloco local de enderecamento | `subrede("192.168.1.0/24")` |
| `telemetria_rede` | recurso | runtime | metricas de trafego e saude | `telemetria_rede(interface)` |
| `tls` | recurso | runtime | sessao segura baseada em TLS | `tls.conectar(host)` |
| `tunel` | recurso | runtime | encapsulamento de trafego | `abrir_tunel(origem, destino)` |
| `vazao` | tipo | stdlib | volume de dados por unidade de tempo | `medir_vazao(interface)` |
| `vlan` | tipo | stdlib | dominio logico de camada 2 | `marcar_vlan(quadro, 10)` |

## Jogos, simulacao e multimidia

| Termo | Classe | Camada | Uso tecnico | Forma sugerida |
| --- | --- | --- | --- | --- |
| `animacao` | recurso | runtime | sequencia temporal de poses ou frames | `carregar_animacao("andar")` |
| `asset` | recurso | runtime | recurso externo de jogo | `carregar_asset("hero.png")` |
| `camera` | recurso | runtime | viewport e transformacao visual | `definir cam como camera()` |
| `cena` | recurso | runtime | conjunto de entidades carregadas | `carregar_cena("fase1")` |
| `checkpoint` | recurso | runtime | ponto de retorno em jogo ou simulacao | `salvar_checkpoint("boss")` |
| `colisao` | recurso | runtime | sistema de interseccao e resposta | `detectar_colisao(a, b)` |
| `componente` | tipo | runtime | dado anexado a entidade em ECS | `registrar_componente("vida")` |
| `controle` | recurso | runtime | mapeamento de input para acao | `configurar_controle("teclado")` |
| `delta_tempo` | tipo | runtime | intervalo entre updates | `atualizar(delta_tempo)` |
| `efeito_sonoro` | recurso | runtime | som curto de acao | `tocar_efeito_sonoro("hit")` |
| `entidade` | recurso | runtime | identidade numerica ou simbolica no mundo | `criar_entidade()` |
| `estado_jogo` | recurso | runtime | snapshot da simulacao atual | `salvar_estado_jogo()` |
| `fase` | recurso | runtime | agrupamento de desafio ou ambiente | `carregar_fase("deserto")` |
| `fisica` | recurso | runtime | sistema de movimento e forcas | `aplicar_fisica(corpo)` |
| `frame` | tipo | runtime | unidade visual de render | `renderizar_frame()` |
| `hud` | recurso | runtime | interface fixa sobre o jogo | `mostrar_hud()` |
| `input` | recurso | runtime | entrada do usuario | `ler_input()` |
| `inventario` | recurso | runtime | colecao de itens do jogador | `abrir_inventario(jogador)` |
| `malha` | recurso | runtime | geometria 2D ou 3D | `carregar_malha("mapa.obj")` |
| `material` | recurso | runtime | propriedades de superficie | `criar_material(config)` |
| `missao` | recurso | runtime | objetivo rastreavel | `ativar_missao("escapar")` |
| `navegacao` | recurso | runtime | busca de caminho e steering | `calcular_navegacao(inicio, fim)` |
| `navmesh` | recurso | runtime | malha de navegacao | `carregar_navmesh("arena.nav")` |
| `particula` | recurso | runtime | sistema de efeitos visuais | `emitir_particula("fogo")` |
| `placar` | recurso | runtime | pontos e ranking | `atualizar_placar(jogador, 10)` |
| `renderizar` | verbo | runtime | desenha estado atual | `renderizar(cena)` |
| `shader` | recurso | runtime | programa de GPU ou simulacao equivalente | `carregar_shader("agua")` |
| `som` | recurso | runtime | fluxo de audio continuo | `tocar_som("tema.ogg")` |
| `sprite` | recurso | runtime | imagem 2D desenhavel | `carregar_sprite("npc.png")` |
| `tilemap` | recurso | runtime | grade de tiles do mundo | `carregar_tilemap("fase.tmx")` |
| `ui_jogo` | recurso | runtime | widgets de jogo | `criar_ui_jogo()` |
| `vetor2` | tipo | stdlib | vetor bidimensional | `vetor2(10, 20)` |
| `vetor3` | tipo | stdlib | vetor tridimensional | `vetor3(1, 2, 3)` |

## Engine e editor de jogo

Esta secao registra o vocabulario necessario para um engine/editor no estilo
Godot, mantendo PTJS como camada principal de logica, editor e tooling.

| Termo | Classe | Camada | Uso tecnico | Forma sugerida |
| --- | --- | --- | --- | --- |
| `arvore_cena` | recurso | stdlib | hierarquia principal de nos carregados | `arvore_cena(raiz)` |
| `autocarregar` | recurso | runtime | singleton global de projeto | `autocarregar("GameState")` |
| `bus_audio` | recurso | stdlib | mixer logico de som e musica | `bus_audio("Master")` |
| `camera2d` | recurso | stdlib | camera 2D de viewport | `camera2d(config)` |
| `camera3d` | recurso | stdlib | camera 3D de viewport | `camera3d(config)` |
| `cena_empacotada` | recurso | stdlib | cena serializavel e instanciavel | `cena_empacotada(raiz)` |
| `colisor_caixa` | recurso | runtime | shape AABB para fisica simples | `colisor_caixa(32, 32)` |
| `animador` | recurso | stdlib | controlador de playback de animacoes | `animador(config)` |
| `configuracao_projeto` | recurso | stdlib | settings persistentes do projeto | `configuracao_projeto(valores)` |
| `cor` | tipo | stdlib | cor RGBA ou hexadecimal | `cor("#44aa88")` |
| `corpo_rigido2d` | recurso | runtime | corpo movido por fisica 2D | `corpo_rigido2d(config)` |
| `dock` | recurso | stdlib | painel ancorado do editor | `dock("Inspector")` |
| `editor_script` | recurso | runtime | extensao de editor em script | `editor_script(config)` |
| `exportar_projeto` | verbo | runtime | empacota build de distribuicao | `exportar_projeto("linux")` |
| `forma_colisao` | recurso | runtime | shape de colisao associado a no | `forma_colisao("caixa")` |
| `gerenciador_projeto` | recurso | stdlib | catalogo de projetos locais | `gerenciador_projeto(lista)` |
| `gizmo` | recurso | runtime | manipulador visual do editor | `gizmo("mover")` |
| `importador_asset` | recurso | runtime | pipeline de importacao e preprocessamento | `importador_asset(config)` |
| `inspetor` | recurso | stdlib | painel de propriedades do editor | `inspetor(alvo)` |
| `janela_editor` | recurso | runtime | janela principal do editor | `janela_editor(config)` |
| `label` | recurso | stdlib | no textual 2D/UI | `label("Titulo", config)` |
| `luz2d` | recurso | runtime | emissor de luz 2D | `luz2d(config)` |
| `mapa_entrada` | recurso | stdlib | mapeamento de acoes e teclas | `mapa_entrada(config)` |
| `material_shader` | recurso | runtime | material ligado a shader | `material_shader(shader, opcoes)` |
| `malha_imediata` | recurso | runtime | geometria gerada em tempo real | `malha_imediata()` |
| `no` | recurso | stdlib | no generico da arvore de cena | `no("Raiz")` |
| `no2d` | recurso | stdlib | no com transformacao 2D | `no2d("Jogador", config)` |
| `no3d` | recurso | stdlib | no com transformacao 3D | `no3d("Camera", config)` |
| `painel_dock` | recurso | stdlib | definicao de dock do editor | `painel_dock("Filesystem")` |
| `plugin_editor` | recurso | stdlib | extensao de editor carregavel | `plugin_editor(config)` |
| `recurso` | recurso | stdlib | item serializavel de projeto | `recurso("Textura", "imagem", dados)` |
| `script_no` | recurso | runtime | script associado a no | `script_no("player.ptjs")` |
| `shader_canvas` | recurso | runtime | shader para canvas 2D | `shader_canvas(codigo)` |
| `sinal` | recurso | stdlib | evento conectavel entre nos | `sinal("pressed")` |
| `sprite2d` | recurso | stdlib | no 2D com desenho de sprite | `sprite2d("Heroi", config)` |
| `tema_editor` | recurso | runtime | tema visual do editor | `tema_editor("claro")` |
| `tempo_engine` | recurso | runtime | relogio e delta do engine | `tempo_engine()` |
| `timeline` | recurso | runtime | trilha temporal de animacao | `timeline(config)` |
| `viewport` | recurso | stdlib | alvo de render e camera | `viewport(config)` |

## Agentes, automacao e integracao operacional

Esta secao cobre vocabulos uteis para clones de plataformas no estilo
orquestradores de agentes, gateways e automacoes com ferramentas.

| Termo | Classe | Camada | Uso tecnico | Forma sugerida |
| --- | --- | --- | --- | --- |
| `agenda` | recurso | runtime | calendario de jobs e tarefas | `agenda("padrao")` |
| `agente` | recurso | runtime | executor autonomo orientado a objetivo | `agente(config)` |
| `autenticar` | verbo | runtime | valida identidade de usuario ou servico | `autenticar(token)` |
| `autorizar` | verbo | runtime | concede acao apos politica | `autorizar(usuario, acao)` |
| `canal_mensagem` | recurso | runtime | fila, websocket, email ou chat | `abrir_canal_mensagem("ws")` |
| `credencial` | recurso | runtime | material secreto ou assinatura de acesso | `carregar_credencial("api")` |
| `delegar` | verbo | runtime | encaminha tarefa para outro agente | `delegar(subagente, tarefa)` |
| `ferramenta` | recurso | runtime | funcao de mundo externo registrada | `registrar_ferramenta("git", fn)` |
| `gateway` | recurso | runtime | fronteira de entrada e roteamento | `iniciar_gateway()` |
| `heartbeat` | evento | runtime | pulso periodico de saude | `emitir_heartbeat()` |
| `habilidade` | recurso | runtime | pacote de capacidade reutilizavel | `carregar_habilidade("shell")` |
| `job` | recurso | runtime | unidade de trabalho agendada | `criar_job("indexar")` |
| `manifesto` | recurso | stdlib | contrato declarativo de app, skill ou agente | `ler_manifesto("app.json")` |
| `memoria_curta` | recurso | runtime | contexto recente do agente | `sessao.memoria_curta` |
| `memoria_longa` | recurso | runtime | armazenamento persistente recuperavel | `sessao.memoria_longa` |
| `migracao` | recurso | runtime | evolucao versionada de schema ou estado | `executar_migracao("v2")` |
| `modelo_chat` | recurso | runtime | modelo configurado para conversa | `carregar_modelo_chat("local")` |
| `onboard` | verbo | runtime | inicializa usuario, projeto ou agente | `onboard(usuario)` |
| `orquestrar` | verbo | runtime | coordena varias etapas ou subagentes | `orquestrar(plano)` |
| `periferico` | recurso | ffi | dispositivo externo controlavel | `listar_perifericos()` |
| `provedor` | recurso | runtime | backend de execucao, modelo ou storage | `provedor("openai")` |
| `rag` | recurso | runtime | pipeline de busca + resposta | `executar_rag(consulta)` |
| `rota_modelo` | recurso | runtime | roteia chamadas para modelo adequado | `rota_modelo("analise")` |
| `runtime_docker` | recurso | host | ambiente isolado em container | `runtime_docker(config)` |
| `runtime_wasm` | recurso | host | sandbox de modulos WebAssembly | `runtime_wasm(modulo)` |
| `sandbox` | politica | runtime | restricao de execucao e efeitos | `abrir_sandbox(perfil)` |
| `segredo` | recurso | runtime | dado sensivel cifrado ou protegido | `ler_segredo("db_url")` |
| `servico` | recurso | runtime | processo persistente com endpoint | `subir_servico("indexador")` |
| `skill` | recurso | runtime | pacote de instrucao, ferramenta e fluxo | `carregar_skill("repositorio")` |
| `telemetria_agente` | recurso | runtime | metricas e traces do ecossistema de agentes | `telemetria_agente(sessao)` |
| `tunel` | recurso | runtime | encaminha trafego privado entre ambientes | `abrir_tunel(origem, destino)` |
| `versao_config` | recurso | stdlib | identificador de contrato de configuracao | `manifesto.versao_config` |
| `workflow` | recurso | runtime | grafo ou fluxo de automacao | `executar_workflow("deploy")` |
| `workspace` | recurso | runtime | diretorio e contexto de trabalho do agente | `abrir_workspace(projeto)` |

## Antivirus, deteccao e resposta

Esta secao mira vocabulos para engines no estilo ClamAV e sistemas proximos.

| Termo | Classe | Camada | Uso tecnico | Forma sugerida |
| --- | --- | --- | --- | --- |
| `amostra_maliciosa` | recurso | runtime | item suspeito sob analise | `definir a como amostra_maliciosa(arquivo)` |
| `assinatura_binaria` | recurso | runtime | padrao de bytes ou regra de deteccao | `carregar_assinatura_binaria()` |
| `atualizar_banco` | verbo | runtime | atualiza base de deteccao | `atualizar_banco()` |
| `bytecode_assinatura` | recurso | runtime | regra compilada para motor de scan | `compilar_bytecode_assinatura()` |
| `descompactar` | verbo | runtime | expande arquivo composto | `descompactar(pacote)` |
| `extrair_anexo` | verbo | runtime | isola conteudo interno para scan | `extrair_anexo(container)` |
| `familia_malware` | tipo | stdlib | agrupamento taxonomico de ameaca | `familia_malware("trojan")` |
| `falso_negativo` | tipo | stdlib | deteccao ausente em amostra ruim | `medir_falso_negativo(base)` |
| `falso_positivo` | tipo | stdlib | deteccao indevida em item limpo | `medir_falso_positivo(base)` |
| `fila_varredura` | recurso | runtime | pipeline assincorono de scans | `fila_varredura()` |
| `hash_bloco` | tipo | stdlib | hash de secao ou intervalo | `hash_bloco(bytes)` |
| `heuristica` | recurso | runtime | regra comportamental ou estrutural | `aplicar_heuristica(amostra)` |
| `ioc` | recurso | stdlib | indicador de comprometimento | `registrar_ioc(tipo, valor)` |
| `limpar_cache_limpo` | verbo | runtime | zera cache de arquivos limpos | `limpar_cache_limpo()` |
| `metadado_scan` | recurso | runtime | informacoes ricas sobre a varredura | `metadado_scan(resultado)` |
| `motor_varredura` | recurso | runtime | engine principal de scan | `criar_motor_varredura()` |
| `on_access` | politica | host | varredura em acesso a arquivo | `ativar_on_access()` |
| `quarentena` | recurso | runtime | isolador de itens suspeitos | `enviar_para_quarentena(arquivo)` |
| `recursao_arquivo` | politica | runtime | profundidade de extracao e scan | `configurar_recursao_arquivo(5)` |
| `restaurar_quarentena` | verbo | runtime | devolve item isolado | `restaurar_quarentena(id)` |
| `scan_fluxo` | verbo | runtime | varre bytes em stream | `scan_fluxo(stream)` |
| `scan_memoria` | verbo | ffi | varre regiao de memoria | `scan_memoria(pid)` |
| `tipo_arquivo` | tipo | stdlib | classifica container, binario ou texto | `tipo_arquivo(caminho)` |
| `varrer` | verbo | runtime | nome generico para scan | `varrer(alvo)` |
| `varrer_arquivo` | verbo | runtime | scan de arquivo individual | `varrer_arquivo("teste.exe")` |
| `varrer_fluxo` | verbo | runtime | scan em pipeline de bytes | `varrer_fluxo(stream)` |
| `veredicto` | tipo | stdlib | resultado final do scan | `mostrar veredicto de resultado` |
| `whitelist` | recurso | runtime | lista de excecoes permitidas | `adicionar_whitelist(hash)` |

## Analise de trafego, MITM controlado e wireless

Esta secao cobre palavras para clones de ferramentas no estilo Wireshark,
Ettercap, Kismet e Airtool 2. Recursos de interceptacao ativa devem ser
tratados como `operacoes controladas`, com gate de capabilidade e foco
laboratorial.

| Termo | Classe | Camada | Uso tecnico | Forma sugerida |
| --- | --- | --- | --- | --- |
| `abrir_captura` | verbo | runtime | inicia sessao de captura ao vivo ou offline | `abrir_captura("eth0")` |
| `abrir_wireshark` | verbo | host | abre captura no analisador grafico externo | `abrir_wireshark(arquivo)` |
| `adaptador_wifi` | recurso | ffi | interface wireless com modo monitor | `adaptador_wifi("wlan0")` |
| `adsb` | recurso | ffi | captura e decode de ADS-B | `capturar_adsb(fonte)` |
| `alerta_ids` | evento | runtime | alerta de deteccao em trafego ou RF | `emitir_alerta_ids(regra)` |
| `analise_host` | recurso | runtime | resumo tecnico por host observado | `analise_host(ip)` |
| `ble` | recurso | ffi | captura Bluetooth Low Energy | `capturar_ble(adaptador)` |
| `bluetooth` | recurso | ffi | captura e decode Bluetooth classico | `capturar_bluetooth(adaptador)` |
| `canal_wifi` | tipo | stdlib | canal ou frequencia de captura | `canal_wifi(6)` |
| `captura_live` | recurso | runtime | stream vivo de pacotes | `captura_live(interface)` |
| `captura_remota` | recurso | runtime | fonte remota de pacotes ou RF | `captura_remota("sensor01")` |
| `captura_rotativa` | politica | runtime | rotacao por tempo ou tamanho | `captura_rotativa(max_mb=100)` |
| `cloudshark` | recurso | host | upload de captura para analise externa | `enviar_para_cloudshark(arquivo)` |
| `decodificar_como` | verbo | runtime | forca interpretacao de protocolo | `decodificar_como(fluxo, "http")` |
| `descriptografar` | verbo | runtime | aplica material de chave para leitura | `descriptografar(captura, chaves)` |
| `dissector` | recurso | runtime | plugin ou modulo de disseccao | `registrar_dissector("modbus", fn)` |
| `dissecar` | verbo | runtime | converte bytes em estrutura de protocolo | `dissecar(pacote)` |
| `envenenar_arp` | verbo | ffi | MITM controlado em laboratorio | `envenenar_arp(alvos)` |
| `estatistica_conversa` | recurso | runtime | resume pares e volumes de conversa | `estatistica_conversa(captura)` |
| `estatistica_protocolo` | recurso | runtime | resumo por protocolo e camada | `estatistica_protocolo(captura)` |
| `falsificar_dhcp` | verbo | ffi | resposta DHCP controlada em laboratorio | `falsificar_dhcp(interface)` |
| `fatiar_pacote` | verbo | runtime | captura parcial de payload | `fatiar_pacote(bytes, limite)` |
| `filtrar_captura` | verbo | runtime | filtro de captura ao vivo | `filtrar_captura("tcp port 80")` |
| `filtrar_exibicao` | verbo | runtime | filtro logico de apresentacao | `filtrar_exibicao("http.request")` |
| `fonte_dados` | recurso | runtime | datasource de captura ou RF | `registrar_fonte_dados("btle")` |
| `gps_fixo` | recurso | stdlib | coordenada estatica para captura | `gps_fixo(lat, lon)` |
| `gps_meta` | recurso | stdlib | GPS enriquecido com metadados | `gps_meta(dados)` |
| `host_descoberto` | evento | runtime | novo host detectado na analise | `emitir_evento("host_descoberto")` |
| `hopping_canal` | politica | ffi | troca automatica de canais | `ativar_hopping_canal(interface)` |
| `ids_wireless` | recurso | runtime | IDS focado em RF e wireless | `ids_wireless(config)` |
| `kismetdb` | recurso | stdlib | banco de dados de captura Kismet-like | `abrir_kismetdb("capture.kismetdb")` |
| `mitm_controlado` | politica | runtime | escopo explicito para interceptacao de laboratorio | `habilitar_mitm_controlado()` |
| `packets_nuvem` | recurso | host | servico externo de compartilhamento de pacotes | `enviar_para_packets(arquivo)` |
| `pcap_rotativo` | recurso | runtime | conjunto rotativo de capturas | `pcap_rotativo("base")` |
| `ponte_sniffer` | recurso | ffi | ponte transparente de sniffing | `ponte_sniffer(a, b)` |
| `reassemblar_fluxo` | verbo | runtime | recompõe stream TCP ou similar | `reassemblar_fluxo(id)` |
| `redirecionar_icmp` | verbo | ffi | redirecionamento controlado em laboratorio | `redirecionar_icmp(alvos)` |
| `rtl433` | recurso | ffi | captura sensores suportados por rtl_433 | `capturar_rtl433(fonte)` |
| `rtlamr` | recurso | ffi | captura medidores suportados por rtlamr | `capturar_rtlamr(fonte)` |
| `roubar_porta` | verbo | ffi | port stealing controlado em laboratorio | `roubar_porta(alvo)` |
| `seguir_fluxo` | verbo | runtime | acompanha stream de conversa | `seguir_fluxo(id)` |
| `sensor_remoto` | recurso | runtime | nodo remoto de captura | `sensor_remoto("pi-01")` |
| `siem` | recurso | host | encaminhamento de alertas e eventos | `enviar_para_siem(alerta)` |
| `stream_tcp` | recurso | runtime | representacao de fluxo TCP | `stream_tcp(id)` |
| `ubertooth` | recurso | ffi | adaptador de captura Bluetooth suportado | `ubertooth(indice=0)` |
| `voip` | recurso | runtime | analise de chamadas e fluxos de voz | `analisar_voip(captura)` |
| `wardrive` | recurso | runtime | sessao de wardriving com GPS | `iniciar_wardrive(perfil)` |
| `webui_captura` | recurso | host | interface web para captura e analise | `subir_webui_captura()` |
| `wifi` | recurso | ffi | captura e decode Wi-Fi | `capturar_wifi(interface)` |
| `wigle` | recurso | host | exportacao de wardriving para Wigle | `exportar_wigle(log)` |
| `wlan_pi` | recurso | host | sensor remoto dedicado para captura | `conectar_wlan_pi(host)` |
| `zigbee` | recurso | ffi | captura e decode Zigbee | `capturar_zigbee(adaptador)` |

## Formas canonicas sugeridas

As palavras acima devem preferir formatos previsiveis e tecnicos.

### 1. Acao sobre recurso

```txt
verbo(recurso, opcoes)
```

Exemplos:

```txt
varrer_arquivo("amostra.exe")
capturar_pacote("eth0")
treinar(modelo, dados)
renderizar(cena)
```

### 2. Construtor de handle ou tipo

```txt
recurso(configuracao)
```

Exemplos:

```txt
agente(config)
tensor([1, 2, 3])
camera()
pcapng("captura.pcapng")
```

### 3. Politica explicita

```txt
habilitar_politica(...)
aplicar_politica(...)
exigir_capabilidade(...)
```

Exemplos:

```txt
exigir_capabilidade("kernel")
aplicar_politica("seccomp")
habilitar_mitm_controlado()
```

### 4. Eventos e telemetria

```txt
emitir_evento(nome, dados)
registrar_metrica(nome, valor)
```

Exemplos:

```txt
emitir_evento("host_descoberto", host)
registrar_metrica("latencia_media", valor)
```

## Criterios para promover um verbete a feature real

Um termo desta lista so deve virar implementacao oficial quando atender a
todos os pontos abaixo:

1. Semantica clara:
   entrada, saida, efeitos colaterais e erros precisam estar definidos.
2. Dono tecnico:
   precisa estar claro se vive no parser, runtime, stdlib, host ou FFI.
3. Contrato de seguranca:
   operacoes sensiveis precisam de capabilidade, sandbox ou modo laboratorio.
4. Testes:
   deve existir cobertura positiva, negativa e de regressao.
5. Documentacao:
   o termo precisa aparecer em `docs/dicionario.md` apenas quando virar
   superficie implementada.

## Prioridade recomendada

Para evoluir PTJS de forma saudavel, a ordem mais segura e:

| Prioridade | Foco |
| --- | --- |
| `P0` | verbetes transversais, arquivos, processos, sockets, eventos e buffers |
| `P1` | rede base, jogos 2D simples, modelos locais e pipeline de IA |
| `P2` | agentes, scan de arquivos, pcap offline, telemetria rica |
| `P3` | wireless avancado, sensores remotos, RF, sandbox de plugins |
| `P4` | kernel, eBPF, MITM controlado e operacoes com privilegio |

## Fechamento

Este dicionario deve continuar crescendo como `inventario tecnico de
desenvolvimento`, e nao como promessa automatica de implementacao.

Quando um termo passar a existir de verdade no GatoCore, ele deve sair da
condicao de candidato e entrar na documentacao oficial de superficie da
linguagem.
