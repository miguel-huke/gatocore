# NullClaw PTJS Sample

Este sample implementa, em PTJS, uma replica de alto nivel da experiencia de
uso do NullClaw dentro dos limites atuais do GatoCore.

## Comando principal

```sh
cd ~/Documents/Huke/GatoCore
./bin/gatocore samples/nullclaw.ptjs help
```

## Fluxos uteis

Primeiro setup:

```sh
./bin/gatocore samples/nullclaw.ptjs onboard --provider local-ptjs --model ptjs-assistant --memory json-hybrid
```

Prompt unico:

```sh
./bin/gatocore samples/nullclaw.ptjs agent -m "status geral do sistema"
```

Modo interativo:

```sh
./bin/gatocore samples/nullclaw.ptjs agent
```

Gateway live:

```sh
./bin/gatocore samples/nullclaw.ptjs gateway
```

Status e diagnostico:

```sh
./bin/gatocore samples/nullclaw.ptjs status
./bin/gatocore samples/nullclaw.ptjs doctor
```

Memoria e historico:

```sh
./bin/gatocore samples/nullclaw.ptjs memory stats
./bin/gatocore samples/nullclaw.ptjs history list
```

## O que este sample replica de verdade

- onboarding
- agente com prompt unico e modo interativo
- roteamento simples de modelo
- memoria local, historico e busca vetorial
- gateway loop local
- service, channel, auth, cron, skills, workspace, models e capabilities
- flags de automacao, manifest e probes de health

## O que continua simulado

- servidor HTTP real de gateway
- websockets e canais remotos reais
- provedores LLM remotos completos
- sandbox de kernel e isolamento forte
- daemonizacao nativa persistente

## Estado persistido

O sample cria e usa:

- `samples/nullclaw_state`
- `samples/nullclaw_workspace`
- `samples/nullclaw_exports`
