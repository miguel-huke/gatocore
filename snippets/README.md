# Snippets

Base reutilizavel do backend nativo PTJS.

Cada arquivo aqui existe para ser consumido por `compiler/ptjs_native.js`.
Os snippets ficam quebrados em partes pequenas para permitir recomposicao:

- `keywords/`: palavras-chave, aliases e conectores do subconjunto nativo
- `ir/`: opcodes e tipos aceitos no IR
- `alloc/`: classes de registradores e estrategia de alocacao
- `asm/`: convencoes SysV AMD64, fragments e tabelas de emissao
- `peephole/`: regras de otimizacao textual da saida assembly
- `toolchain/`: configuracao da toolchain nativa local

Os arquivos em `asm/fragments/` sao partes menores de snippets maiores e
podem ser combinados em outras geracoes futuras.
