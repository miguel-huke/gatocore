# Errors

## Objetivo

Definir os erros iniciais e o tom das mensagens da linguagem.

## Principios

- mensagem curta e especifica
- citar a palavra esperada quando houver forma canonica
- evitar mensagens genericas quando o parser conseguir apontar a causa real

## Casos iniciais

### Declaracao incompleta

Entrada:

```txt
definir nome 10
```

Mensagem sugerida:

```txt
esperado `como`
```

### Nome ausente em declaracao

Entrada:

```txt
definir como 10
```

Mensagem sugerida:

```txt
identificador esperado apos `definir`
```

### `mostrar` sem expressao

Entrada:

```txt
mostrar
```

Mensagem sugerida:

```txt
expressao esperada apos `mostrar`
```

### `se` sem `então`

Entrada:

```txt
se condicao
  mostrar 1
fim
```

Mensagem sugerida:

```txt
esperado `então` apos a condicao do bloco `se`
```

### Bloco sem `fim`

Entrada:

```txt
se condicao então
  mostrar 1
```

Mensagem sugerida:

```txt
esperado `fim` para encerrar o bloco iniciado por `se`
```

### `de` fora de expressao valida

Entrada:

```txt
mostrar de texto
```

Mensagem sugerida:

```txt
`de` e identificador reservado no modo portugues
```

### Operador sem alvo compativel

Entrada:

```txt
tamanho de 10
```

Mensagem sugerida:

```txt
tamanho de nao pode ser aplicado a este valor
```

### Palavra reservada como identificador

Entrada:

```txt
definir mostrar como 1
```

Mensagem sugerida:

```txt
identificador esperado apos `definir`
```

## Recomendacao de implementacao

Sempre que possivel:

- distinguir erro lexical de erro sintatico
- anexar linha e coluna vindas do parser do QuickJS
- manter a terminologia da linguagem em portugues
