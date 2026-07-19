(function (global) {
  "use strict";

  var std = global.std;
  var os = global.os;

  function fatal(message) {
    std.err.puts("ptjs_native: " + message + "\n");
    std.exit(1);
  }

  function readText(path) {
    var data = std.loadFile(path);
    if (data === null) {
      fatal("nao foi possivel ler " + path);
    }
    return data;
  }

  function writeText(path, text) {
    var file = std.open(path, "w");
    if (!file) {
      fatal("nao foi possivel escrever " + path);
    }
    file.puts(text);
    file.close();
  }

  function dirname(path) {
    var clean = String(path).replace(/\/+$/, "");
    var index = clean.lastIndexOf("/");
    if (index < 0) {
      return ".";
    }
    if (index === 0) {
      return "/";
    }
    return clean.slice(0, index);
  }

  function joinPath(base, tail) {
    if (!base || base === ".") {
      return tail;
    }
    if (!tail) {
      return base;
    }
    if (tail[0] === "/") {
      return tail;
    }
    return String(base).replace(/\/+$/, "") + "/" + String(tail).replace(/^\/+/, "");
  }

  function stripExt(path) {
    return String(path).replace(/\.[^.\/]+$/, "");
  }

  function detectRoot() {
    var current = os.getcwd();
    while (true) {
      if (
        os.stat(joinPath(current, "Makefile")) &&
        os.stat(joinPath(current, "bin/gatocore")) &&
        os.stat(joinPath(current, "snippets"))
      ) {
        return current;
      }
      if (current === "/") {
        break;
      }
      current = dirname(current);
    }
    fatal("raiz do projeto nao encontrada; use --root");
  }

  function parseArgs(argv) {
    if (argv.length && /\.js$/.test(argv[0])) {
      argv = argv.slice(1);
    }
    var options = {
      mode: null,
      root: null,
      input: null,
      output: null,
      stdout: false,
      keepAsm: false
    };
    var index = 0;
    while (index < argv.length) {
      var arg = argv[index];
      if (arg === "--root") {
        index += 1;
        options.root = argv[index] || null;
      } else if (arg === "--input") {
        index += 1;
        options.input = argv[index] || null;
      } else if (arg === "--output") {
        index += 1;
        options.output = argv[index] || null;
      } else if (arg === "--stdout") {
        options.stdout = true;
      } else if (arg === "--keep-asm") {
        options.keepAsm = true;
      } else if (!options.mode) {
        options.mode = arg;
      } else {
        fatal("argumento inesperado: " + arg);
      }
      index += 1;
    }
    if (!options.mode) {
      fatal("modo esperado: ir | asm | native-build");
    }
    if (!options.root) {
      options.root = detectRoot();
    }
    if (!options.input) {
      fatal("--input obrigatorio");
    }
    return options;
  }

  function loadJson(path) {
    return JSON.parse(readText(path));
  }

  function loadSnippets(root) {
    function from(rel) {
      return joinPath(root, "snippets/" + rel);
    }

    return {
      keywords: loadJson(from("keywords/core_pt.json")),
      aliases: loadJson(from("keywords/aliases_pt.json")).aliases,
      opcodes: loadJson(from("ir/opcodes.json")).opcodes,
      types: loadJson(from("ir/types.json")),
      registers: loadJson(from("alloc/register_classes.json")),
      asmRegisters: loadJson(from("asm/registers_sysv_amd64.json")),
      callconv: loadJson(from("asm/callconv_sysv_amd64.json")),
      binops: loadJson(from("asm/int_binops.json")),
      cmps: loadJson(from("asm/int_cmp_setcc.json")),
      runtimeCalls: loadJson(from("asm/runtime_calls.json")),
      asmFragments: {
        header: readText(from("asm/fragments/header.tpl")),
        rodata: readText(from("asm/fragments/rodata.tpl")),
        functionLabel: readText(from("asm/fragments/function_label.tpl")),
        prologue: readText(from("asm/fragments/prologue.tpl")),
        epilogue: readText(from("asm/fragments/epilogue.tpl"))
      },
      peephole: loadJson(from("peephole/base.json")).rules
        .concat(loadJson(from("peephole/arithmetic.json")).rules),
      toolchain: loadJson(from("toolchain/linux_x86_64.json"))
    };
  }

  function isDigit(ch) {
    return ch >= "0" && ch <= "9";
  }

  function isIdStart(ch) {
    var code = ch.charCodeAt(0);
    return (
      (ch >= "a" && ch <= "z") ||
      (ch >= "A" && ch <= "Z") ||
      ch === "_" ||
      code >= 0x80
    );
  }

  function isIdContinue(ch) {
    return isIdStart(ch) || isDigit(ch);
  }

  function makeToken(type, value, line, col) {
    return { type: type, value: value, line: line, col: col };
  }

  function tokenize(source, snippets) {
    var aliases = snippets.aliases;
    var keywordSet = {};
    var tokens = [];
    var index = 0;
    var line = 1;
    var col = 1;
    var i;
    for (i = 0; i < snippets.keywords.keywords.length; i++) {
      keywordSet[snippets.keywords.keywords[i]] = true;
    }

    function currentChar() {
      return source[index];
    }

    function nextChar() {
      return source[index + 1];
    }

    function advance() {
      var ch = source[index];
      index += 1;
      if (ch === "\n") {
        line += 1;
        col = 1;
      } else {
        col += 1;
      }
      return ch;
    }

    function skipWhitespace() {
      while (index < source.length) {
        var ch = currentChar();
        if (ch === " " || ch === "\t" || ch === "\r" || ch === "\n") {
          advance();
          continue;
        }
        if (ch === "#" ) {
          while (index < source.length && currentChar() !== "\n") {
            advance();
          }
          continue;
        }
        if (ch === "/" && nextChar() === "/") {
          while (index < source.length && currentChar() !== "\n") {
            advance();
          }
          continue;
        }
        break;
      }
    }

    function readString(quote) {
      var startLine = line;
      var startCol = col;
      var out = "";
      advance();
      while (index < source.length) {
        var ch = advance();
        if (ch === quote) {
          return makeToken("string", out, startLine, startCol);
        }
        if (ch === "\\") {
          var esc = advance();
          switch (esc) {
            case "n":
              out += "\n";
              break;
            case "t":
              out += "\t";
              break;
            case "r":
              out += "\r";
              break;
            case "\\":
              out += "\\";
              break;
            case "\"":
              out += "\"";
              break;
            case "'":
              out += "'";
              break;
            default:
              out += esc;
              break;
          }
        } else {
          out += ch;
        }
      }
      fatal("string nao terminada em " + startLine + ":" + startCol);
    }

    function readNumber() {
      var startLine = line;
      var startCol = col;
      var value = "";
      while (index < source.length && isDigit(currentChar())) {
        value += advance();
      }
      return makeToken("number", value, startLine, startCol);
    }

    function readWord() {
      var startLine = line;
      var startCol = col;
      var value = "";
      while (index < source.length && isIdContinue(currentChar())) {
        value += advance();
      }
      if (aliases[value]) {
        value = aliases[value];
      }
      if (keywordSet[value]) {
        return makeToken("keyword", value, startLine, startCol);
      }
      return makeToken("identifier", value, startLine, startCol);
    }

    while (index < source.length) {
      skipWhitespace();
      if (index >= source.length) {
        break;
      }
      var startLine = line;
      var startCol = col;
      var ch = currentChar();
      var pair = ch + (nextChar() || "");
      if (ch === "\"" || ch === "'") {
        tokens.push(readString(ch));
        continue;
      }
      if (isDigit(ch)) {
        tokens.push(readNumber());
        continue;
      }
      if (isIdStart(ch)) {
        tokens.push(readWord());
        continue;
      }
      if (
        pair === "==" ||
        pair === "!=" ||
        pair === "<=" ||
        pair === ">=" ||
        pair === "&&" ||
        pair === "||"
      ) {
        advance();
        advance();
        tokens.push(makeToken("operator", pair, startLine, startCol));
        continue;
      }
      if (ch === "+" || ch === "-" || ch === "*" || ch === "/" || ch === "%" ||
          ch === "<" || ch === ">" || ch === "=" || ch === "!") {
        advance();
        tokens.push(makeToken("operator", ch, startLine, startCol));
        continue;
      }
      if (ch === "(" || ch === ")" || ch === "," || ch === "[" || ch === "]") {
        advance();
        tokens.push(makeToken("punct", ch, startLine, startCol));
        continue;
      }
      fatal("token inesperado `" + ch + "` em " + startLine + ":" + startCol);
    }

    tokens.push(makeToken("eof", "", line, col));
    return tokens;
  }

  function Parser(tokens) {
    this.tokens = tokens;
    this.index = 0;
  }

  Parser.prototype.current = function () {
    return this.tokens[this.index];
  };

  Parser.prototype.peek = function (offset) {
    return this.tokens[this.index + (offset || 0)];
  };

  Parser.prototype.at = function (type, value) {
    var token = this.current();
    if (!token || token.type !== type) {
      return false;
    }
    return value === undefined ? true : token.value === value;
  };

  Parser.prototype.match = function (type, value) {
    if (this.at(type, value)) {
      var token = this.current();
      this.index += 1;
      return token;
    }
    return null;
  };

  Parser.prototype.expect = function (type, value, label) {
    var token = this.current();
    if (!this.at(type, value)) {
      this.error(label || (type + " " + value + " esperado"));
    }
    this.index += 1;
    return token;
  };

  Parser.prototype.error = function (message) {
    var token = this.current();
    fatal("erro de parse em " + token.line + ":" + token.col + ": " + message);
  };

  Parser.prototype.parseProgram = function () {
    var functions = [];
    var body = [];
    while (!this.at("eof")) {
      if (this.at("keyword", "fun\u00e7\u00e3o")) {
        functions.push(this.parseFunction());
      } else {
        body.push(this.parseStatement());
      }
    }
    return {
      kind: "Program",
      functions: functions,
      body: body
    };
  };

  Parser.prototype.parseFunction = function () {
    this.expect("keyword", "fun\u00e7\u00e3o", "fun\u00e7\u00e3o esperada");
    var name = this.expect("identifier", undefined, "nome de fun\u00e7\u00e3o esperado");
    var params = [];
    if (this.match("punct", "(")) {
      if (!this.at("punct", ")")) {
        do {
          params.push(this.expect("identifier", undefined, "parametro esperado").value);
        } while (this.match("punct", ","));
      }
      this.expect("punct", ")", "')' esperado");
    }
    this.expect("keyword", "fa\u00e7a", "`fa\u00e7a` esperado");
    var body = this.parseBlock({ "fim": true });
    this.expect("keyword", "fim", "`fim` esperado");
    return {
      kind: "Function",
      name: name.value,
      params: params,
      line: name.line,
      col: name.col,
      body: body
    };
  };

  Parser.prototype.parseBlock = function (terminators) {
    var body = [];
    while (!this.at("eof")) {
      if (this.at("keyword") && terminators[this.current().value]) {
        break;
      }
      body.push(this.parseStatement());
    }
    return body;
  };

  Parser.prototype.parseStatement = function () {
    if (this.at("keyword", "definir")) {
      return this.parseDefine();
    }
    if (this.at("keyword", "mostrar")) {
      return this.parseShow();
    }
    if (this.at("keyword", "retornar")) {
      return this.parseReturn();
    }
    if (this.at("keyword", "se")) {
      return this.parseIf();
    }
    if (this.at("keyword", "enquanto")) {
      return this.parseWhile();
    }
    if (this.at("keyword", "para")) {
      return this.parseForEach();
    }
    if (this.at("identifier") && this.peek(1).type === "operator" && this.peek(1).value === "=") {
      return this.parseAssign();
    }
    var expr = this.parseExpression();
    return {
      kind: "ExprStmt",
      expr: expr,
      line: expr.line,
      col: expr.col
    };
  };

  Parser.prototype.parseDefine = function () {
    var start = this.expect("keyword", "definir");
    var name = this.expect("identifier", undefined, "nome esperado em definir");
    this.expect("keyword", "como", "`como` esperado em definir");
    return {
      kind: "Define",
      name: name.value,
      expr: this.parseExpression(),
      line: start.line,
      col: start.col
    };
  };

  Parser.prototype.parseAssign = function () {
    var name = this.expect("identifier");
    this.expect("operator", "=", "'=' esperado");
    return {
      kind: "Assign",
      name: name.value,
      expr: this.parseExpression(),
      line: name.line,
      col: name.col
    };
  };

  Parser.prototype.parseShow = function () {
    var start = this.expect("keyword", "mostrar");
    return {
      kind: "Show",
      expr: this.parseExpression(),
      line: start.line,
      col: start.col
    };
  };

  Parser.prototype.parseReturn = function () {
    var start = this.expect("keyword", "retornar");
    if (
      this.at("eof") ||
      (this.at("keyword") && (
        this.current().value === "fim" ||
        this.current().value === "sen\u00e3o"
      ))
    ) {
      return {
        kind: "Return",
        expr: null,
        line: start.line,
        col: start.col
      };
    }
    return {
      kind: "Return",
      expr: this.parseExpression(),
      line: start.line,
      col: start.col
    };
  };

  Parser.prototype.parseIf = function () {
    var start = this.expect("keyword", "se");
    var test = this.parseExpression();
    this.expect("keyword", "ent\u00e3o", "`ent\u00e3o` esperado");
    var thenBody = this.parseBlock({ "sen\u00e3o": true, "fim": true });
    var elseBody = [];
    if (this.match("keyword", "sen\u00e3o")) {
      elseBody = this.parseBlock({ "fim": true });
    }
    this.expect("keyword", "fim", "`fim` esperado");
    return {
      kind: "If",
      test: test,
      thenBody: thenBody,
      elseBody: elseBody,
      line: start.line,
      col: start.col
    };
  };

  Parser.prototype.parseWhile = function () {
    var start = this.expect("keyword", "enquanto");
    var test = this.parseExpression();
    this.expect("keyword", "fa\u00e7a", "`fa\u00e7a` esperado");
    var body = this.parseBlock({ "fim": true });
    this.expect("keyword", "fim", "`fim` esperado");
    return {
      kind: "While",
      test: test,
      body: body,
      line: start.line,
      col: start.col
    };
  };

  Parser.prototype.parseForEach = function () {
    var start = this.expect("keyword", "para");
    this.expect("keyword", "cada", "`cada` esperado");
    var binding = this.expect("identifier", undefined, "binding esperado em `para cada`");
    this.expect("keyword", "em", "`em` esperado");
    var iterable = this.parseExpression();
    this.expect("keyword", "fa\u00e7a", "`fa\u00e7a` esperado");
    var body = this.parseBlock({ "fim": true });
    this.expect("keyword", "fim", "`fim` esperado");
    return {
      kind: "ForEach",
      binding: binding.value,
      iterable: iterable,
      body: body,
      line: start.line,
      col: start.col
    };
  };

  Parser.prototype.parseExpression = function () {
    return this.parseBinary(0);
  };

  Parser.prototype.precedence = function (op) {
    switch (op) {
      case "||":
        return 1;
      case "&&":
        return 2;
      case "==":
      case "!=":
        return 3;
      case "<":
      case "<=":
      case ">":
      case ">=":
        return 4;
      case "+":
      case "-":
        return 5;
      case "*":
      case "/":
      case "%":
        return 6;
      default:
        return -1;
    }
  };

  Parser.prototype.parseBinary = function (minPrec) {
    var left = this.parseUnary();
    while (this.at("operator")) {
      var op = this.current().value;
      var prec = this.precedence(op);
      if (prec < minPrec) {
        break;
      }
      this.index += 1;
      var right = this.parseBinary(prec + 1);
      left = {
        kind: "Binary",
        op: op,
        left: left,
        right: right,
        line: left.line,
        col: left.col
      };
    }
    return left;
  };

  Parser.prototype.parseUnary = function () {
    var token = this.current();
    if (this.match("operator", "-")) {
      return {
        kind: "Unary",
        op: "-",
        expr: this.parseUnary(),
        line: token.line,
        col: token.col
      };
    }
    if (this.match("operator", "!")) {
      return {
        kind: "Unary",
        op: "!",
        expr: this.parseUnary(),
        line: token.line,
        col: token.col
      };
    }
    if (this.at("keyword", "tamanho")) {
      this.index += 1;
      this.expect("keyword", "de", "`de` esperado apos `tamanho`");
      return {
        kind: "Unary",
        op: "tamanho de",
        expr: this.parseUnary(),
        line: token.line,
        col: token.col
      };
    }
    if (this.at("keyword", "tipo")) {
      this.index += 1;
      this.expect("keyword", "de", "`de` esperado apos `tipo`");
      return {
        kind: "Unary",
        op: "tipo de",
        expr: this.parseUnary(),
        line: token.line,
        col: token.col
      };
    }
    if (this.at("keyword", "identificar")) {
      this.index += 1;
      return {
        kind: "Unary",
        op: "identificar",
        expr: this.parseUnary(),
        line: token.line,
        col: token.col
      };
    }
    if (this.at("keyword", "observar")) {
      this.index += 1;
      return {
        kind: "Unary",
        op: "observar",
        expr: this.parseUnary(),
        line: token.line,
        col: token.col
      };
    }
    return this.parsePostfix();
  };

  Parser.prototype.parsePostfix = function () {
    var expr = this.parsePrimary();
    while (this.match("punct", "(")) {
      var args = [];
      if (!this.at("punct", ")")) {
        do {
          args.push(this.parseExpression());
        } while (this.match("punct", ","));
      }
      this.expect("punct", ")", "')' esperado");
      expr = {
        kind: "Call",
        callee: expr,
        args: args,
        line: expr.line,
        col: expr.col
      };
    }
    return expr;
  };

  Parser.prototype.parsePrimary = function () {
    var token = this.current();
    if (this.at("identifier", "true") || this.at("identifier", "verdadeiro")) {
      this.index += 1;
      return {
        kind: "Bool",
        value: true,
        line: token.line,
        col: token.col
      };
    }
    if (this.at("identifier", "false") || this.at("identifier", "falso")) {
      this.index += 1;
      return {
        kind: "Bool",
        value: false,
        line: token.line,
        col: token.col
      };
    }
    if (this.at("identifier", "null") || this.at("identifier", "nulo")) {
      this.index += 1;
      return {
        kind: "Null",
        line: token.line,
        col: token.col
      };
    }
    if (this.match("number")) {
      return {
        kind: "Number",
        value: Number(token.value),
        line: token.line,
        col: token.col
      };
    }
    if (this.match("string")) {
      return {
        kind: "String",
        value: token.value,
        line: token.line,
        col: token.col
      };
    }
    if (this.match("identifier")) {
      return {
        kind: "Identifier",
        name: token.value,
        line: token.line,
        col: token.col
      };
    }
    if (this.match("punct", "[")) {
      var items = [];
      if (!this.at("punct", "]")) {
        do {
          items.push(this.parseExpression());
        } while (this.match("punct", ","));
      }
      this.expect("punct", "]", "`]` esperado");
      return {
        kind: "Array",
        items: items,
        line: token.line,
        col: token.col
      };
    }
    if (this.match("punct", "(")) {
      var expr = this.parseExpression();
      this.expect("punct", ")", "')' esperado");
      return expr;
    }
    this.error("expressao esperada");
  };

  function cloneMap(source) {
    var out = {};
    var key;
    for (key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        out[key] = source[key];
      }
    }
    return out;
  }

  function createCompileError(inputPath, node, message) {
    var line = node && node.line ? node.line : 1;
    var col = node && node.col ? node.col : 1;
    fatal(inputPath + ":" + line + ":" + col + ": " + message);
  }

  function mergeType(current, next) {
    if (!current) {
      return next;
    }
    if (!next) {
      return current;
    }
    if (current === next) {
      return current;
    }
    return "__conflict__";
  }

  function makeArrayType(itemType) {
    return "array<" + itemType + ">";
  }

  function isArrayType(type) {
    return typeof type === "string" && /^array<.+>$/.test(type);
  }

  function arrayItemType(type) {
    if (!isArrayType(type)) {
      return null;
    }
    return type.slice(6, -1);
  }

  function runtimeTypeOf(type) {
    if (isArrayType(type)) {
      return "array";
    }
    return type;
  }

  function typeDisplayName(type) {
    if (isArrayType(type)) {
      return "lista";
    }
    switch (type) {
      case "i64":
        return "numero";
      case "str":
        return "texto";
      case "bool":
        return "booleano";
      case "null":
        return "nulo";
      case "void":
        return "indefinido";
      default:
        return "objeto";
    }
  }

  function typeDefaultValue(type) {
    if (isArrayType(type)) {
      return { kind: "Null" };
    }
    switch (type) {
      case "str":
        return { kind: "String", value: "" };
      case "bool":
        return { kind: "Bool", value: false };
      case "null":
        return { kind: "Null" };
      case "i64":
      default:
        return { kind: "Number", value: 0 };
    }
  }

  function isIntLikeType(type) {
    return type === "i64" || type === "bool" || type === "null";
  }

  function canCompareTypes(left, right) {
    if (left === right && isIntLikeType(left)) {
      return true;
    }
    return left === "i64" && right === "i64";
  }

  function arrayTagFromType(type) {
    if (isArrayType(type)) {
      return 5;
    }
    switch (type) {
      case "i64":
        return 1;
      case "str":
        return 2;
      case "bool":
        return 3;
      case "null":
        return 4;
      default:
        return 0;
    }
  }

  function arrayUsesPointerItems(type) {
    return type === "str" || isArrayType(type);
  }

  function buildConstValue(unit, expr, inputPath) {
    var itemType;
    var items;
    var inferred;
    var index;
    switch (expr.kind) {
      case "Number":
        return { type: "i64", valueKind: "imm", value: expr.value };
      case "String":
        return {
          type: "str",
          valueKind: "label",
          value: internString(unit, expr.value)
        };
      case "Bool":
        return {
          type: "bool",
          valueKind: "imm",
          value: expr.value ? 1 : 0
        };
      case "Null":
        return {
          type: "null",
          valueKind: "imm",
          value: 0
        };
      case "Array":
        itemType = null;
        items = [];
        for (index = 0; index < expr.items.length; index++) {
          inferred = buildConstValue(unit, expr.items[index], inputPath);
          if (itemType === null) {
            itemType = inferred.type;
          } else if (itemType !== inferred.type) {
            createCompileError(inputPath, expr.items[index], "array nativo exige itens homogeneos");
          }
          items.push(inferred);
        }
        if (itemType === null) {
          itemType = "null";
        }
        return {
          type: makeArrayType(itemType),
          valueKind: "label",
          value: internArray(unit, items, itemType)
        };
      default:
        createCompileError(inputPath, expr, "array nativo aceita apenas valores constantes");
    }
  }

  function inferExpressionType(expr, env, functionTable, sourcePath) {
    var leftInfo;
    var rightInfo;
    var callee;
    var i;
    switch (expr.kind) {
      case "Number":
        return "i64";
      case "Bool":
        return "bool";
      case "Null":
        return "null";
      case "String":
        return "str";
      case "Array":
        var arrType = null;
        for (i = 0; i < expr.items.length; i++) {
          var nextItemType = inferExpressionType(expr.items[i], env, functionTable, sourcePath) || "null";
          if (arrType === null) {
            arrType = nextItemType;
          } else if (arrType !== nextItemType) {
            createCompileError(sourcePath, expr.items[i], "array nativo exige itens homogeneos");
          }
        }
        return makeArrayType(arrType || "null");
      case "Identifier":
        return env[expr.name] || null;
      case "Unary":
        if (expr.op === "-") {
          return "i64";
        }
        if (expr.op === "!") {
          return "bool";
        }
        if (expr.op === "tamanho de") {
          return "i64";
        }
        if (expr.op === "tipo de") {
          return "str";
        }
        if (expr.op === "identificar") {
          return "str";
        }
        if (expr.op === "observar") {
          return inferExpressionType(expr.expr, env, functionTable, sourcePath) || "i64";
        }
        return null;
      case "Binary":
        leftInfo = inferExpressionType(expr.left, env, functionTable, sourcePath);
        rightInfo = inferExpressionType(expr.right, env, functionTable, sourcePath);
        if (expr.op === "&&" || expr.op === "||") {
          return "bool";
        }
        if (expr.op === "==" || expr.op === "!=" || expr.op === "<" || expr.op === "<=" || expr.op === ">" || expr.op === ">=") {
          return "bool";
        }
        if (expr.op === "+" || expr.op === "-" || expr.op === "*" || expr.op === "/" || expr.op === "%") {
          if (leftInfo === "str" || rightInfo === "str") {
            createCompileError(sourcePath, expr, "backend nativo ainda nao suporta aritmetica com texto");
          }
          return "i64";
        }
        return null;
      case "Call":
        if (expr.callee.kind !== "Identifier") {
          createCompileError(sourcePath, expr, "somente chamadas diretas por nome sao suportadas no backend nativo");
        }
        callee = functionTable[expr.callee.name];
        if (!callee) {
          createCompileError(sourcePath, expr, "funcao desconhecida `" + expr.callee.name + "`");
        }
        if (expr.args.length !== callee.paramTypes.length) {
          createCompileError(
            sourcePath,
            expr,
            "quantidade invalida de argumentos em `" + expr.callee.name + "`"
          );
        }
        for (i = 0; i < expr.args.length; i++) {
          var argType = inferExpressionType(expr.args[i], env, functionTable, sourcePath);
          var merged = mergeType(callee.paramTypes[i], argType || functionTable.__defaults__.default_param_type);
          if (merged === "__conflict__") {
            createCompileError(sourcePath, expr.args[i], "tipos conflitantes no parametro " + (i + 1) + " de `" + expr.callee.name + "`");
          }
          callee.paramTypes[i] = merged;
        }
        return callee.returnType || functionTable.__defaults__.default_return_type;
      default:
        return null;
    }
  }

  function inferStatements(body, env, meta, functionTable, sourcePath) {
    var changed = false;
    var index;
    for (index = 0; index < body.length; index++) {
      var stmt = body[index];
      var type;
      switch (stmt.kind) {
        case "Define":
          type = inferExpressionType(stmt.expr, env, functionTable, sourcePath) || functionTable.__defaults__.default_param_type;
          env[stmt.name] = type;
          break;
        case "Assign":
          type = inferExpressionType(stmt.expr, env, functionTable, sourcePath) || env[stmt.name] || functionTable.__defaults__.default_param_type;
          if (!env[stmt.name]) {
            env[stmt.name] = type;
          } else if (env[stmt.name] !== type) {
            createCompileError(sourcePath, stmt, "atribuicao mistura tipos em `" + stmt.name + "`");
          }
          break;
        case "Show":
        case "ExprStmt":
          inferExpressionType(stmt.expr, env, functionTable, sourcePath);
          break;
        case "Return":
          type = stmt.expr ?
            (inferExpressionType(stmt.expr, env, functionTable, sourcePath) || functionTable.__defaults__.default_return_type) :
            (meta.returnType || functionTable.__defaults__.default_return_type);
          var merged = mergeType(meta.returnType, type);
          if (merged === "__conflict__") {
            createCompileError(sourcePath, stmt, "retornos conflitantes em `" + meta.name + "`");
          }
          if (merged !== meta.returnType) {
            meta.returnType = merged;
            changed = true;
          }
          break;
        case "If":
          inferExpressionType(stmt.test, env, functionTable, sourcePath);
          if (inferStatements(stmt.thenBody, cloneMap(env), meta, functionTable, sourcePath)) {
            changed = true;
          }
          if (inferStatements(stmt.elseBody, cloneMap(env), meta, functionTable, sourcePath)) {
            changed = true;
          }
          break;
        case "While":
          inferExpressionType(stmt.test, env, functionTable, sourcePath);
          if (inferStatements(stmt.body, cloneMap(env), meta, functionTable, sourcePath)) {
            changed = true;
          }
          break;
        case "ForEach":
          type = inferExpressionType(stmt.iterable, env, functionTable, sourcePath);
          if (!isArrayType(type) && type !== "str") {
            createCompileError(sourcePath, stmt, "`para cada` nativo exige lista ou texto");
          }
          env[stmt.binding] = type === "str" ? "str" : arrayItemType(type);
          if (inferStatements(stmt.body, cloneMap(env), meta, functionTable, sourcePath)) {
            changed = true;
          }
          break;
        default:
          createCompileError(sourcePath, stmt, "statement nao suportado na inferencia: " + stmt.kind);
      }
    }
    return changed;
  }

  function analyzeProgram(program, snippets, inputPath) {
    var functionTable = {
      __defaults__: {
        default_param_type: snippets.types.default_param_type,
        default_return_type: snippets.types.default_return_type
      }
    };
    var index;
    for (index = 0; index < program.functions.length; index++) {
      var fn = program.functions[index];
      if (functionTable[fn.name]) {
        createCompileError(inputPath, fn, "funcao duplicada `" + fn.name + "`");
      }
      functionTable[fn.name] = {
        name: fn.name,
        ast: fn,
        paramTypes: fn.params.map(function () { return null; }),
        returnType: null
      };
    }
    for (var pass = 0; pass < 6; pass++) {
      var changed = false;
      for (index = 0; index < program.functions.length; index++) {
        var meta = functionTable[program.functions[index].name];
        var env = {};
        var paramIndex;
        for (paramIndex = 0; paramIndex < program.functions[index].params.length; paramIndex++) {
          env[program.functions[index].params[paramIndex]] =
            meta.paramTypes[paramIndex] || snippets.types.default_param_type;
        }
        if (inferStatements(program.functions[index].body, env, meta, functionTable, inputPath)) {
          changed = true;
        }
      }
      if (!changed) {
        break;
      }
    }
    for (index = 0; index < program.functions.length; index++) {
      var finalMeta = functionTable[program.functions[index].name];
      finalMeta.returnType = finalMeta.returnType || snippets.types.default_return_type;
      finalMeta.paramTypes = finalMeta.paramTypes.map(function (type) {
        return type || snippets.types.default_param_type;
      });
    }
    return functionTable;
  }

  function internString(unit, value) {
    if (Object.prototype.hasOwnProperty.call(unit.stringLabels, value)) {
      return unit.stringLabels[value];
    }
    var label = ".LC" + unit.stringList.length;
    unit.stringLabels[value] = label;
    unit.stringList.push({ label: label, value: value });
    return label;
  }

  function serializeArrayConst(items, itemType) {
    return JSON.stringify({
      itemType: itemType,
      items: items.map(function (item) {
        return {
          type: item.type,
          valueKind: item.valueKind,
          value: item.value
        };
      })
    });
  }

  function internArray(unit, items, itemType) {
    if (!unit.arrayLabels) {
      unit.arrayLabels = {};
      unit.arrayList = [];
    }
    var key = serializeArrayConst(items, itemType);
    if (Object.prototype.hasOwnProperty.call(unit.arrayLabels, key)) {
      return unit.arrayLabels[key];
    }
    var base = unit.arrayList.length;
    var itemsLabel = ".LARR_ITEMS_" + base;
    var arrayLabel = ".LARR_" + base;
    unit.arrayLabels[key] = arrayLabel;
    unit.arrayList.push({
      label: arrayLabel,
      itemsLabel: itemsLabel,
      itemType: itemType,
      items: items
    });
    return arrayLabel;
  }

  function LoweringContext(unit, inputPath, functionTable, snippets, fnName, returnType, params) {
    this.unit = unit;
    this.inputPath = inputPath;
    this.functionTable = functionTable;
    this.snippets = snippets;
    this.name = fnName;
    this.symbol = fnName === "__main__" ? "main" : "ptjs_fn_" + fnName;
    this.returnType = returnType;
    this.instructions = [];
    this.locals = {};
    this.localList = [];
    this.tempTypes = {};
    this.tempCount = 0;
    this.labelCount = 0;
    this.params = [];
    var index;
    for (index = 0; index < params.length; index++) {
      var local = this.addLocal(params[index].name, params[index].type, true);
      this.params.push(local);
    }
  }

  LoweringContext.prototype.addLocal = function (name, type, isParam) {
    var slot = this.localList.length;
    var local = {
      name: name,
      type: type,
      slot: slot,
      isParam: !!isParam
    };
    this.locals[name] = local;
    this.localList.push(local);
    return local;
  };

  LoweringContext.prototype.ensureLocal = function (name, type, node) {
    var local = this.locals[name];
    if (!local) {
      local = this.addLocal(name, type, false);
    } else if (local.type !== type) {
      createCompileError(this.inputPath, node, "variavel `" + name + "` muda de tipo no backend nativo");
    }
    return local;
  };

  LoweringContext.prototype.newTemp = function (type) {
    var temp = this.tempCount++;
    this.tempTypes[temp] = type;
    return temp;
  };

  LoweringContext.prototype.emit = function (inst) {
    this.instructions.push(inst);
    return inst;
  };

  LoweringContext.prototype.newLabel = function (prefix) {
    var value = "." + this.symbol + "_" + prefix + "_" + this.labelCount++;
    return value;
  };

  LoweringContext.prototype.lowerTruthy = function (valueTemp, valueType, node) {
    if (!(valueType === "i64" || valueType === "bool" || valueType === "null")) {
      createCompileError(this.inputPath, node, "condicoes nativas aceitam numero, booleano ou nulo");
    }
    return valueTemp;
  };

  LoweringContext.prototype.emitConstValue = function (constant) {
    var dest = this.newTemp(constant.type);
    if (constant.valueKind === "label") {
      this.emit({ op: "const_ptr", dest: dest, label: constant.value, valueType: constant.type });
    } else {
      this.emit({ op: "const_int", dest: dest, value: constant.value, valueType: constant.type });
    }
    return { temp: dest, type: constant.type };
  };

  LoweringContext.prototype.defaultValue = function (type) {
    var dest;
    if (isArrayType(type)) {
      dest = this.newTemp(type);
      this.emit({ op: "const_int", dest: dest, value: 0, valueType: type });
      return { temp: dest, type: type };
    }
    return this.emitConstValue(buildConstValue(this.unit, typeDefaultValue(type), this.inputPath));
  };

  LoweringContext.prototype.lowerExpr = function (expr) {
    var left;
    var right;
    var dest;
    var label;
    var callee;
    var args;
    var i;
    switch (expr.kind) {
      case "Number":
        return this.emitConstValue(buildConstValue(this.unit, expr, this.inputPath));
      case "Bool":
        return this.emitConstValue(buildConstValue(this.unit, expr, this.inputPath));
      case "Null":
        return this.emitConstValue(buildConstValue(this.unit, expr, this.inputPath));
      case "String":
        return this.emitConstValue(buildConstValue(this.unit, expr, this.inputPath));
      case "Array":
        return this.emitConstValue(buildConstValue(this.unit, expr, this.inputPath));
      case "Identifier":
        var local = this.locals[expr.name];
        if (!local) {
          createCompileError(this.inputPath, expr, "variavel desconhecida `" + expr.name + "`");
        }
        dest = this.newTemp(local.type);
        this.emit({ op: "load_local", dest: dest, slot: local.slot, type: local.type });
        return { temp: dest, type: local.type };
      case "Unary":
        left = this.lowerExpr(expr.expr);
        if (expr.op === "-") {
          if (left.type !== "i64") {
            createCompileError(this.inputPath, expr, "negacao nativa exige numero");
          }
          dest = this.newTemp("i64");
          this.emit({ op: "neg", dest: dest, value: left.temp });
          return { temp: dest, type: "i64" };
        }
        if (expr.op === "!") {
          if (!(left.type === "i64" || left.type === "bool" || left.type === "null")) {
            createCompileError(this.inputPath, expr, "operador `!` nativo exige numero, booleano ou nulo");
          }
          dest = this.newTemp("bool");
          this.emit({ op: "not", dest: dest, value: left.temp });
          return { temp: dest, type: "bool" };
        }
        if (expr.op === "tamanho de") {
          if (!(left.type === "str" || isArrayType(left.type))) {
            createCompileError(this.inputPath, expr, "`tamanho de` nativo suporta texto ou lista");
          }
          dest = this.newTemp("i64");
          this.emit({
            op: "call_runtime",
            dest: dest,
            symbol: left.type === "str" ? this.snippets.runtimeCalls.strlen : this.snippets.runtimeCalls.array_len,
            args: [left.temp],
            returnType: "i64"
          });
          return { temp: dest, type: "i64" };
        }
        if (expr.op === "tipo de") {
          dest = this.newTemp("str");
          label = internString(this.unit, typeDisplayName(left.type));
          this.emit({ op: "const_str", dest: dest, label: label });
          return { temp: dest, type: "str" };
        }
        if (expr.op === "identificar") {
          dest = this.newTemp("str");
          this.emit({
            op: "call_runtime",
            dest: dest,
            symbol: this.snippets.runtimeCalls.identify[runtimeTypeOf(left.type)],
            args: [left.temp],
            returnType: "str"
          });
          return { temp: dest, type: "str" };
        }
        if (expr.op === "observar") {
          dest = this.newTemp(left.type);
          this.emit({
            op: "call_runtime",
            dest: dest,
            symbol: this.snippets.runtimeCalls.observe[runtimeTypeOf(left.type)],
            args: [left.temp],
            returnType: left.type
          });
          return { temp: dest, type: left.type };
        }
        createCompileError(this.inputPath, expr, "unario nao suportado `" + expr.op + "`");
        break;
      case "Binary":
        left = this.lowerExpr(expr.left);
        right = this.lowerExpr(expr.right);
        if (expr.op === "&&" || expr.op === "||") {
          if (!isIntLikeType(left.type) || !isIntLikeType(right.type)) {
            createCompileError(this.inputPath, expr, "operacao booleana nativa exige numero, booleano ou nulo");
          }
          var boolLeft = this.newTemp("bool");
          var boolRight = this.newTemp("bool");
          this.emit({ op: "cmp", dest: boolLeft, cmp: "!=", left: left.temp, right: 0, rightKind: "imm" });
          this.emit({ op: "cmp", dest: boolRight, cmp: "!=", left: right.temp, right: 0, rightKind: "imm" });
          dest = this.newTemp("bool");
          this.emit({ op: "bin", dest: dest, bin: expr.op, left: boolLeft, right: boolRight });
          return { temp: dest, type: "bool" };
        }
        if (expr.op === "==" || expr.op === "!=" || expr.op === "<" || expr.op === "<=" || expr.op === ">" || expr.op === ">=") {
          if ((expr.op === "==" || expr.op === "!=") && canCompareTypes(left.type, right.type)) {
            dest = this.newTemp("bool");
            this.emit({ op: "cmp", dest: dest, cmp: expr.op, left: left.temp, right: right.temp, rightKind: "temp" });
            return { temp: dest, type: "bool" };
          }
          if (left.type !== "i64" || right.type !== "i64") {
            createCompileError(this.inputPath, expr, "comparacoes nativas hoje suportam numeros e igualdade escalar");
          }
          dest = this.newTemp("bool");
          this.emit({ op: "cmp", dest: dest, cmp: expr.op, left: left.temp, right: right.temp, rightKind: "temp" });
          return { temp: dest, type: "bool" };
        }
        if (left.type !== "i64" || right.type !== "i64") {
          createCompileError(this.inputPath, expr, "aritmetica nativa suporta apenas numeros");
        }
        dest = this.newTemp("i64");
        this.emit({ op: "bin", dest: dest, bin: expr.op, left: left.temp, right: right.temp });
        return { temp: dest, type: "i64" };
      case "Call":
        if (expr.callee.kind !== "Identifier") {
          createCompileError(this.inputPath, expr, "somente chamadas diretas por nome sao suportadas");
        }
        callee = this.functionTable[expr.callee.name];
        if (!callee) {
          createCompileError(this.inputPath, expr, "funcao desconhecida `" + expr.callee.name + "`");
        }
        if (expr.args.length !== callee.paramTypes.length) {
          createCompileError(
            this.inputPath,
            expr,
            "quantidade invalida de argumentos em `" + expr.callee.name + "`"
          );
        }
        args = [];
        for (i = 0; i < expr.args.length; i++) {
          var argInfo = this.lowerExpr(expr.args[i]);
          if (callee.paramTypes[i] && callee.paramTypes[i] !== argInfo.type) {
            createCompileError(this.inputPath, expr.args[i], "tipo de argumento invalido em `" + expr.callee.name + "`");
          }
          args.push(argInfo.temp);
        }
        dest = this.newTemp(callee.returnType);
        this.emit({
          op: "call",
          dest: dest,
          symbol: "ptjs_fn_" + expr.callee.name,
          args: args,
          returnType: callee.returnType
        });
        return { temp: dest, type: callee.returnType };
      default:
        createCompileError(this.inputPath, expr, "expressao nao suportada `" + expr.kind + "`");
    }
  };

  LoweringContext.prototype.lowerStatement = function (stmt) {
    var value;
    var local;
    var test;
    var thenLabel;
    var elseLabel;
    var endLabel;
    switch (stmt.kind) {
      case "Define":
        value = this.lowerExpr(stmt.expr);
        local = this.ensureLocal(stmt.name, value.type, stmt);
        this.emit({ op: "store_local", slot: local.slot, type: local.type, value: value.temp });
        break;
      case "Assign":
        local = this.locals[stmt.name];
        if (!local) {
          createCompileError(this.inputPath, stmt, "variavel desconhecida `" + stmt.name + "`");
        }
        value = this.lowerExpr(stmt.expr);
        if (local.type !== value.type) {
          createCompileError(this.inputPath, stmt, "atribuicao invalida para `" + stmt.name + "`");
        }
        this.emit({ op: "store_local", slot: local.slot, type: local.type, value: value.temp });
        break;
      case "Show":
        value = this.lowerExpr(stmt.expr);
        this.emit({ op: "print", value: value.temp, valueType: runtimeTypeOf(value.type) });
        break;
      case "ExprStmt":
        this.lowerExpr(stmt.expr);
        break;
      case "Return":
        value = stmt.expr ? this.lowerExpr(stmt.expr) : this.defaultValue(this.returnType);
        if (value.type !== this.returnType) {
          createCompileError(this.inputPath, stmt, "retorno nao bate com o tipo de `" + this.name + "`");
        }
        this.emit({ op: "ret", value: value.temp, valueType: value.type });
        break;
      case "If":
        test = this.lowerExpr(stmt.test);
        this.lowerTruthy(test.temp, test.type, stmt.test);
        thenLabel = this.newLabel("then");
        elseLabel = this.newLabel("else");
        endLabel = this.newLabel("ifend");
        this.emit({ op: "br", cond: test.temp, thenLabel: thenLabel, elseLabel: elseLabel });
        this.emit({ op: "label", name: thenLabel });
        this.lowerStatementList(stmt.thenBody);
        this.emit({ op: "jmp", label: endLabel });
        this.emit({ op: "label", name: elseLabel });
        this.lowerStatementList(stmt.elseBody);
        this.emit({ op: "label", name: endLabel });
        break;
      case "While":
        var loopLabel = this.newLabel("loop");
        var bodyLabel = this.newLabel("body");
        var exitLabel = this.newLabel("loopend");
        this.emit({ op: "label", name: loopLabel });
        test = this.lowerExpr(stmt.test);
        this.lowerTruthy(test.temp, test.type, stmt.test);
        this.emit({ op: "br", cond: test.temp, thenLabel: bodyLabel, elseLabel: exitLabel });
        this.emit({ op: "label", name: bodyLabel });
        this.lowerStatementList(stmt.body);
        this.emit({ op: "jmp", label: loopLabel });
        this.emit({ op: "label", name: exitLabel });
        break;
      case "ForEach":
        var iterable = this.lowerExpr(stmt.iterable);
        var iterableLocal = this.addLocal("__each_" + this.labelCount, iterable.type, false);
        this.emit({ op: "store_local", slot: iterableLocal.slot, type: iterable.type, value: iterable.temp });
        var indexLocal = this.addLocal("__iter_" + this.labelCount, "i64", false);
        var indexZero = this.defaultValue("i64");
        this.emit({ op: "store_local", slot: indexLocal.slot, type: "i64", value: indexZero.temp });
        var eachLoopLabel = this.newLabel("foreach");
        var eachBodyLabel = this.newLabel("foreach_body");
        var eachExitLabel = this.newLabel("foreach_end");
        var indexTemp;
        var limitTemp;
        var itemTemp;
        var itemLocal;
        var iterableTemp;
        this.emit({ op: "label", name: eachLoopLabel });
        indexTemp = this.newTemp("i64");
        this.emit({ op: "load_local", dest: indexTemp, slot: indexLocal.slot, type: "i64" });
        iterableTemp = this.newTemp(iterable.type);
        this.emit({ op: "load_local", dest: iterableTemp, slot: iterableLocal.slot, type: iterable.type });
        limitTemp = this.newTemp("i64");
        this.emit({
          op: "call_runtime",
          dest: limitTemp,
          symbol: iterable.type === "str" ? this.snippets.runtimeCalls.strlen : this.snippets.runtimeCalls.array_len,
          args: [iterableTemp],
          returnType: "i64"
        });
        var condTemp = this.newTemp("bool");
        this.emit({ op: "cmp", dest: condTemp, cmp: "<", left: indexTemp, right: limitTemp, rightKind: "temp" });
        this.emit({ op: "br", cond: condTemp, thenLabel: eachBodyLabel, elseLabel: eachExitLabel });
        this.emit({ op: "label", name: eachBodyLabel });
        itemLocal = this.ensureLocal(
          stmt.binding,
          iterable.type === "str" ? "str" : arrayItemType(iterable.type),
          stmt
        );
        itemTemp = this.newTemp(itemLocal.type);
        this.emit({
          op: "call_runtime",
          dest: itemTemp,
          symbol: iterable.type === "str" ?
            this.snippets.runtimeCalls.string_char_at :
            (arrayUsesPointerItems(itemLocal.type) ? this.snippets.runtimeCalls.array_get_ptr : this.snippets.runtimeCalls.array_get_i64),
          args: [iterableTemp, indexTemp],
          returnType: itemLocal.type
        });
        this.emit({ op: "store_local", slot: itemLocal.slot, type: itemLocal.type, value: itemTemp });
        this.lowerStatementList(stmt.body);
        var incValue = this.newTemp("i64");
        this.emit({ op: "const_int", dest: incValue, value: 1, valueType: "i64" });
        var nextIndex = this.newTemp("i64");
        this.emit({ op: "bin", dest: nextIndex, bin: "+", left: indexTemp, right: incValue });
        this.emit({ op: "store_local", slot: indexLocal.slot, type: "i64", value: nextIndex });
        this.emit({ op: "jmp", label: eachLoopLabel });
        this.emit({ op: "label", name: eachExitLabel });
        break;
      default:
        createCompileError(this.inputPath, stmt, "statement nao suportado `" + stmt.kind + "`");
    }
  };

  LoweringContext.prototype.lowerStatementList = function (body) {
    for (var index = 0; index < body.length; index++) {
      this.lowerStatement(body[index]);
    }
  };

  LoweringContext.prototype.finish = function () {
    if (this.instructions.length === 0 || this.instructions[this.instructions.length - 1].op !== "ret") {
      var fallback = this.defaultValue(this.returnType);
      this.emit({ op: "ret", value: fallback.temp, valueType: fallback.type });
    }
    return {
      name: this.name,
      symbol: this.symbol,
      returnType: this.returnType,
      params: this.params,
      locals: this.localList,
      instructions: this.instructions,
      tempTypes: this.tempTypes
    };
  };

  function lowerProgram(program, functionTable, snippets, inputPath) {
    var unit = {
      functions: [],
      stringLabels: {},
      stringList: [],
      arrayLabels: {},
      arrayList: []
    };
    var index;
    for (index = 0; index < program.functions.length; index++) {
      var fn = program.functions[index];
      var meta = functionTable[fn.name];
      if (fn.params.length > snippets.callconv.arg_regs.length) {
        createCompileError(inputPath, fn, "backend nativo suporta ate 6 parametros por funcao");
      }
      var params = [];
      for (var i = 0; i < fn.params.length; i++) {
        params.push({ name: fn.params[i], type: meta.paramTypes[i] });
      }
      var ctx = new LoweringContext(unit, inputPath, functionTable, snippets, fn.name, meta.returnType, params);
      ctx.lowerStatementList(fn.body);
      unit.functions.push(ctx.finish());
    }
    var mainCtx = new LoweringContext(unit, inputPath, functionTable, snippets, "__main__", "i64", []);
    mainCtx.lowerStatementList(program.body);
    unit.functions.push(mainCtx.finish());
    return unit;
  }

  function tempUses(inst) {
    switch (inst.op) {
      case "store_local":
        return [inst.value];
      case "neg":
      case "not":
        return [inst.value];
      case "bin":
        return [inst.left, inst.right];
      case "cmp":
        return inst.rightKind === "imm" ? [inst.left] : [inst.left, inst.right];
      case "call":
      case "call_runtime":
        return inst.args.slice();
      case "print":
        return [inst.value];
      case "br":
        return [inst.cond];
      case "ret":
        return [inst.value];
      default:
        return [];
    }
  }

  function tempDefs(inst) {
    switch (inst.op) {
      case "const_int":
      case "const_str":
      case "const_ptr":
      case "load_local":
      case "neg":
      case "not":
      case "bin":
      case "cmp":
      case "call":
      case "call_runtime":
        return [inst.dest];
      default:
        return [];
    }
  }

  function allocateTemps(fn, snippets) {
    var starts = {};
    var ends = {};
    var idx;
    for (idx = 0; idx < fn.instructions.length; idx++) {
      var defs = tempDefs(fn.instructions[idx]);
      var uses = tempUses(fn.instructions[idx]);
      var i;
      for (i = 0; i < defs.length; i++) {
        if (starts[defs[i]] === undefined) {
          starts[defs[i]] = idx;
        }
        if (ends[defs[i]] === undefined) {
          ends[defs[i]] = idx;
        }
      }
      for (i = 0; i < uses.length; i++) {
        if (starts[uses[i]] === undefined) {
          starts[uses[i]] = idx;
        }
        ends[uses[i]] = idx;
      }
    }
    var intervals = [];
    var tempId;
    for (tempId in fn.tempTypes) {
      if (Object.prototype.hasOwnProperty.call(fn.tempTypes, tempId)) {
        intervals.push({
          temp: Number(tempId),
          start: starts[tempId],
          end: ends[tempId]
        });
      }
    }
    intervals.sort(function (a, b) {
      if (a.start !== b.start) {
        return a.start - b.start;
      }
      return a.end - b.end;
    });

    var freeRegs = snippets.registers.allocatable.slice();
    var active = [];
    var locations = {};
    var spillCount = 0;

    function sortActive() {
      active.sort(function (a, b) {
        return a.end - b.end;
      });
    }

    function expireOld(current) {
      sortActive();
      while (active.length && active[0].end < current.start) {
        freeRegs.push(active[0].reg);
        active.shift();
      }
    }

    function allocateSpill() {
      var slot = spillCount;
      spillCount += 1;
      return slot;
    }

    for (idx = 0; idx < intervals.length; idx++) {
      var current = intervals[idx];
      expireOld(current);
      if (freeRegs.length) {
        var reg = freeRegs.shift();
        locations[current.temp] = { kind: "reg", name: reg };
        active.push({
          temp: current.temp,
          reg: reg,
          end: current.end
        });
        sortActive();
      } else {
        sortActive();
        var victim = active[active.length - 1];
        if (victim && victim.end > current.end) {
          locations[current.temp] = { kind: "reg", name: victim.reg };
          locations[victim.temp] = { kind: "spill", slot: allocateSpill() };
          active[active.length - 1] = {
            temp: current.temp,
            reg: victim.reg,
            end: current.end
          };
          sortActive();
        } else {
          locations[current.temp] = { kind: "spill", slot: allocateSpill() };
        }
      }
    }

    var usedRegs = [];
    for (tempId in locations) {
      if (Object.prototype.hasOwnProperty.call(locations, tempId) && locations[tempId].kind === "reg") {
        if (usedRegs.indexOf(locations[tempId].name) < 0) {
          usedRegs.push(locations[tempId].name);
        }
      }
    }
    usedRegs.sort(function (a, b) {
      return snippets.registers.callee_saved.indexOf(a) - snippets.registers.callee_saved.indexOf(b);
    });

    return {
      locations: locations,
      spillCount: spillCount,
      usedRegs: usedRegs
    };
  }

  function replaceTemplate(template, values) {
    return template.replace(/\{\{([a-z_]+)\}\}/g, function (_, key) {
      return values[key] || "";
    });
  }

  function escapeAsmString(value) {
    return String(value)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, "\\\"")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
  }

  function formatMem(offset) {
    return offset >= 0 ? "[rbp-" + offset + "]" : "[rbp+" + (-offset) + "]";
  }

  function frameFor(fn, alloc, snippets) {
    var saved = alloc.usedRegs.slice();
    var localCount = fn.locals.length;
    var rawBytes = (localCount + alloc.spillCount) * 8;
    var currentMod = (saved.length % 2 === 0) ? 0 : 8;
    var frameBytes = rawBytes;
    while ((frameBytes % 16) !== currentMod) {
      frameBytes += 8;
    }
    return {
      localCount: localCount,
      spillCount: alloc.spillCount,
      frameBytes: frameBytes,
      savedRegs: saved,
      argRegs: snippets.callconv.arg_regs
    };
  }

  function localOffset(slot) {
    return (slot + 1) * 8;
  }

  function spillOffset(fn, spillSlot) {
    return (fn.locals.length + spillSlot + 1) * 8;
  }

  function loadTempInto(lines, fn, alloc, temp, targetReg) {
    var loc = alloc.locations[temp];
    if (!loc) {
      fatal("temp sem localizacao: " + temp);
    }
    if (loc.kind === "reg") {
      if (loc.name !== targetReg) {
        lines.push("  mov " + targetReg + ", " + loc.name);
      }
      return targetReg;
    }
    lines.push("  mov " + targetReg + ", QWORD PTR " + formatMem(spillOffset(fn, loc.slot)));
    return targetReg;
  }

  function storeTempFrom(lines, fn, alloc, temp, sourceReg) {
    var loc = alloc.locations[temp];
    if (!loc) {
      fatal("temp sem localizacao: " + temp);
    }
    if (loc.kind === "reg") {
      if (loc.name !== sourceReg) {
        lines.push("  mov " + loc.name + ", " + sourceReg);
      }
    } else {
      lines.push("  mov QWORD PTR " + formatMem(spillOffset(fn, loc.slot)) + ", " + sourceReg);
    }
  }

  function emitBooleanize(lines, reg, scratch) {
    lines.push("  cmp " + reg + ", 0");
    lines.push("  setne al");
    lines.push("  movzx " + scratch + ", al");
    if (scratch !== reg) {
      lines.push("  mov " + reg + ", " + scratch);
    }
  }

  function emitInstruction(lines, fn, alloc, snippets, inst, epilogueLabel) {
    var work;
    var other;
    var destLoc;
    var i;
    switch (inst.op) {
      case "const_int":
        destLoc = alloc.locations[inst.dest];
        if (destLoc.kind === "reg") {
          lines.push("  mov " + destLoc.name + ", " + inst.value);
        } else {
          lines.push("  mov rax, " + inst.value);
          lines.push("  mov QWORD PTR " + formatMem(spillOffset(fn, destLoc.slot)) + ", rax");
        }
        break;
      case "const_str":
      case "const_ptr":
        destLoc = alloc.locations[inst.dest];
        if (destLoc.kind === "reg") {
          lines.push("  lea " + destLoc.name + ", [rip+" + inst.label + "]");
        } else {
          lines.push("  lea rax, [rip+" + inst.label + "]");
          lines.push("  mov QWORD PTR " + formatMem(spillOffset(fn, destLoc.slot)) + ", rax");
        }
        break;
      case "load_local":
        destLoc = alloc.locations[inst.dest];
        if (destLoc.kind === "reg") {
          lines.push("  mov " + destLoc.name + ", QWORD PTR " + formatMem(localOffset(inst.slot)));
        } else {
          lines.push("  mov rax, QWORD PTR " + formatMem(localOffset(inst.slot)));
          lines.push("  mov QWORD PTR " + formatMem(spillOffset(fn, destLoc.slot)) + ", rax");
        }
        break;
      case "store_local":
        work = loadTempInto(lines, fn, alloc, inst.value, "rax");
        lines.push("  mov QWORD PTR " + formatMem(localOffset(inst.slot)) + ", " + work);
        break;
      case "neg":
        work = loadTempInto(lines, fn, alloc, inst.value, "rax");
        lines.push("  neg " + work);
        storeTempFrom(lines, fn, alloc, inst.dest, work);
        break;
      case "not":
        work = loadTempInto(lines, fn, alloc, inst.value, "rax");
        lines.push("  cmp " + work + ", 0");
        lines.push("  sete al");
        lines.push("  movzx rax, al");
        storeTempFrom(lines, fn, alloc, inst.dest, "rax");
        break;
      case "bin":
        if (inst.bin === "/" || inst.bin === "%") {
          loadTempInto(lines, fn, alloc, inst.left, "rax");
          lines.push("  cqo");
          loadTempInto(lines, fn, alloc, inst.right, "rcx");
          lines.push("  idiv rcx");
          storeTempFrom(lines, fn, alloc, inst.dest, inst.bin === "/" ? "rax" : "rdx");
          break;
        }
        work = loadTempInto(lines, fn, alloc, inst.left, "rax");
        if (inst.bin === "&&" || inst.bin === "||") {
          emitBooleanize(lines, work, "rax");
          loadTempInto(lines, fn, alloc, inst.right, "rcx");
          emitBooleanize(lines, "rcx", "rcx");
          lines.push("  " + snippets.binops[inst.bin] + " " + work + ", rcx");
          storeTempFrom(lines, fn, alloc, inst.dest, work);
          break;
        }
        other = loadTempInto(lines, fn, alloc, inst.right, "rcx");
        lines.push("  " + snippets.binops[inst.bin] + " " + work + ", " + other);
        storeTempFrom(lines, fn, alloc, inst.dest, work);
        break;
      case "cmp":
        work = loadTempInto(lines, fn, alloc, inst.left, "rax");
        if (inst.rightKind === "imm") {
          lines.push("  cmp " + work + ", " + inst.right);
        } else {
          other = loadTempInto(lines, fn, alloc, inst.right, "rcx");
          lines.push("  cmp " + work + ", " + other);
        }
        lines.push("  " + snippets.cmps[inst.cmp] + " al");
        lines.push("  movzx rax, al");
        storeTempFrom(lines, fn, alloc, inst.dest, "rax");
        break;
      case "call":
      case "call_runtime":
        if (inst.args.length > snippets.callconv.arg_regs.length) {
          fatal("chamada excede limite de argumentos nativos");
        }
        for (i = 0; i < inst.args.length; i++) {
          loadTempInto(lines, fn, alloc, inst.args[i], snippets.callconv.arg_regs[i]);
        }
        lines.push("  call " + inst.symbol);
        storeTempFrom(lines, fn, alloc, inst.dest, "rax");
        break;
      case "print":
        loadTempInto(lines, fn, alloc, inst.value, snippets.callconv.arg_regs[0]);
        lines.push("  call " + snippets.runtimeCalls.print[inst.valueType]);
        break;
      case "label":
        lines.push(inst.name + ":");
        break;
      case "jmp":
        lines.push("  jmp " + inst.label);
        break;
      case "br":
        work = loadTempInto(lines, fn, alloc, inst.cond, "rax");
        lines.push("  cmp " + work + ", 0");
        lines.push("  jne " + inst.thenLabel);
        lines.push("  jmp " + inst.elseLabel);
        break;
      case "ret":
        loadTempInto(lines, fn, alloc, inst.value, "rax");
        lines.push("  jmp " + epilogueLabel);
        break;
      default:
        fatal("opcode nao suportado na emissao: " + inst.op);
    }
  }

  function applyPeephole(assembly, snippets) {
    var lines = assembly.split("\n");
    var changed = true;
    var iteration = 0;
    while (changed && iteration < 4) {
      changed = false;
      iteration += 1;
      lines = lines.map(function (line) {
        var next = line;
        for (var i = 0; i < snippets.peephole.length; i++) {
          var rule = snippets.peephole[i];
          var regex = new RegExp(rule.pattern);
          if (regex.test(next)) {
            next = next.replace(regex, rule.replace);
          }
        }
        if (next !== line) {
          changed = true;
        }
        return next;
      });
    }
    return lines.filter(function (line, index, array) {
      if (line === "" && array[index - 1] === "") {
        return false;
      }
      return true;
    }).join("\n").replace(/\n*$/, "\n");
  }

  function renderAssembly(unit, snippets) {
    var lines = [];
    var i;
    if (unit.stringList.length) {
      lines.push(snippets.asmFragments.rodata.replace(/\n$/, ""));
      for (i = 0; i < unit.stringList.length; i++) {
        lines.push(unit.stringList[i].label + ":");
        lines.push("  .asciz \"" + escapeAsmString(unit.stringList[i].value) + "\"");
      }
      lines.push("");
    }
    if (unit.arrayList && unit.arrayList.length) {
      lines.push(".section .data.rel.ro");
      for (i = 0; i < unit.arrayList.length; i++) {
        lines.push(unit.arrayList[i].itemsLabel + ":");
        for (var arrItem = 0; arrItem < unit.arrayList[i].items.length; arrItem++) {
          var item = unit.arrayList[i].items[arrItem];
          if (item.valueKind === "label") {
            lines.push("  .quad " + item.value);
          } else {
            lines.push("  .quad " + item.value);
          }
        }
        lines.push(unit.arrayList[i].label + ":");
        lines.push("  .quad " + unit.arrayList[i].items.length);
        lines.push("  .quad " + arrayTagFromType(unit.arrayList[i].itemType));
        lines.push("  .quad " + unit.arrayList[i].itemsLabel);
      }
      lines.push("");
    }
    lines.push(snippets.asmFragments.header.replace(/\n$/, ""));

    for (i = 0; i < unit.functions.length; i++) {
      var fn = unit.functions[i];
      var alloc = allocateTemps(fn, snippets);
      var frame = frameFor(fn, alloc, snippets);
      var functionLines = [];
      var labelText = replaceTemplate(snippets.asmFragments.functionLabel, {
        symbol: fn.symbol
      }).replace(/\n$/, "");
      functionLines.push(labelText);
      var saveLines = [];
      var restoreLines = [];
      for (var r = 0; r < frame.savedRegs.length; r++) {
        saveLines.push("push " + frame.savedRegs[r]);
      }
      for (r = frame.savedRegs.length - 1; r >= 0; r--) {
        restoreLines.push("pop " + frame.savedRegs[r]);
      }
      var prologueText = replaceTemplate(snippets.asmFragments.prologue, {
        callee_saves: saveLines.length ? saveLines.join("\n") : "",
        frame_alloc: frame.frameBytes ? "sub rsp, " + frame.frameBytes : ""
      }).replace(/\n+$/, "");
      functionLines.push(prologueText);
      for (var p = 0; p < fn.params.length; p++) {
        functionLines.push("  mov QWORD PTR " + formatMem(localOffset(fn.params[p].slot)) + ", " + frame.argRegs[p]);
      }
      var epilogueLabel = "." + fn.symbol + "_ret";
      for (var instIndex = 0; instIndex < fn.instructions.length; instIndex++) {
        emitInstruction(functionLines, fn, alloc, snippets, fn.instructions[instIndex], epilogueLabel);
      }
      functionLines.push(epilogueLabel + ":");
      var epilogueText = replaceTemplate(snippets.asmFragments.epilogue, {
        frame_free: frame.frameBytes ? "add rsp, " + frame.frameBytes : "",
        callee_restores: restoreLines.length ? restoreLines.join("\n") : ""
      }).replace(/\n+$/, "");
      functionLines.push(epilogueText);
      lines.push(functionLines.join("\n"));
      lines.push("");
    }

    lines.push(".section .note.GNU-stack,\"\",@progbits");
    return applyPeephole(lines.join("\n"), snippets);
  }

  function renderIR(unit) {
    return JSON.stringify(unit, null, 2) + "\n";
  }

  function compileToUnit(source, inputPath, snippets) {
    var tokens = tokenize(source, snippets);
    var parser = new Parser(tokens);
    var program = parser.parseProgram();
    var functionTable = analyzeProgram(program, snippets, inputPath);
    return lowerProgram(program, functionTable, snippets, inputPath);
  }

  function tempAsmPath() {
    return "/tmp/gatocore_native_" + Date.now() + "_" + Math.floor(Math.random() * 1000000) + ".s";
  }

  function buildNativeBinary(assembly, outputPath, options, snippets) {
    var asmPath = tempAsmPath();
    writeText(asmPath, assembly);
    var runtimePath = joinPath(options.root, "runtime/native_runtime.c");
    var cmd = [snippets.toolchain.cc]
      .concat(snippets.toolchain.cflags)
      .concat([runtimePath, asmPath, "-o", outputPath]);
    var status = os.exec(cmd, { block: true });
    if (status !== 0) {
      if (!options.keepAsm) {
        try {
          os.remove(asmPath);
        } catch (err) {
        }
      }
      fatal("falha ao compilar binario nativo");
    }
    if (!options.keepAsm) {
      try {
        os.remove(asmPath);
      } catch (err2) {
      }
    }
  }

  function main() {
    var options = parseArgs(global.scriptArgs || []);
    var snippets = loadSnippets(options.root);
    var source = readText(options.input);
    var unit = compileToUnit(source, options.input, snippets);

    if (options.mode === "ir") {
      var irText = renderIR(unit);
      if (options.output && !options.stdout) {
        writeText(options.output, irText);
      } else {
        std.out.puts(irText);
      }
      return;
    }

    if (options.mode === "asm") {
      var asmText = renderAssembly(unit, snippets);
      if (options.output && !options.stdout) {
        writeText(options.output, asmText);
      } else {
        std.out.puts(asmText);
      }
      return;
    }

    if (options.mode === "native-build") {
      if (!options.output) {
        fatal("--output obrigatorio em native-build");
      }
      buildNativeBinary(renderAssembly(unit, snippets), options.output, options, snippets);
      return;
    }

    fatal("modo nao suportado: " + options.mode);
  }

  main();
})(globalThis);
