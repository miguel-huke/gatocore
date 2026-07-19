(function (global) {
  "use strict";

  if (global.__gatocore_stdlib_loaded) {
    return;
  }

  var KNOWN_CLASSES = Object.freeze({
    verbo: true,
    recurso: true,
    tipo: true,
    evento: true,
    modulo: true,
    politica: true,
  });

  function nowMs() {
    try {
      if (typeof agora_ms === "function") {
        return agora_ms();
      }
    } catch (err) {
    }
    return Date.now();
  }

  function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  function isPlainObject(value) {
    if (!value || typeof value !== "object") {
      return false;
    }
    var proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  }

  function isTypedArray(value) {
    return value && typeof value === "object" && ArrayBuffer.isView(value);
  }

  function trim(value) {
    return String(value == null ? "" : value).trim();
  }

  function withoutTicks(value) {
    var text = trim(value);
    if (text.length >= 2 && text[0] === "`" && text[text.length - 1] === "`") {
      return text.slice(1, -1);
    }
    return text;
  }

  function shallowClone(value) {
    if (Array.isArray(value)) {
      return value.slice();
    }
    if (value instanceof ArrayBuffer) {
      return value.slice(0);
    }
    if (isTypedArray(value)) {
      return new value.constructor(value);
    }
    if (isPlainObject(value)) {
      return Object.assign({}, value);
    }
    return value;
  }

  function toArray(args) {
    return Array.prototype.slice.call(args);
  }

  function stableObject(base, extra) {
    var result = Object.assign({}, base);
    if (extra && typeof extra === "object") {
      Object.keys(extra).forEach(function (key) {
        result[key] = extra[key];
      });
    }
    return result;
  }

  function makeResult(ok, value, error, meta) {
    var out = {
      tipo_recurso: "resultado",
      ok: !!ok,
      valor: value === undefined ? null : value,
    };
    if (error != null) {
      out.erro = error;
    }
    if (meta !== undefined) {
      out.meta = meta;
    }
    return out;
  }

  function okResult(value, meta) {
    return makeResult(true, value, null, meta);
  }

  function errorResult(code, message, meta) {
    return makeResult(false, null, {
      codigo: code,
      mensagem: message,
    }, meta);
  }

  function normalizeMaybeObject(args) {
    if (args.length === 1 && isPlainObject(args[0])) {
      return Object.assign({}, args[0]);
    }
    if (args.length === 1) {
      return { valor: shallowClone(args[0]) };
    }
    return { argumentos: args.map(shallowClone) };
  }

  function typedRecord(entry, args, extra) {
    var out = {
      tipo_recurso: entry.termo,
      termo: entry.termo,
      classe: entry.classe,
      camada: entry.camada,
      uso_tecnico: entry.uso_tecnico,
      criado_em_ms: nowMs(),
    };
    Object.assign(out, normalizeMaybeObject(args));
    if (extra) {
      Object.assign(out, extra);
    }
    return out;
  }

  function makeEvent(name, args) {
    var data = {};
    if (args.length === 1 && isPlainObject(args[0])) {
      data = Object.assign({}, args[0]);
    } else if (args.length === 1) {
      data = { valor: shallowClone(args[0]) };
    } else if (args.length > 1) {
      data = { argumentos: args.map(shallowClone) };
    }
    return {
      tipo_recurso: "evento",
      nome: name,
      dados: data,
      emitido_em_ms: nowMs(),
    };
  }

  function makePolicy(name, args) {
    return {
      tipo_recurso: "politica",
      nome: name,
      ativo: args.length === 0 ? true : !!args[0],
      opcoes: args.length > 1 ? args.slice(1) : [],
      criado_em_ms: nowMs(),
    };
  }

  function utf8ishBytes(text) {
    var chars = Array.from(String(text));
    var out = [];
    var i;
    for (i = 0; i < chars.length; i++) {
      out.push(chars[i].codePointAt(0) & 0xff);
    }
    return new Uint8Array(out);
  }

  function toBytes(value) {
    if (value instanceof ArrayBuffer) {
      return new Uint8Array(value);
    }
    if (isTypedArray(value)) {
      return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    }
    if (Array.isArray(value)) {
      return new Uint8Array(value);
    }
    if (typeof value === "string") {
      return utf8ishBytes(value);
    }
    if (value && typeof value === "object" && hasOwn(value, "dados")) {
      return toBytes(value.dados);
    }
    return new Uint8Array(0);
  }

  function fnv1aHex(bytes) {
    var hash = 0x811c9dc5;
    var i;
    for (i = 0; i < bytes.length; i++) {
      hash ^= bytes[i];
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return ("00000000" + hash.toString(16)).slice(-8);
  }

  function flattenNumbers(value) {
    if (!Array.isArray(value)) {
      if (typeof value === "number") {
        return [value];
      }
      return [];
    }
    return value.reduce(function (acc, item) {
      return acc.concat(flattenNumbers(item));
    }, []);
  }

  function inferShape(value) {
    if (!Array.isArray(value)) {
      return [];
    }
    var shape = [];
    var current = value;
    while (Array.isArray(current)) {
      shape.push(current.length);
      current = current.length > 0 ? current[0] : [];
    }
    return shape;
  }

  function vectorLength(vec) {
    return Math.sqrt(vec.reduce(function (acc, item) {
      return acc + item * item;
    }, 0));
  }

  function normalizeVector(vec) {
    var magnitude = vectorLength(vec);
    if (!magnitude) {
      return vec.map(function () { return 0; });
    }
    return vec.map(function (item) { return item / magnitude; });
  }

  function cosineSimilarity(a, b) {
    var len = Math.max(a.length, b.length);
    var dot = 0;
    var aa = 0;
    var bb = 0;
    var i;
    for (i = 0; i < len; i++) {
      var av = a[i] || 0;
      var bv = b[i] || 0;
      dot += av * bv;
      aa += av * av;
      bb += bv * bv;
    }
    if (!aa || !bb) {
      return 0;
    }
    return dot / (Math.sqrt(aa) * Math.sqrt(bb));
  }

  function intOr(value, fallback) {
    var n = Number(value);
    if (!isFinite(n)) {
      return fallback;
    }
    n = Math.floor(n);
    return n < 0 ? 0 : n;
  }

  function typedArraySpec(type) {
    switch (String(type || "f64").toLowerCase()) {
      case "u8":
      case "uint8":
        return { nome: "u8", ctor: Uint8Array, cast: function (value) { return Number(value) & 0xff; } };
      case "u16":
      case "uint16":
        return { nome: "u16", ctor: Uint16Array, cast: function (value) { return Number(value) & 0xffff; } };
      case "u32":
      case "uint32":
        return { nome: "u32", ctor: Uint32Array, cast: function (value) { return Number(value) >>> 0; } };
      case "i8":
      case "int8":
        return { nome: "i8", ctor: Int8Array, cast: function (value) { return Number(value) | 0; } };
      case "i16":
      case "int16":
        return { nome: "i16", ctor: Int16Array, cast: function (value) { return Number(value) | 0; } };
      case "i32":
      case "int32":
        return { nome: "i32", ctor: Int32Array, cast: function (value) { return Number(value) | 0; } };
      case "f32":
      case "float32":
        return { nome: "f32", ctor: Float32Array, cast: function (value) { return Number(value) || 0; } };
      case "f64":
      case "float64":
      default:
        return { nome: "f64", ctor: Float64Array, cast: function (value) { return Number(value) || 0; } };
    }
  }

  function typedArrayFrom(type, valueOrLength) {
    var spec = typedArraySpec(type);
    var source;
    var out;
    var i;
    if (typeof valueOrLength === "number") {
      return new spec.ctor(intOr(valueOrLength, 0));
    }
    if (valueOrLength instanceof ArrayBuffer) {
      source = new Uint8Array(valueOrLength);
    } else if (isTypedArray(valueOrLength)) {
      source = valueOrLength;
    } else if (Array.isArray(valueOrLength)) {
      source = valueOrLength;
    } else {
      source = [];
    }
    out = new spec.ctor(source.length);
    for (i = 0; i < source.length; i++) {
      out[i] = spec.cast(source[i]);
    }
    return out;
  }

  function typedArrayToList(view) {
    return Array.prototype.slice.call(view, 0);
  }

  function simpleEmbeddingCompact(value, size) {
    var dims = intOr(size, 16) || 16;
    return Float32Array.from(simpleEmbedding(value, dims));
  }

  function cosineSimilarityPackedRow(matrix, offset, query, dims) {
    var dot = 0;
    var aa = 0;
    var bb = 0;
    var i;
    for (i = 0; i < dims; i++) {
      var av = matrix[offset + i] || 0;
      var bv = query[i] || 0;
      dot += av * bv;
      aa += av * av;
      bb += bv * bv;
    }
    if (!aa || !bb) {
      return 0;
    }
    return dot / (Math.sqrt(aa) * Math.sqrt(bb));
  }

  function buildCompactVector(type, backing) {
    var spec = typedArraySpec(type);
    return {
      tipo_recurso: "vetor_compacto",
      tipo_dado: spec.nome,
      dados: backing,
      buffer: backing.buffer,
      tamanho: backing.length,
      capacidade: backing.length,
      obter: function (index) {
        return backing[intOr(index, 0)] || 0;
      },
      definir: function (index, value) {
        backing[intOr(index, 0)] = spec.cast(value);
        return this;
      },
      preencher: function (value) {
        backing.fill(spec.cast(value));
        return this;
      },
      fatiar: function (start, end) {
        return buildCompactVector(spec.nome, backing.slice(intOr(start, 0), end == null ? backing.length : intOr(end, backing.length)));
      },
      como_lista: function () {
        return typedArrayToList(backing);
      },
    };
  }

  function buildKkriegerProfile() {
    return {
      tipo_recurso: "padrao_kkrieger",
      nome: "kkrieger",
      versao: "1.0",
      foco: [
        "geracao procedimental",
        "baixo armazenamento persistente",
        "estruturas compactas",
        "hot paths sem alocacao evitavel",
      ],
      estruturas: [
        "buffer_fixo",
        "arena",
        "bitset",
        "fila_circular",
        "pool",
        "vetor_compacto",
        "indice_vetorial_compacto",
      ],
      regras_duras: [
        "preferir typed arrays em hot path",
        "preferir capacidade fixa explicita",
        "reutilizar memoria por arena, pool e ring buffer",
        "evitar objetos temporarios dentro de loops criticos",
        "serializar so na borda de I/O",
      ],
      backend_asm_real: false,
    };
  }

  function toSemanticText(value) {
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    if (Array.isArray(value)) {
      return value.map(toSemanticText).join(" ");
    }
    if (isPlainObject(value)) {
      if (hasOwn(value, "texto")) {
        return toSemanticText(value.texto);
      }
      if (hasOwn(value, "nome")) {
        return toSemanticText(value.nome);
      }
      if (hasOwn(value, "valor")) {
        return toSemanticText(value.valor);
      }
      return Object.keys(value).sort().map(function (key) {
        return key + ":" + toSemanticText(value[key]);
      }).join(" ");
    }
    return String(value);
  }

  function simpleEmbedding(value, size) {
    var dims = size || 16;
    var text = toSemanticText(value);
    var out = new Array(dims).fill(0);
    var chars = Array.from(text);
    var i;
    for (i = 0; i < chars.length; i++) {
      var code = chars[i].codePointAt(0);
      var pos = i % dims;
      out[pos] += ((code % 97) + 1) / 100;
      out[(pos * 7 + 3) % dims] += ((code % 37) + 1) / 200;
    }
    return normalizeVector(out);
  }

  function tokenizeText(value) {
    return String(value)
      .toLowerCase()
      .replace(/[^a-z0-9_]+/gi, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  function parseMagic(bytes) {
    if (bytes.length >= 4) {
      if (bytes[0] === 0x7f && bytes[1] === 0x45 && bytes[2] === 0x4c && bytes[3] === 0x46) {
        return "executavel_elf";
      }
      if (bytes[0] === 0x4d && bytes[1] === 0x5a) {
        return "executavel_windows";
      }
      if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
        return "zip";
      }
      if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
        return "pdf";
      }
      if (bytes[0] === 0x0a && bytes[1] === 0x0d && bytes[2] === 0x0d && bytes[3] === 0x0a) {
        return "pcapng";
      }
      if (
        (bytes[0] === 0xd4 && bytes[1] === 0xc3 && bytes[2] === 0xb2 && bytes[3] === 0xa1) ||
        (bytes[0] === 0xa1 && bytes[1] === 0xb2 && bytes[2] === 0xc3 && bytes[3] === 0xd4)
      ) {
        return "pcap";
      }
    }
    return null;
  }

  function extensionOf(path) {
    if (typeof path !== "string") {
      return "";
    }
    var clean = path.split(/[\\/]/).pop();
    var idx = clean.lastIndexOf(".");
    if (idx < 0) {
      return "";
    }
    return clean.slice(idx + 1).toLowerCase();
  }

  function detectFileType(value, pathHint) {
    var bytes = toBytes(value);
    var ext = extensionOf(pathHint);
    var magic = parseMagic(bytes);
    var printable = 0;
    var i;
    if (magic) {
      return magic;
    }
    if (ext === "json") {
      return "json";
    }
    if (ext === "txt" || ext === "md" || ext === "ptjs" || ext === "js") {
      return "texto";
    }
    if (ext === "pcap") {
      return "pcap";
    }
    if (ext === "pcapng") {
      return "pcapng";
    }
    if (ext === "wad") {
      return "wad";
    }
    for (i = 0; i < bytes.length; i++) {
      if (bytes[i] === 0x09 || bytes[i] === 0x0a || bytes[i] === 0x0d || (bytes[i] >= 0x20 && bytes[i] <= 0x7e)) {
        printable++;
      }
    }
    if (bytes.length > 0 && (printable / bytes.length) >= 0.9) {
      return "texto";
    }
    return bytes.length === 0 ? "vazio" : "binario";
  }

  function macToString(bytes, offset) {
    var parts = [];
    var i;
    for (i = 0; i < 6; i++) {
      parts.push(("0" + bytes[offset + i].toString(16)).slice(-2));
    }
    return parts.join(":");
  }

  function ipv4ToString(bytes, offset) {
    return [
      bytes[offset],
      bytes[offset + 1],
      bytes[offset + 2],
      bytes[offset + 3],
    ].join(".");
  }

  function readU16BE(bytes, offset) {
    return ((bytes[offset] << 8) | bytes[offset + 1]) >>> 0;
  }

  function readU16LE(bytes, offset) {
    return ((bytes[offset + 1] << 8) | bytes[offset]) >>> 0;
  }

  function readU32BE(bytes, offset) {
    return (
      (bytes[offset] * 0x1000000) +
      (bytes[offset + 1] << 16) +
      (bytes[offset + 2] << 8) +
      bytes[offset + 3]
    ) >>> 0;
  }

  function readU32LE(bytes, offset) {
    return (
      (bytes[offset + 3] * 0x1000000) +
      (bytes[offset + 2] << 16) +
      (bytes[offset + 1] << 8) +
      bytes[offset]
    ) >>> 0;
  }

  function parsePcapHeader(input) {
    var bytes = typeof input === "string" ? toBytes(ler_bytes(input)) : toBytes(input);
    if (bytes.length < 24) {
      return errorResult("pcap_invalido", "cabecalho pcap incompleto");
    }
    var magic = readU32BE(bytes, 0);
    var littleEndian = magic === 0xd4c3b2a1;
    var bigEndian = magic === 0xa1b2c3d4;
    if (!littleEndian && !bigEndian) {
      return errorResult("pcap_invalido", "assinatura pcap nao reconhecida");
    }
    var read16 = littleEndian ? readU16LE : readU16BE;
    var read32 = littleEndian ? readU32LE : readU32BE;
    return {
      tipo_recurso: "pcap",
      formato: "pcap",
      endian: littleEndian ? "little" : "big",
      versao_major: read16(bytes, 4),
      versao_minor: read16(bytes, 6),
      snaplen: read32(bytes, 16),
      linktype: read32(bytes, 20),
      tamanho_bytes: bytes.length,
    };
  }

  function parsePcapngHeader(input) {
    var bytes = typeof input === "string" ? toBytes(ler_bytes(input)) : toBytes(input);
    if (bytes.length < 16) {
      return errorResult("pcapng_invalido", "cabecalho pcapng incompleto");
    }
    if (!(bytes[0] === 0x0a && bytes[1] === 0x0d && bytes[2] === 0x0d && bytes[3] === 0x0a)) {
      return errorResult("pcapng_invalido", "assinatura pcapng nao reconhecida");
    }
    return {
      tipo_recurso: "pcapng",
      formato: "pcapng",
      block_type: readU32LE(bytes, 0),
      block_total_length: readU32LE(bytes, 4),
      byte_order_magic: "0x" + readU32LE(bytes, 8).toString(16),
      tamanho_bytes: bytes.length,
    };
  }

  function dissectPacket(input) {
    var bytes = input && input.bytes ? input.bytes : toBytes(input);
    var out = {
      tipo_recurso: "pacote_dissecado",
      tamanho_bytes: bytes.length,
    };
    if (bytes.length >= 14) {
      var etherType = readU16BE(bytes, 12);
      out.enlace = {
        destino: macToString(bytes, 0),
        origem: macToString(bytes, 6),
        tipo: "0x" + etherType.toString(16),
      };
      if (etherType === 0x0800 && bytes.length >= 34) {
        var ihl = (bytes[14] & 0x0f) * 4;
        var protocol = bytes[23];
        out.rede = {
          tipo: "ipv4",
          origem: ipv4ToString(bytes, 26),
          destino: ipv4ToString(bytes, 30),
          protocolo: protocol,
          ttl: bytes[22],
        };
        if (protocol === 6 && bytes.length >= 14 + ihl + 20) {
          var tcpOffset = 14 + ihl;
          out.transporte = {
            tipo: "tcp",
            origem: readU16BE(bytes, tcpOffset),
            destino: readU16BE(bytes, tcpOffset + 2),
            seq: readU32BE(bytes, tcpOffset + 4),
            ack: readU32BE(bytes, tcpOffset + 8),
          };
        } else if (protocol === 17 && bytes.length >= 14 + ihl + 8) {
          var udpOffset = 14 + ihl;
          out.transporte = {
            tipo: "udp",
            origem: readU16BE(bytes, udpOffset),
            destino: readU16BE(bytes, udpOffset + 2),
            tamanho: readU16BE(bytes, udpOffset + 4),
          };
        } else if (protocol === 1 && bytes.length >= 14 + ihl + 4) {
          var icmpOffset = 14 + ihl;
          out.transporte = {
            tipo: "icmp",
            codigo_tipo: bytes[icmpOffset],
            codigo_subtipo: bytes[icmpOffset + 1],
          };
        }
      }
    }
    return out;
  }

  function pcapRecordFromSource(source, format) {
    var value = format === "pcapng" ? parsePcapngHeader(source) : parsePcapHeader(source);
    if (value && value.tipo_recurso === "resultado") {
      return value;
    }
    return value;
  }

  function hasStdHost() {
    return typeof std === "object" && std !== null;
  }

  function hasOsHost() {
    return typeof os === "object" && os !== null;
  }

  function baseDir() {
    if (typeof global.__pt_base_dir === "string" && global.__pt_base_dir.length) {
      return global.__pt_base_dir;
    }
    if (hasOsHost() && typeof os.getcwd === "function") {
      return os.getcwd();
    }
    return ".";
  }

  function normalizePath(path) {
    return String(path == null ? "" : path).replace(/\\/g, "/");
  }

  function isAbsolutePath(path) {
    var text = normalizePath(path);
    return text[0] === "/" || /^[A-Za-z]:\//.test(text);
  }

  function dirnamePath(path) {
    var text = normalizePath(path);
    var idx = text.lastIndexOf("/");
    if (idx < 0) {
      return ".";
    }
    if (idx === 0) {
      return "/";
    }
    return text.slice(0, idx);
  }

  function joinPath(base, part) {
    var baseText = normalizePath(base || ".");
    var partText = normalizePath(part || ".");
    if (!baseText || baseText === ".") {
      return partText;
    }
    if (!partText || partText === ".") {
      return baseText;
    }
    if (isAbsolutePath(partText)) {
      return partText;
    }
    if (baseText[baseText.length - 1] === "/") {
      return baseText + partText;
    }
    return baseText + "/" + partText;
  }

  function simplifyPath(path) {
    var text = normalizePath(path);
    var absolute = isAbsolutePath(text);
    var prefix = "";
    var parts;
    var out = [];

    if (/^[A-Za-z]:\//.test(text)) {
      prefix = text.slice(0, 2);
      text = text.slice(2);
      absolute = true;
    }

    parts = text.split("/");
    parts.forEach(function (part) {
      if (!part || part === ".") {
        return;
      }
      if (part === "..") {
        if (out.length && out[out.length - 1] !== "..") {
          out.pop();
        } else if (!absolute) {
          out.push("..");
        }
        return;
      }
      out.push(part);
    });

    return (prefix ? prefix : "") + (absolute ? "/" : "") + out.join("/");
  }

  function resolveHostPath(path) {
    if (typeof path !== "string") {
      return path;
    }
    if (isAbsolutePath(path)) {
      return simplifyPath(path);
    }
    return simplifyPath(joinPath(baseDir(), path));
  }

  function statHost(path, useLstat) {
    var fn;
    var ret;
    var info;
    var err;
    if (!hasOsHost()) {
      return errorResult("host_os_ausente", "modulo os nao disponivel");
    }
    fn = useLstat ? os.lstat : os.stat;
    ret = fn(resolveHostPath(path));
    info = ret[0];
    err = ret[1];
    if (err) {
      return errorResult("stat_falhou", "nao foi possivel ler stat de '" + path + "'", {
        caminho: resolveHostPath(path),
        errno: err,
      });
    }
    return okResult(info, {
      caminho: resolveHostPath(path),
      lstat: !!useLstat,
    });
  }

  function existsHost(path) {
    var res = statHost(path, false);
    return !!res.ok;
  }

  function mkdirHost(path, recursive) {
    var target = resolveHostPath(path);
    var parts;
    var current;
    var ret;
    var i;
    if (!hasOsHost()) {
      return errorResult("host_os_ausente", "modulo os nao disponivel");
    }
    if (!recursive) {
      ret = os.mkdir(target);
      if (ret < 0 && ret !== -17) {
        return errorResult("mkdir_falhou", "nao foi possivel criar diretorio", {
          caminho: target,
          errno: ret,
        });
      }
      return okResult(target);
    }
    parts = simplifyPath(target).split("/");
    current = target[0] === "/" ? "/" : "";
    for (i = 0; i < parts.length; i++) {
      if (!parts[i]) {
        continue;
      }
      current = current ? joinPath(current, parts[i]) : parts[i];
      if (!existsHost(current)) {
        ret = os.mkdir(current);
        if (ret < 0 && ret !== -17) {
          return errorResult("mkdir_falhou", "nao foi possivel criar diretorio", {
            caminho: current,
            errno: ret,
          });
        }
      }
    }
    return okResult(target);
  }

  function readdirHost(path) {
    var ret;
    var list;
    var err;
    if (!hasOsHost()) {
      return errorResult("host_os_ausente", "modulo os nao disponivel");
    }
    ret = os.readdir(resolveHostPath(path || "."));
    list = ret[0];
    err = ret[1];
    if (err) {
      return errorResult("readdir_falhou", "nao foi possivel listar diretorio", {
        caminho: resolveHostPath(path || "."),
        errno: err,
      });
    }
    return okResult(list.filter(function (item) {
      return item !== "." && item !== "..";
    }).sort());
  }

  function removeHost(path) {
    var ret;
    if (!hasOsHost()) {
      return errorResult("host_os_ausente", "modulo os nao disponivel");
    }
    ret = os.remove(resolveHostPath(path));
    if (ret < 0) {
      return errorResult("remove_falhou", "nao foi possivel remover caminho", {
        caminho: resolveHostPath(path),
        errno: ret,
      });
    }
    return okResult(true);
  }

  function renameHost(fromPath, toPath) {
    var ret;
    if (!hasOsHost()) {
      return errorResult("host_os_ausente", "modulo os nao disponivel");
    }
    ret = os.rename(resolveHostPath(fromPath), resolveHostPath(toPath));
    if (ret < 0) {
      return errorResult("rename_falhou", "nao foi possivel renomear caminho", {
        origem: resolveHostPath(fromPath),
        destino: resolveHostPath(toPath),
        errno: ret,
      });
    }
    return okResult({
      origem: resolveHostPath(fromPath),
      destino: resolveHostPath(toPath),
    });
  }

  function readTextHost(path) {
    var resolved = resolveHostPath(path);
    try {
      if (typeof ler_texto === "function") {
        return okResult(ler_texto(path), { caminho: resolved });
      }
      if (hasStdHost()) {
        return okResult(std.loadFile(resolved), { caminho: resolved });
      }
    } catch (err) {
      return errorResult("leitura_falhou", String(err), { caminho: resolved });
    }
    return errorResult("host_std_ausente", "leitura de texto nao disponivel", {
      caminho: resolved,
    });
  }

  function writeTextHost(path, text) {
    var resolved = resolveHostPath(path);
    try {
      if (typeof escrever_texto === "function") {
        return okResult(escrever_texto(path, text), { caminho: resolved });
      }
      if (hasStdHost()) {
        var file = std.open(resolved, "w");
        if (file === null) {
          return errorResult("escrita_falhou", "nao foi possivel abrir arquivo para escrita", {
            caminho: resolved,
          });
        }
        file.puts(String(text));
        file.close();
        return okResult(String(text).length, { caminho: resolved });
      }
    } catch (err) {
      return errorResult("escrita_falhou", String(err), { caminho: resolved });
    }
    return errorResult("host_std_ausente", "escrita de texto nao disponivel", {
      caminho: resolved,
    });
  }

  function readJsonHost(path) {
    var text = readTextHost(path);
    if (!text.ok) {
      return text;
    }
    try {
      return okResult(JSON.parse(text.valor), { caminho: resolveHostPath(path) });
    } catch (err) {
      return errorResult("json_invalido", String(err), { caminho: resolveHostPath(path) });
    }
  }

  function writeJsonHost(path, value) {
    return writeTextHost(path, JSON.stringify(value, null, 2) + "\n");
  }

  function getenvHost(name) {
    if (!hasStdHost()) {
      return undefined;
    }
    return std.getenv(String(name));
  }

  function getenvironHost() {
    if (!hasStdHost()) {
      return {};
    }
    return std.getenviron();
  }

  function shellEscape(arg) {
    return "'" + String(arg).replace(/'/g, "'\"'\"'") + "'";
  }

  function shellJoin(args) {
    return args.map(shellEscape).join(" ");
  }

  function execHost(args, options) {
    var argv = Array.isArray(args) ? args.map(function (item) { return String(item); }) : [String(args)];
    var opts = isPlainObject(options) ? Object.assign({}, options) : {};
    var normalized = {};
    var ret;

    if (!hasOsHost()) {
      return errorResult("host_os_ausente", "modulo os nao disponivel");
    }

    normalized.block = opts.block !== false;
    if (typeof opts.cwd === "string") {
      normalized.cwd = resolveHostPath(opts.cwd);
    }
    if (isPlainObject(opts.env)) {
      normalized.env = Object.assign({}, opts.env);
    }
    if (opts.usePath === false) {
      normalized.usePath = false;
    }
    if (typeof opts.file === "string") {
      normalized.file = opts.file;
    }
    if (typeof opts.stdin === "number") {
      normalized.stdin = opts.stdin;
    }
    if (typeof opts.stdout === "number") {
      normalized.stdout = opts.stdout;
    }
    if (typeof opts.stderr === "number") {
      normalized.stderr = opts.stderr;
    }

    try {
      ret = os.exec(argv, normalized);
    } catch (err) {
      return errorResult("exec_falhou", String(err), {
        argv: argv,
      });
    }

    if (normalized.block) {
      return okResult({
        argv: argv,
        cwd: normalized.cwd || null,
        exit_code: ret,
        ok: ret === 0,
      });
    }

    return okResult({
      argv: argv,
      cwd: normalized.cwd || null,
      pid: ret,
      ativo: ret > 0,
    });
  }

  function popenCaptureHost(args, options) {
    var argv = Array.isArray(args) ? args.map(function (item) { return String(item); }) : [String(args)];
    var command = shellJoin(argv);
    var output = "";
    var status = 0;
    var file;

    if (!hasStdHost()) {
      return errorResult("host_std_ausente", "std.popen nao disponivel");
    }

    try {
      file = std.popen(command, "r");
      if (file === null) {
        return errorResult("popen_falhou", "nao foi possivel abrir processo", {
          comando: command,
        });
      }
      output = file.readAsString();
      status = file.close();
    } catch (err) {
      return errorResult("popen_falhou", String(err), {
        comando: command,
      });
    }

    return okResult({
      argv: argv,
      comando: command,
      saida: output,
      exit_code: status,
      ok: status === 0,
    });
  }

  function waitPidHost(pid, nohang) {
    var ret;
    if (!hasOsHost()) {
      return errorResult("host_os_ausente", "modulo os nao disponivel");
    }
    ret = os.waitpid(pid, nohang ? os.WNOHANG : 0);
    if (ret[0] < 0) {
      return errorResult("waitpid_falhou", "nao foi possivel aguardar processo", {
        pid: pid,
        errno: ret[0],
      });
    }
    return okResult({
      pid: ret[0],
      status: ret[1],
      concluido: ret[0] === pid,
      ativo: ret[0] === 0,
    });
  }

  function killHost(pid, signalNumber) {
    var sig = signalNumber || (hasOsHost() ? os.SIGTERM : 15);
    var ret;
    if (!hasOsHost()) {
      return errorResult("host_os_ausente", "modulo os nao disponivel");
    }
    ret = os.kill(pid, sig);
    if (ret < 0) {
      return errorResult("kill_falhou", "nao foi possivel sinalizar processo", {
        pid: pid,
        signal: sig,
        errno: ret,
      });
    }
    return okResult({
      pid: pid,
      signal: sig,
    });
  }

  function urlGetHost(url, options) {
    var opts = isPlainObject(options) ? Object.assign({}, options) : {};
    var ret;
    if (!hasStdHost() || typeof std.urlGet !== "function") {
      return errorResult("http_indisponivel", "std.urlGet nao disponivel");
    }
    try {
      ret = std.urlGet(String(url), {
        full: true,
        binary: !!opts.binary,
      });
    } catch (err) {
      return errorResult("http_falhou", String(err), {
        url: String(url),
      });
    }
    return okResult({
      url: String(url),
      status: ret.status,
      headers: ret.responseHeaders,
      resposta: ret.response,
      ok: ret.status >= 200 && ret.status < 300,
    });
  }

  function parseHeadersText(text) {
    var headers = Object.create(null);
    String(text || "")
      .split(/\r?\n/)
      .forEach(function (line) {
        var idx;
        var key;
        var value;
        if (!line) {
          return;
        }
        idx = line.indexOf(":");
        if (idx < 0) {
          return;
        }
        key = line.slice(0, idx).trim().toLowerCase();
        value = line.slice(idx + 1).trim();
        if (!key) {
          return;
        }
        if (hasOwn(headers, key)) {
          if (!Array.isArray(headers[key])) {
            headers[key] = [headers[key]];
          }
          headers[key].push(value);
        } else {
          headers[key] = value;
        }
      });
    return headers;
  }

  function buildHttpResponse(payload) {
    var headers = parseHeadersText(payload.headers);
    return {
      tipo_recurso: "http_resposta",
      url: payload.url,
      status: payload.status,
      ok: !!payload.ok,
      headers: headers,
      headers_texto: payload.headers,
      corpo: payload.resposta,
      texto: function () {
        if (typeof this.corpo === "string") {
          return this.corpo;
        }
        return null;
      },
      json: function () {
        var body = this.texto();
        if (body == null) {
          return errorResult("corpo_nao_textual", "resposta HTTP nao contem texto");
        }
        try {
          return okResult(JSON.parse(body), {
            status: this.status,
            url: this.url,
          });
        } catch (err) {
          return errorResult("json_invalido", String(err), {
            status: this.status,
            url: this.url,
          });
        }
      },
    };
  }

  function bytesIndexOf(haystack, needle) {
    var i;
    var j;
    if (!needle.length) {
      return 0;
    }
    for (i = 0; i <= haystack.length - needle.length; i++) {
      for (j = 0; j < needle.length; j++) {
        if (haystack[i + j] !== needle[j]) {
          break;
        }
      }
      if (j === needle.length) {
        return i;
      }
    }
    return -1;
  }

  var state = {
    carregado_em_ms: nowMs(),
    origem_dicionario: null,
    termos: Object.create(null),
    operacoes: Object.create(null),
    construtores: Object.create(null),
    politicas: Object.create(null),
    logs: [],
  };

  function registryLog(kind, detail) {
    state.logs.push({
      tipo: kind,
      detalhe: detail,
      em_ms: nowMs(),
    });
  }

  var gatocore = {
    versao_stdlib: "0.4.0",
    estado: state,
    host_std: hasStdHost(),
    host_os: hasOsHost(),
    padrao_kkrieger: buildKkriegerProfile(),
    listar_termos: function () {
      return Object.keys(state.termos).sort();
    },
    descrever_termo: function (name) {
      return hasOwn(state.termos, name) ? Object.assign({}, state.termos[name]) : null;
    },
    registrar_operacao: function (name, fn) {
      if (typeof name !== "string" || typeof fn !== "function") {
        return errorResult("registro_invalido", "registrar_operacao exige nome e funcao");
      }
      state.operacoes[name] = fn;
      registryLog("operacao", name);
      return okResult({ nome: name, tipo: "operacao" });
    },
    registrar_construtor: function (name, fn) {
      if (typeof name !== "string" || typeof fn !== "function") {
        return errorResult("registro_invalido", "registrar_construtor exige nome e funcao");
      }
      state.construtores[name] = fn;
      registryLog("construtor", name);
      return okResult({ nome: name, tipo: "construtor" });
    },
    registrar_politica: function (name, fn) {
      if (typeof name !== "string" || typeof fn !== "function") {
        return errorResult("registro_invalido", "registrar_politica exige nome e funcao");
      }
      state.politicas[name] = fn;
      registryLog("politica", name);
      return okResult({ nome: name, tipo: "politica" });
    },
    resultado_ok: okResult,
    resultado_erro: errorResult,
  };

  function registerByShape(nameOrSpec, maybeFn) {
    if (typeof nameOrSpec === "string" && typeof maybeFn === "function") {
      return gatocore.registrar_operacao(nameOrSpec, maybeFn);
    }
    if (isPlainObject(nameOrSpec)) {
      if (typeof nameOrSpec.nome === "string" && typeof nameOrSpec.executar === "function") {
        return gatocore.registrar_operacao(nameOrSpec.nome, nameOrSpec.executar);
      }
      if (typeof nameOrSpec.nome === "string" && typeof nameOrSpec.criar === "function") {
        return gatocore.registrar_construtor(nameOrSpec.nome, nameOrSpec.criar);
      }
      if (typeof nameOrSpec.nome === "string" && typeof nameOrSpec.aplicar === "function") {
        return gatocore.registrar_politica(nameOrSpec.nome, nameOrSpec.aplicar);
      }
    }
    return errorResult("registro_invalido", "formato de registro nao reconhecido");
  }

  function unsupportedOperation(entry, args) {
    return errorResult(
      "adaptador_ausente",
      "operacao '" + entry.termo + "' requer implementacao especifica de host ou adaptador",
      {
        termo: entry.termo,
        camada: entry.camada,
        argumentos: args.map(shallowClone),
      }
    );
  }

  function callOperation(entry, args) {
    if (hasOwn(state.operacoes, entry.termo)) {
      try {
        return state.operacoes[entry.termo].apply(null, args);
      } catch (err) {
        return errorResult("falha_operacao", String(err), {
          termo: entry.termo,
        });
      }
    }
    return unsupportedOperation(entry, args);
  }

  var specialFactories = Object.create(null);

  specialFactories.resultado = function (ok, value, error, meta) {
    return makeResult(ok, value, error, meta);
  };

  specialFactories.evento = function (name, data, meta) {
    var out = makeEvent(name || "evento", arguments.length > 1 ? [data] : []);
    if (meta !== undefined) {
      out.meta = meta;
    }
    return out;
  };

  specialFactories.metrica = function (name, value, unit, meta) {
    var out = {
      tipo_recurso: "metrica",
      nome: name || "metrica",
      valor: value === undefined ? 0 : value,
      unidade: unit || null,
      medida_em_ms: nowMs(),
    };
    if (meta !== undefined) {
      out.meta = meta;
    }
    return out;
  };

  specialFactories.janela_tempo = function (duracaoMs) {
    var duracao = Number(duracaoMs || 0);
    return {
      tipo_recurso: "janela_tempo",
      duracao_ms: duracao,
      aberta_em_ms: nowMs(),
      contem: function (timestamp) {
        var t = Number(timestamp);
        return t >= (this.aberta_em_ms - this.duracao_ms) && t <= this.aberta_em_ms;
      },
    };
  };

  specialFactories.buffer = function (sizeOrValue) {
    if (typeof sizeOrValue === "number") {
      return new Uint8Array(sizeOrValue);
    }
    return toBytes(sizeOrValue);
  };

  specialFactories.buffer_fixo = function (size, fillValue) {
    var out = new Uint8Array(intOr(size, 0));
    if (fillValue !== undefined) {
      out.fill(Number(fillValue) || 0);
    }
    return out;
  };

  specialFactories.padrao_kkrieger = function () {
    return buildKkriegerProfile();
  };

  specialFactories.vetor = function (items) {
    var list = Array.isArray(items) ? items.slice() : toArray(arguments);
    return list.map(function (item) {
      return Number(item);
    });
  };

  specialFactories.vetor_compacto = function (typeOrItems, sizeOrItems) {
    var specName;
    var source;
    if (typeof typeOrItems === "string") {
      specName = typedArraySpec(typeOrItems).nome;
      source = sizeOrItems;
    } else {
      specName = "f64";
      source = arguments.length ? typeOrItems : 0;
    }
    return buildCompactVector(specName, typedArrayFrom(specName, source));
  };

  specialFactories.vetor2 = function (x, y) {
    return { tipo_recurso: "vetor2", x: Number(x || 0), y: Number(y || 0) };
  };

  specialFactories.vetor3 = function (x, y, z) {
    return {
      tipo_recurso: "vetor3",
      x: Number(x || 0),
      y: Number(y || 0),
      z: Number(z || 0),
    };
  };

  specialFactories.tensor = function (data, shape) {
    var inferredShape = Array.isArray(shape) ? shape.slice() : inferShape(data);
    return {
      tipo_recurso: "tensor",
      forma: inferredShape,
      dados: flattenNumbers(data),
    };
  };

  specialFactories.dimensao = function (value) {
    if (value && value.tipo_recurso === "tensor") {
      return value.forma.slice();
    }
    if (Array.isArray(value)) {
      return inferShape(value);
    }
    return [];
  };

  specialFactories.normalizar = function (value) {
    if (Array.isArray(value)) {
      return normalizeVector(value.map(Number));
    }
    if (value && value.tipo_recurso === "tensor") {
      return {
        tipo_recurso: "tensor",
        forma: value.forma.slice(),
        dados: normalizeVector(value.dados.map(Number)),
      };
    }
    return value;
  };

  specialFactories.tokenizar = function (text) {
    return tokenizeText(text);
  };

  specialFactories.embedding = function (value, size) {
    return simpleEmbedding(value, size);
  };

  specialFactories.embedding_compacto = function (value, size) {
    return simpleEmbeddingCompact(value, size);
  };

  specialFactories.indice_vetorial = function (items, size) {
    var dims = intOr(size, 16) || 16;
    var list = Array.isArray(items) ? items.slice() : [];
    var matrix = new Float32Array(list.length * dims);
    var entries = list.map(function (item, index) {
      matrix.set(simpleEmbeddingCompact(item, dims), index * dims);
      return {
        item: item,
        offset: index * dims,
      };
    });
    return {
      tipo_recurso: "indice_vetorial",
      dimensao: dims,
      entradas: entries,
      matriz: matrix,
      buscar: function (query, limit) {
        return specialFactories.vizinho_proximo(this, query, limit);
      },
    };
  };

  specialFactories.indice_vetorial_compacto = function (items, size) {
    var index = specialFactories.indice_vetorial(items, size);
    index.tipo_recurso = "indice_vetorial_compacto";
    return index;
  };

  specialFactories.vizinho_proximo = function (index, query, limit) {
    var lim = Number(limit || 1);
    var dims = index && index.dimensao ? index.dimensao : 16;
    var queryEmbedding = (isTypedArray(query) || Array.isArray(query)) ?
      typedArrayFrom("f32", query) :
      simpleEmbeddingCompact(query, dims);
    var entries = index && Array.isArray(index.entradas) ? index.entradas : [];
    if (index && index.matriz instanceof Float32Array) {
      return entries
        .map(function (entry, idx) {
          return {
            item: entry.item,
            score: Number(cosineSimilarityPackedRow(index.matriz, idx * dims, queryEmbedding, dims).toFixed(6)),
          };
        })
        .sort(function (a, b) {
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return toSemanticText(a.item).localeCompare(toSemanticText(b.item));
        })
        .slice(0, lim);
    }
    return entries
      .map(function (entry) {
        return {
          item: entry.item,
          score: Number(cosineSimilarity(entry.embedding, queryEmbedding).toFixed(6)),
        };
      })
      .sort(function (a, b) {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return toSemanticText(a.item).localeCompare(toSemanticText(b.item));
      })
      .slice(0, lim);
  };

  specialFactories.ranquear = function (items, scorer) {
    var list = Array.isArray(items) ? items.slice() : [];
    return list
      .map(function (item, index) {
        var score;
        if (typeof scorer === "function") {
          score = Number(scorer(item, index));
        } else if (item && typeof item === "object" && hasOwn(item, "score")) {
          score = Number(item.score);
        } else {
          score = 0;
        }
        return { item: item, score: score };
      })
      .sort(function (a, b) {
        return b.score - a.score;
      });
  };

  specialFactories.reranquear = specialFactories.ranquear;

  specialFactories.contexto = function (initial) {
    return stableObject({
      tipo_recurso: "contexto",
      criado_em_ms: nowMs(),
    }, isPlainObject(initial) ? initial : { valor: shallowClone(initial) });
  };

  specialFactories.configuracao = function (name, values) {
    if (isPlainObject(name) && values === undefined) {
      return stableObject({
        tipo_recurso: "configuracao",
        criado_em_ms: nowMs(),
      }, name);
    }
    return {
      tipo_recurso: "configuracao",
      nome: typeof name === "string" ? name : "padrao",
      valores: isPlainObject(values) ? Object.assign({}, values) : {},
      criado_em_ms: nowMs(),
    };
  };

  specialFactories.perfil = function (name, values) {
    return {
      tipo_recurso: "perfil",
      nome: typeof name === "string" ? name : "padrao",
      valores: isPlainObject(values) ? Object.assign({}, values) : {},
      criado_em_ms: nowMs(),
    };
  };

  specialFactories.snapshot = function (name, value) {
    return {
      tipo_recurso: "snapshot",
      nome: typeof name === "string" ? name : "snapshot",
      valor: shallowClone(value),
      criado_em_ms: nowMs(),
    };
  };

  specialFactories.checkpoint = function (name, value) {
    return {
      tipo_recurso: "checkpoint",
      nome: typeof name === "string" ? name : "checkpoint",
      valor: shallowClone(value),
      criado_em_ms: nowMs(),
    };
  };

  specialFactories.fila = function (items) {
    var stateQ = {
      itens: Array.isArray(items) ? items.slice() : [],
      cabeca: 0,
    };

    function compactar() {
      if (stateQ.cabeca > 64 && stateQ.cabeca * 2 >= stateQ.itens.length) {
        stateQ.itens = stateQ.itens.slice(stateQ.cabeca);
        stateQ.cabeca = 0;
      }
    }

    var queue = {
      tipo_recurso: "fila",
      empurrar: function (value) {
        stateQ.itens.push(value);
        return stateQ.itens.length - stateQ.cabeca;
      },
      tirar: function () {
        var value;
        if (stateQ.cabeca >= stateQ.itens.length) {
          return null;
        }
        value = stateQ.itens[stateQ.cabeca];
        stateQ.itens[stateQ.cabeca] = undefined;
        stateQ.cabeca += 1;
        compactar();
        return value;
      },
      espiar: function () {
        return stateQ.cabeca < stateQ.itens.length ? stateQ.itens[stateQ.cabeca] : null;
      },
      tamanho: function () {
        return stateQ.itens.length - stateQ.cabeca;
      },
      vazia: function () {
        return this.tamanho() === 0;
      },
    };
    Object.defineProperty(queue, "itens", {
      enumerable: true,
      get: function () {
        return stateQ.itens.slice(stateQ.cabeca);
      },
    });
    return queue;
  };

  specialFactories.fila_circular = function (capacity) {
    var cap = intOr(capacity, 0) || 1;
    var slots = new Array(cap);
    var head = 0;
    var tail = 0;
    var count = 0;
    return {
      tipo_recurso: "fila_circular",
      capacidade: cap,
      empurrar: function (value) {
        if (count >= cap) {
          return errorResult("fila_cheia", "fila_circular atingiu capacidade maxima", {
            capacidade: cap,
          });
        }
        slots[tail] = value;
        tail = (tail + 1) % cap;
        count += 1;
        return okResult(count, { capacidade: cap });
      },
      tirar: function () {
        var value;
        if (!count) {
          return null;
        }
        value = slots[head];
        slots[head] = undefined;
        head = (head + 1) % cap;
        count -= 1;
        return value;
      },
      espiar: function () {
        return count ? slots[head] : null;
      },
      listar: function () {
        var out = [];
        var i;
        for (i = 0; i < count; i++) {
          out.push(slots[(head + i) % cap]);
        }
        return out;
      },
      limpar: function () {
        var i;
        for (i = 0; i < cap; i++) {
          slots[i] = undefined;
        }
        head = 0;
        tail = 0;
        count = 0;
        return 0;
      },
      tamanho: function () {
        return count;
      },
      vazia: function () {
        return count === 0;
      },
      cheia: function () {
        return count === cap;
      },
    };
  };

  specialFactories.bitset = function (bits) {
    var totalBits = intOr(bits, 0);
    var words = new Uint32Array(Math.ceil(totalBits / 32));
    function valid(bit) {
      return bit >= 0 && bit < totalBits;
    }
    function word(bit) {
      return bit >> 5;
    }
    function mask(bit) {
      return 1 << (bit & 31);
    }
    return {
      tipo_recurso: "bitset",
      bits: totalBits,
      palavras: words,
      ativar: function (bit) {
        bit = intOr(bit, 0);
        if (!valid(bit)) {
          return false;
        }
        words[word(bit)] |= mask(bit);
        return true;
      },
      limpar: function (bit) {
        bit = intOr(bit, 0);
        if (!valid(bit)) {
          return false;
        }
        words[word(bit)] &= ~mask(bit);
        return true;
      },
      alternar: function (bit) {
        bit = intOr(bit, 0);
        if (!valid(bit)) {
          return false;
        }
        words[word(bit)] ^= mask(bit);
        return true;
      },
      contem: function (bit) {
        bit = intOr(bit, 0);
        return valid(bit) ? !!(words[word(bit)] & mask(bit)) : false;
      },
      zerar: function () {
        words.fill(0);
        return 0;
      },
      contar: function () {
        var total = 0;
        var i;
        var value;
        for (i = 0; i < words.length; i++) {
          value = words[i];
          while (value) {
            value &= value - 1;
            total += 1;
          }
        }
        return total;
      },
    };
  };

  specialFactories.pool = function (capacity, seed) {
    var cap = intOr(capacity, 0);
    var free = [];
    var slots = new Array(cap);
    var i;
    for (i = cap - 1; i >= 0; i--) {
      free.push(i);
    }
    return {
      tipo_recurso: "pool",
      capacidade: cap,
      alocar: function (value) {
        var idx;
        var stored;
        if (!free.length) {
          return errorResult("pool_esgotado", "pool nao possui slots livres", {
            capacidade: cap,
          });
        }
        idx = free.pop();
        if (typeof seed === "function") {
          stored = seed(value, idx);
        } else if (value !== undefined) {
          stored = shallowClone(value);
        } else {
          stored = seed !== undefined ? shallowClone(seed) : { indice: idx };
        }
        slots[idx] = stored;
        return okResult({
          indice: idx,
          valor: stored,
        });
      },
      liberar: function (idx) {
        idx = intOr(idx, 0);
        if (idx >= cap || slots[idx] === undefined) {
          return errorResult("slot_invalido", "slot nao esta ocupado", {
            indice: idx,
          });
        }
        slots[idx] = undefined;
        free.push(idx);
        return okResult(true);
      },
      obter: function (idx) {
        idx = intOr(idx, 0);
        return idx < cap ? slots[idx] : undefined;
      },
      ativos: function () {
        return cap - free.length;
      },
      listar: function () {
        return slots.filter(function (item) {
          return item !== undefined;
        });
      },
    };
  };

  specialFactories.arena = function (size) {
    var bytes = new Uint8Array(intOr(size, 0));
    var view = new DataView(bytes.buffer);
    function align(cursor, alignment) {
      var a = intOr(alignment, 1) || 1;
      var mod = cursor % a;
      return mod === 0 ? cursor : cursor + (a - mod);
    }
    return {
      tipo_recurso: "arena",
      bytes: bytes,
      view: view,
      cursor: 0,
      capacidade: function () {
        return bytes.length;
      },
      usado: function () {
        return this.cursor;
      },
      disponivel: function () {
        return bytes.length - this.cursor;
      },
      resetar: function () {
        this.cursor = 0;
        return 0;
      },
      limpar: function (fillValue) {
        bytes.fill(Number(fillValue) || 0);
        this.cursor = 0;
        return 0;
      },
      alocar: function (length, alignment) {
        var len = intOr(length, 0);
        var start = align(this.cursor, alignment);
        if ((start + len) > bytes.length) {
          return errorResult("arena_sem_espaco", "arena sem espaco livre suficiente", {
            solicitado: len,
            cursor: this.cursor,
            capacidade: bytes.length,
          });
        }
        this.cursor = start + len;
        return okResult({
          offset: start,
          tamanho: len,
        });
      },
      fatia: function (offset, length) {
        var start = intOr(offset, 0);
        var end = start + intOr(length, 0);
        return bytes.subarray(start, end);
      },
      escrever: function (offset, value) {
        var start = intOr(offset, 0);
        var src = toBytes(value);
        if ((start + src.length) > bytes.length) {
          return errorResult("arena_oob", "escrita excede capacidade da arena", {
            offset: start,
            tamanho: src.length,
          });
        }
        bytes.set(src, start);
        return okResult(src.length);
      },
      ler_texto: function (offset, length) {
        var data = this.fatia(offset, length);
        return Array.prototype.map.call(data, function (item) {
          return String.fromCharCode(item);
        }).join("");
      },
      escrever_u8: function (offset, value) {
        view.setUint8(intOr(offset, 0), Number(value) || 0);
        return this;
      },
      ler_u8: function (offset) {
        return view.getUint8(intOr(offset, 0));
      },
      escrever_u16: function (offset, value) {
        view.setUint16(intOr(offset, 0), Number(value) || 0, true);
        return this;
      },
      ler_u16: function (offset) {
        return view.getUint16(intOr(offset, 0), true);
      },
      escrever_u32: function (offset, value) {
        view.setUint32(intOr(offset, 0), Number(value) >>> 0, true);
        return this;
      },
      ler_u32: function (offset) {
        return view.getUint32(intOr(offset, 0), true);
      },
    };
  };

  specialFactories.stream = function (items) {
    var stateStream = {
      itens: Array.isArray(items) ? items.slice() : [],
      cabeca: 0,
    };

    function compactar() {
      if (stateStream.cabeca > 64 && stateStream.cabeca * 2 >= stateStream.itens.length) {
        stateStream.itens = stateStream.itens.slice(stateStream.cabeca);
        stateStream.cabeca = 0;
      }
    }

    var stream = {
      tipo_recurso: "stream",
      escrever: function (value) {
        stateStream.itens.push(value);
        return stateStream.itens.length - stateStream.cabeca;
      },
      ler: function () {
        var value;
        if (stateStream.cabeca >= stateStream.itens.length) {
          return null;
        }
        value = stateStream.itens[stateStream.cabeca];
        stateStream.itens[stateStream.cabeca] = undefined;
        stateStream.cabeca += 1;
        compactar();
        return value;
      },
      listar: function () {
        return stateStream.itens.slice(stateStream.cabeca);
      },
    };
    Object.defineProperty(stream, "itens", {
      enumerable: true,
      get: function () {
        return stateStream.itens.slice(stateStream.cabeca);
      },
    });
    return stream;
  };

  specialFactories.coletar = function (target, sample) {
    var itensDescriptor;
    if (target && typeof target.empurrar === "function") {
      target.empurrar(sample);
      return okResult(target);
    }
    if (target && typeof target.escrever === "function") {
      target.escrever(sample);
      return okResult(target);
    }
    itensDescriptor = target ? Object.getOwnPropertyDescriptor(target, "itens") : null;
    if (target && Array.isArray(target.itens) && !(itensDescriptor && typeof itensDescriptor.get === "function")) {
      target.itens.push(sample);
      return okResult(target);
    }
    if (Array.isArray(target)) {
      target.push(sample);
      return okResult(target);
    }
    return errorResult("coleta_invalida", "alvo de coleta nao suporta insercao");
  };

  specialFactories.analisar = function (value) {
    var info;
    if (typeof __pt_identify === "function") {
      info = __pt_identify(value);
    } else {
      info = { tipo: typeof value };
    }
    if (value && typeof value === "object") {
      info.chaves = Object.keys(value);
      info.quantidade_chaves = info.chaves.length;
      if (hasOwn(value, "termo")) {
        info.termo = value.termo;
      }
      if (hasOwn(value, "classe")) {
        info.classe = value.classe;
      }
    }
    return info;
  };

  specialFactories.validar = function (value, schema) {
    if (schema === undefined) {
      return okResult(true, { modo: "presenca" });
    }
    if (typeof schema === "function") {
      try {
        return okResult(!!schema(value), { modo: "funcao" });
      } catch (err) {
        return errorResult("validacao_falhou", String(err));
      }
    }
    if (Array.isArray(schema)) {
      var missing = schema.filter(function (key) {
        return !(value && hasOwn(value, key));
      });
      if (missing.length) {
        return errorResult("campos_ausentes", "campos ausentes: " + missing.join(", "));
      }
      return okResult(true, { modo: "campos", campos: schema.slice() });
    }
    if (isPlainObject(schema)) {
      var invalid = [];
      Object.keys(schema).forEach(function (key) {
        var expected = schema[key];
        var actual = value ? value[key] : undefined;
        if (typeof expected === "string") {
          var typeName = typeof __pt_type_of === "function" ? __pt_type_of(actual) : typeof actual;
          if (typeName !== expected && typeof actual !== expected) {
            invalid.push(key + ":" + expected);
          }
        } else if (typeof expected === "function") {
          if (!expected(actual)) {
            invalid.push(key + ":predicado");
          }
        }
      });
      if (invalid.length) {
        return errorResult("validacao_falhou", "falha em " + invalid.join(", "));
      }
      return okResult(true, { modo: "schema" });
    }
    return errorResult("schema_invalido", "schema nao suportado");
  };

  specialFactories.registrar = function (nameOrSpec, maybeFn) {
    return registerByShape(nameOrSpec, maybeFn);
  };

  specialFactories.classificar = function (text, labels) {
    var tokens = tokenizeText(text);
    if (Array.isArray(labels) && labels.length) {
      return labels
        .map(function (label) {
          var labelTokens = tokenizeText(label);
          var score = labelTokens.reduce(function (acc, token) {
            return acc + (tokens.indexOf(token) >= 0 ? 1 : 0);
          }, 0);
          return { rotulo: label, score: score };
        })
        .sort(function (a, b) { return b.score - a.score; })[0].rotulo;
    }
    if (/https?:\/\//i.test(String(text))) {
      return "url";
    }
    if (/function|class|return|const|let|var/.test(String(text))) {
      return "codigo";
    }
    if (/^\d+$/.test(String(text).trim())) {
      return "numero";
    }
    return "texto";
  };

  specialFactories.mensagem_modelo = function (role, content, extra) {
    return stableObject({
      tipo_recurso: "mensagem_modelo",
      papel: role || "usuario",
      conteudo: content == null ? "" : content,
    }, isPlainObject(extra) ? extra : null);
  };

  specialFactories.prompt = function (value, extra) {
    return stableObject({
      tipo_recurso: "prompt",
      texto: toSemanticText(value),
      criado_em_ms: nowMs(),
    }, isPlainObject(extra) ? extra : null);
  };

  specialFactories.pipeline = function (steps) {
    var list = Array.isArray(steps) ? steps.slice() : toArray(arguments);
    return {
      tipo_recurso: "pipeline",
      etapas: list,
      executar: function (input) {
        return list.reduce(function (acc, step) {
          if (typeof step === "function") {
            return step(acc);
          }
          return acc;
        }, input);
      },
    };
  };

  specialFactories.agente = function (config) {
    var cfg = isPlainObject(config) ? Object.assign({}, config) : {};
    return {
      tipo_recurso: "agente",
      configuracao: cfg,
      memoria_curta: [],
      memoria_longa: [],
      ferramentas: [],
      executar: function (input) {
        this.memoria_curta.push(input);
        if (typeof cfg.executar === "function") {
          return cfg.executar(input, this);
        }
        if (cfg.pipeline && typeof cfg.pipeline.executar === "function") {
          return cfg.pipeline.executar(input);
        }
        return input;
      },
    };
  };

  specialFactories.subagente = function (config) {
    var base = specialFactories.agente(config);
    base.tipo_recurso = "subagente";
    return base;
  };

  specialFactories.sessao = function (id, meta) {
    return {
      tipo_recurso: "sessao",
      id: id || ("sessao-" + nowMs()),
      meta: isPlainObject(meta) ? Object.assign({}, meta) : {},
      eventos: [],
      registrar: function (ev) {
        this.eventos.push(ev);
        return this.eventos.length;
      },
    };
  };

  specialFactories.sessao_agente = function (config) {
    return {
      tipo_recurso: "sessao_agente",
      sessao: specialFactories.sessao(config && config.id, config),
      agente: specialFactories.agente(config),
    };
  };

  specialFactories.ferramenta = function (name, fn, meta) {
    return {
      tipo_recurso: "ferramenta",
      nome: name || "ferramenta",
      executar: typeof fn === "function" ? fn : function (value) { return value; },
      meta: isPlainObject(meta) ? Object.assign({}, meta) : {},
    };
  };

  specialFactories.modelo = function (config) {
    return stableObject({
      tipo_recurso: "modelo",
      configuracao: {},
    }, isPlainObject(config) ? { configuracao: Object.assign({}, config) } : null);
  };

  specialFactories.modelo_chat = function (config) {
    var model = specialFactories.modelo(config);
    model.tipo_recurso = "modelo_chat";
    return model;
  };

  specialFactories.porta = function (value) {
    var n = Number(value);
    if (!isFinite(n)) {
      n = null;
    }
    return {
      tipo_recurso: "porta",
      numero: n,
      segura: n === 443 || n === 8443,
      local: n != null && n >= 0 && n <= 65535,
    };
  };

  specialFactories.provedor = function (name, config) {
    var provider = {
      tipo_recurso: "provedor",
      nome: typeof name === "string" ? name : "local",
      configuracao: isPlainObject(config) ? Object.assign({}, config) : {},
    };
    provider.buscar = function (path) {
      var base = this.configuracao.base_url || "";
      var url = /^https?:\/\//i.test(String(path)) ? String(path) : base.replace(/\/+$/, "") + "/" + String(path).replace(/^\/+/, "");
      return urlGetHost(url);
    };
    return provider;
  };

  specialFactories.http = function (config) {
    var cfg;
    if (typeof config === "string") {
      cfg = { base_url: config };
    } else {
      cfg = isPlainObject(config) ? Object.assign({}, config) : {};
    }

    function resolveUrl(path) {
      var target = path == null ? "" : String(path);
      var base = cfg.base_url || "";
      if (/^https?:\/\//i.test(target)) {
        return target;
      }
      if (!base) {
        return target;
      }
      return base.replace(/\/+$/, "") + "/" + target.replace(/^\/+/, "");
    }

    function request(path, options) {
      var fetched = urlGetHost(resolveUrl(path), options);
      if (!fetched.ok) {
        return fetched;
      }
      return okResult(buildHttpResponse(fetched.valor), {
        url: fetched.valor.url,
        status: fetched.valor.status,
      });
    }

    return {
      tipo_recurso: "http",
      configuracao: cfg,
      base_url: cfg.base_url || null,
      obter: function (path, options) {
        return request(path, options);
      },
      get: function (path, options) {
        return request(path, options);
      },
      texto: function (path) {
        var res = request(path, { binary: false });
        if (!res.ok) {
          return res;
        }
        return okResult(res.valor.texto(), {
          status: res.valor.status,
          url: res.valor.url,
        });
      },
      json: function (path) {
        var res = request(path, { binary: false });
        if (!res.ok) {
          return res;
        }
        return res.valor.json();
      },
    };
  };

  specialFactories.provedor_modelo = function (name, config) {
    var provider = specialFactories.provedor(name, config);
    provider.tipo_recurso = "provedor_modelo";
    provider.executar = function (payload) {
      if (typeof this.configuracao.executar === "function") {
        return this.configuracao.executar(payload);
      }
      if (typeof this.configuracao.endpoint === "string") {
        return this.buscar(this.configuracao.endpoint);
      }
      return okResult({
        payload: payload,
        provider: this.nome,
      });
    };
    return provider;
  };

  specialFactories.rag = function (query, index, limit) {
    if (!index || !Array.isArray(index.entradas)) {
      return errorResult("indice_ausente", "rag exige um indice_vetorial");
    }
    var hits = specialFactories.vizinho_proximo(index, query, limit || 3);
    return {
      tipo_recurso: "rag",
      consulta: query,
      contexto: hits,
      resposta_base: hits.map(function (item) {
        return toSemanticText(item.item);
      }).join("\n"),
    };
  };

  specialFactories.tipo_arquivo = function (value) {
    if (typeof value === "string" && typeof arquivo_existe === "function" && arquivo_existe(value)) {
      return detectFileType(ler_bytes(value), value);
    }
    return detectFileType(value, typeof value === "string" ? value : "");
  };

  specialFactories.varrer_arquivo = function (path) {
    if (typeof path !== "string") {
      return errorResult("entrada_invalida", "varrer_arquivo exige caminho em texto");
    }
    if (typeof arquivo_existe !== "function" || !arquivo_existe(path)) {
      return errorResult("arquivo_ausente", "arquivo nao encontrado: " + path);
    }
    var bytes = toBytes(ler_bytes(path));
    var fileType = detectFileType(bytes, path);
    var suspicious = [];
    if (fileType === "executavel_windows" || fileType === "executavel_elf") {
      suspicious.push("executavel");
    }
    if (extensionOf(path) === "txt" && bytes.length > 0 && parseMagic(bytes)) {
      suspicious.push("extensao_inconsistente");
    }
    return okResult({
      caminho: path,
      tipo_arquivo: fileType,
      tamanho_bytes: bytes.length,
      hash_fnv1a: fnv1aHex(bytes),
      suspeitas: suspicious,
      veredicto: suspicious.length ? "suspeito" : "limpo",
    }, { operacao: "varrer_arquivo" });
  };

  specialFactories.varrer = function (target) {
    if (typeof target === "string") {
      return specialFactories.varrer_arquivo(target);
    }
    var bytes = toBytes(target);
    return okResult({
      tipo_arquivo: detectFileType(bytes),
      tamanho_bytes: bytes.length,
      hash_fnv1a: fnv1aHex(bytes),
      veredicto: "analisado",
    }, { operacao: "varrer" });
  };

  specialFactories.varrer_fluxo = function (target) {
    return specialFactories.varrer(target);
  };

  specialFactories.pcap = function (source) {
    return pcapRecordFromSource(source, "pcap");
  };

  specialFactories.pcapng = function (source) {
    return pcapRecordFromSource(source, "pcapng");
  };

  specialFactories.quadro = function (bytes) {
    return {
      tipo_recurso: "quadro",
      bytes: toBytes(bytes),
    };
  };

  specialFactories.pacote = function (bytes) {
    return {
      tipo_recurso: "pacote",
      bytes: toBytes(bytes),
    };
  };

  specialFactories.dissecar = function (packetLike) {
    return dissectPacket(packetLike);
  };

  specialFactories.estatistica_protocolo = function (items) {
    var list = Array.isArray(items) ? items : [];
    return list.reduce(function (acc, item) {
      var parsed = item && item.tipo_recurso === "pacote_dissecado" ? item : dissectPacket(item);
      var proto = parsed.transporte ? parsed.transporte.tipo :
        (parsed.rede ? parsed.rede.tipo : (parsed.enlace ? parsed.enlace.tipo : "desconhecido"));
      acc[proto] = (acc[proto] || 0) + 1;
      return acc;
    }, {});
  };

  specialFactories.estatistica_conversa = function (items) {
    var list = Array.isArray(items) ? items : [];
    return list.reduce(function (acc, item) {
      var parsed = item && item.tipo_recurso === "pacote_dissecado" ? item : dissectPacket(item);
      var transport = parsed.transporte || {};
      var network = parsed.rede || {};
      var key = [
        network.origem || "?",
        transport.origem || "?",
        network.destino || "?",
        transport.destino || "?",
        transport.tipo || "?",
      ].join(">");
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  };

  specialFactories.seguir_fluxo = function (items, key) {
    var list = Array.isArray(items) ? items : [];
    if (!key) {
      return list.map(dissectPacket);
    }
    return list
      .map(dissectPacket)
      .filter(function (item) {
        var transport = item.transporte || {};
        var network = item.rede || {};
        var candidate = [
          network.origem || "?",
          transport.origem || "?",
          network.destino || "?",
          transport.destino || "?",
          transport.tipo || "?",
        ].join(">");
        return candidate === key;
      });
  };

  specialFactories.reassemblar_fluxo = function (items) {
    var list = Array.isArray(items) ? items : [];
    var chunks = [];
    var total = 0;
    var out;
    var offset = 0;
    chunks = list.map(function (item) {
      var packetBytes = toBytes(item && item.bytes ? item.bytes : item);
      total += packetBytes.length;
      return packetBytes;
    });
    out = new Uint8Array(total);
    chunks.forEach(function (chunk) {
      out.set(chunk, offset);
      offset += chunk.length;
    });
    return out;
  };

  specialFactories.manifesto = function (value) {
    if (typeof value === "string" && typeof arquivo_existe === "function" && arquivo_existe(value)) {
      var text = ler_texto(value);
      try {
        return stableObject({
          tipo_recurso: "manifesto",
          caminho: value,
        }, JSON.parse(text));
      } catch (err) {
        return {
          tipo_recurso: "manifesto",
          caminho: value,
          texto: text,
        };
      }
    }
    return typedRecord({
      termo: "manifesto",
      classe: "recurso",
      camada: "stdlib",
      uso_tecnico: "contrato declarativo de app, skill ou agente",
    }, arguments);
  };

  specialFactories.entidade = function (id, extra) {
    return stableObject({
      tipo_recurso: "entidade",
      id: id == null ? ("entidade-" + nowMs()) : id,
    }, isPlainObject(extra) ? extra : null);
  };

  specialFactories.componente = function (name, value) {
    return {
      tipo_recurso: "componente",
      nome: name || "componente",
      valor: value === undefined ? null : shallowClone(value),
    };
  };

  specialFactories.cena = function (name, entities) {
    return {
      tipo_recurso: "cena",
      nome: name || "cena",
      entidades: Array.isArray(entities) ? entities.slice() : [],
    };
  };

  specialFactories.recurso = function (name, kind, data) {
    return {
      tipo_recurso: "recurso",
      nome: name || "recurso",
      classe_recurso: kind || "generico",
      dados: shallowClone(data),
      uid: "res_" + nowMs(),
    };
  };

  specialFactories.no = function (name, config) {
    return createNodeRecord("Node", name, config, {});
  };

  specialFactories.no2d = function (name, config) {
    return createNodeRecord("Node2D", name, config, {
      x: 0,
      y: 0,
      rotacao: 0,
      escala_x: 1,
      escala_y: 1,
    });
  };

  specialFactories.no3d = function (name, config) {
    return createNodeRecord("Node3D", name, config, {
      x: 0,
      y: 0,
      z: 0,
      rotacao_x: 0,
      rotacao_y: 0,
      rotacao_z: 0,
      escala_x: 1,
      escala_y: 1,
      escala_z: 1,
    });
  };

  specialFactories.controle = function (name, config) {
    return createNodeRecord("Control", name, config, {
      x: 0,
      y: 0,
      largura: 180,
      altura: 48,
      texto: "",
    });
  };

  specialFactories.label = function (name, config) {
    return createNodeRecord("Label", name, config, {
      x: 0,
      y: 0,
      texto: name || "Label",
      cor: "#f0f0f0",
    });
  };

  specialFactories.camera = function (config) {
    return typedRecord({
      termo: "camera",
      classe: "recurso",
      camada: "runtime",
      uso_tecnico: "viewport e transformacao visual",
    }, arguments, {
      x: 0,
      y: 0,
      zoom: 1,
    });
  };

  specialFactories.camera2d = function (config) {
    var cfg = isPlainObject(config) ? Object.assign({}, config) : {};
    return createNodeRecord("Camera2D", cfg.nome || "Camera2D", cfg, {
      x: cfg.x || 0,
      y: cfg.y || 0,
      zoom: cfg.zoom || 1,
      seguir: cfg.seguir || null,
    });
  };

  specialFactories.camera3d = function (config) {
    var cfg = isPlainObject(config) ? Object.assign({}, config) : {};
    return createNodeRecord("Camera3D", cfg.nome || "Camera3D", cfg, {
      x: cfg.x || 0,
      y: cfg.y || 0,
      z: cfg.z || 0,
      fov: cfg.fov || 70,
    });
  };

  specialFactories.sprite2d = function (name, config) {
    return createNodeRecord("Sprite2D", name, config, {
      x: 0,
      y: 0,
      largura: 24,
      altura: 24,
      cor: "#44aa88",
    });
  };

  specialFactories.viewport = function (config) {
    var cfg = isPlainObject(config) ? Object.assign({}, config) : {};
    return {
      tipo_recurso: "viewport",
      largura: cfg.largura || 320,
      altura: cfg.altura || 180,
      escala: cfg.escala || 1,
      cor_fundo: cfg.cor_fundo || "#10161f",
      transparente: !!cfg.transparente,
    };
  };

  specialFactories.sinal = function (name, config) {
    var cfg = isPlainObject(config) ? Object.assign({}, config) : {};
    var signal = {
      tipo_recurso: "sinal",
      nome: name || cfg.nome || "signal",
      conexoes: [],
      meta: cfg,
    };
    signal.conectar = function (targetId, methodName) {
      this.conexoes.push({
        alvo: targetId || null,
        metodo: methodName || "on_signal",
      });
      return this.conexoes.length;
    };
    return signal;
  };

  specialFactories.arvore_cena = function (root) {
    function flatten(node, out) {
      out.push(node);
      (node.filhos || []).forEach(function (child) {
        flatten(child, out);
      });
    }
    function find(node, id) {
      if (!node) {
        return null;
      }
      if (node.id === id) {
        return node;
      }
      var idx;
      for (idx = 0; idx < (node.filhos || []).length; idx++) {
        var found = find(node.filhos[idx], id);
        if (found) {
          return found;
        }
      }
      return null;
    }
    return {
      tipo_recurso: "arvore_cena",
      raiz: root || null,
      listar: function () {
        if (!this.raiz) {
          return [];
        }
        var out = [];
        flatten(this.raiz, out);
        return out;
      },
      buscar: function (id) {
        return find(this.raiz, id);
      },
    };
  };

  specialFactories.cena_empacotada = function (root, meta) {
    return {
      tipo_recurso: "cena_empacotada",
      raiz: root || null,
      meta: isPlainObject(meta) ? Object.assign({}, meta) : {},
      serializar: function () {
        return JSON.stringify(this.raiz, null, 2);
      },
      instanciar: function () {
        return JSON.parse(JSON.stringify(this.raiz));
      },
    };
  };

  specialFactories.tilemap = function (config) {
    var cfg = isPlainObject(config) ? Object.assign({}, config) : {};
    return createNodeRecord("TileMap", cfg.nome || "TileMap", cfg, {
      x: 0,
      y: 0,
      largura_mapa: cfg.largura_mapa || 16,
      altura_mapa: cfg.altura_mapa || 10,
      tamanho_tile: cfg.tamanho_tile || 16,
      tiles: Array.isArray(cfg.tiles) ? cfg.tiles.slice() : [],
      paleta: isPlainObject(cfg.paleta) ? Object.assign({}, cfg.paleta) : {
        0: "#22303d",
        1: "#355c4d",
        2: "#5c4d35",
      },
    });
  };

  specialFactories.animacao = function (name, tracks, duration) {
    return {
      tipo_recurso: "animacao",
      nome: name || "animacao",
      duracao: duration || 1,
      trilhas: Array.isArray(tracks) ? tracks.slice() : [],
    };
  };

  specialFactories.animador = function (config) {
    var cfg = isPlainObject(config) ? Object.assign({}, config) : {};
    return {
      tipo_recurso: "animador",
      animacoes: Array.isArray(cfg.animacoes) ? cfg.animacoes.slice() : [],
      atual: cfg.atual || null,
      tempo: 0,
      tocando: !!cfg.tocando,
    };
  };

  specialFactories.bus_audio = function (name, volume) {
    return {
      tipo_recurso: "bus_audio",
      nome: name || "Master",
      volume: volume == null ? 1 : Number(volume),
      mute: false,
    };
  };

  specialFactories.mapa_entrada = function (config) {
    return {
      tipo_recurso: "mapa_entrada",
      acoes: isPlainObject(config) ? Object.assign({}, config) : {},
    };
  };

  specialFactories.configuracao_projeto = function (config) {
    var cfg = isPlainObject(config) ? Object.assign({}, config) : {};
    return {
      tipo_recurso: "configuracao_projeto",
      valores: cfg,
      obter: function (key, fallback) {
        return hasOwn(this.valores, key) ? this.valores[key] : fallback;
      },
      definir: function (key, value) {
        this.valores[key] = value;
        return value;
      },
    };
  };

  specialFactories.gerenciador_projeto = function (projects) {
    return {
      tipo_recurso: "gerenciador_projeto",
      projetos: Array.isArray(projects) ? projects.slice() : [],
      adicionar: function (project) {
        this.projetos.push(project);
        return this.projetos.length;
      },
    };
  };

  specialFactories.painel_dock = function (name, config) {
    return stableObject({
      tipo_recurso: "painel_dock",
      nome: name || "Dock",
      aberto: true,
      area: "left",
    }, isPlainObject(config) ? config : null);
  };

  specialFactories.dock = specialFactories.painel_dock;

  specialFactories.inspetor = function (target) {
    return {
      tipo_recurso: "inspetor",
      alvo: target || null,
      campos: target && typeof target === "object" ? Object.keys(target) : [],
    };
  };

  specialFactories.plugin_editor = function (config) {
    var cfg = isPlainObject(config) ? Object.assign({}, config) : {};
    return {
      tipo_recurso: "plugin_editor",
      nome: cfg.nome || "plugin_editor",
      ativo: cfg.ativo !== false,
      versao: cfg.versao || "0.1.0",
      hooks: Array.isArray(cfg.hooks) ? cfg.hooks.slice() : [],
    };
  };

  specialFactories.cor = function (value) {
    return {
      tipo_recurso: "cor",
      valor: String(value == null ? "#000000" : value),
    };
  };

  specialFactories.asset = function (name, source) {
    return {
      tipo_recurso: "asset",
      nome: name || "asset",
      fonte: source === undefined ? null : shallowClone(source),
    };
  };

  specialFactories.estado_jogo = function (value) {
    return {
      tipo_recurso: "estado_jogo",
      valor: shallowClone(value),
      salvo_em_ms: nowMs(),
    };
  };

  specialFactories.placar = function (entries) {
    return {
      tipo_recurso: "placar",
      entradas: Array.isArray(entries) ? entries.slice() : [],
    };
  };

  specialFactories.inventario = function (items) {
    return {
      tipo_recurso: "inventario",
      itens: Array.isArray(items) ? items.slice() : [],
    };
  };

  function sanitizeNamePart(value) {
    return String(value == null ? "" : value)
      .replace(/[^a-zA-Z0-9._-]+/g, "_")
      .replace(/^_+|_+$/g, "") || ("item_" + nowMs());
  }

  function compileSignaturePattern(pattern) {
    if (pattern && pattern.tipo_recurso === "assinatura_binaria") {
      return pattern.padrao_bytes;
    }
    return toBytes(pattern);
  }

  function buildBinarySignature(name, pattern, meta) {
    return {
      tipo_recurso: "assinatura_binaria",
      nome: name || "assinatura",
      padrao_bytes: compileSignaturePattern(pattern),
      meta: isPlainObject(meta) ? Object.assign({}, meta) : {},
    };
  }

  function buildHeuristic(name, rule, meta) {
    return {
      tipo_recurso: "heuristica",
      nome: name || "heuristica",
      regra: rule,
      meta: isPlainObject(meta) ? Object.assign({}, meta) : {},
    };
  }

  function signatureMatches(signature, bytes) {
    var pattern = compileSignaturePattern(signature.padrao_bytes || signature.padrao || signature);
    if (!pattern.length) {
      return false;
    }
    return bytesIndexOf(bytes, pattern) >= 0;
  }

  function heuristicMatches(heuristic, bytes, text, context) {
    if (heuristic == null) {
      return false;
    }
    if (typeof heuristic.regra === "function") {
      return !!heuristic.regra(bytes, text, context);
    }
    if (heuristic.regra instanceof RegExp) {
      return heuristic.regra.test(text);
    }
    if (typeof heuristic.regra === "string") {
      return text.indexOf(heuristic.regra) >= 0;
    }
    if (isPlainObject(heuristic.regra)) {
      if (heuristic.regra.extensao && extensionOf(context.caminho || "") === String(heuristic.regra.extensao).replace(/^\./, "")) {
        return true;
      }
      if (heuristic.regra.tipo_arquivo && heuristic.regra.tipo_arquivo === context.tipo_arquivo) {
        return true;
      }
    }
    return false;
  }

  function loadDatabaseSpec(source) {
    if (isPlainObject(source)) {
      return okResult(source);
    }
    if (typeof source !== "string") {
      return errorResult("fonte_invalida", "fonte de banco precisa ser objeto, caminho ou URL");
    }
    if (/^https?:\/\//i.test(source)) {
      var fetched = urlGetHost(source, { binary: false });
      if (!fetched.ok) {
        return fetched;
      }
      try {
        return okResult(JSON.parse(fetched.valor.resposta), {
          origem: source,
          tipo: "url",
        });
      } catch (err) {
        return errorResult("banco_invalido", String(err), {
          origem: source,
        });
      }
    }
    return readJsonHost(source);
  }

  function createWorkspace(root, config) {
    var resolvedRoot = resolveHostPath(typeof root === "string" ? root : ".");
    var wsConfig = isPlainObject(config) ? Object.assign({}, config) : {};

    function localPath(rel) {
      if (!rel) {
        return resolvedRoot;
      }
      return resolveHostPath(joinPath(resolvedRoot, rel));
    }

    return {
      tipo_recurso: "workspace",
      raiz: resolvedRoot,
      configuracao: wsConfig,
      caminho: localPath,
      listar: function (rel) {
        return readdirHost(localPath(rel || "."));
      },
      existe: function (rel) {
        return existsHost(localPath(rel));
      },
      stat: function (rel) {
        return statHost(localPath(rel), false);
      },
      criar_diretorio: function (rel, recursive) {
        return mkdirHost(localPath(rel || "."), recursive !== false);
      },
      ler_texto: function (rel) {
        return readTextHost(localPath(rel));
      },
      escrever_texto: function (rel, text) {
        var target = localPath(rel);
        var parent = dirnamePath(target);
        mkdirHost(parent, true);
        return writeTextHost(target, text);
      },
      ler_json: function (rel) {
        return readJsonHost(localPath(rel));
      },
      escrever_json: function (rel, value) {
        var target = localPath(rel);
        var parent = dirnamePath(target);
        mkdirHost(parent, true);
        return writeJsonHost(target, value);
      },
      remover: function (rel) {
        return removeHost(localPath(rel));
      },
      renomear: function (origem, destino) {
        return renameHost(localPath(origem), localPath(destino));
      },
      executar: function (args, options) {
        var opts = isPlainObject(options) ? Object.assign({}, options) : {};
        opts.cwd = resolvedRoot;
        if (opts.capturar) {
          return popenCaptureHost(args, opts);
        }
        return execHost(args, opts);
      },
    };
  }

  function createService(config) {
    var cfg = isPlainObject(config) ? Object.assign({}, config) : {};
    var service = {
      tipo_recurso: "servico",
      nome: cfg.nome || "servico",
      comando: Array.isArray(cfg.comando) ? cfg.comando.slice() : [],
      cwd: cfg.cwd ? resolveHostPath(cfg.cwd) : null,
      env: isPlainObject(cfg.env) ? Object.assign({}, cfg.env) : null,
      pid: null,
      ativo: false,
      ultimo_status: null,
    };

    service.iniciar = function () {
      var res;
      if (!this.comando.length) {
        return errorResult("comando_ausente", "servico precisa de comando");
      }
      if (this.ativo && this.pid) {
        return okResult({
          pid: this.pid,
          ativo: true,
        });
      }
      res = execHost(this.comando, {
        block: false,
        cwd: this.cwd,
        env: this.env,
      });
      if (res.ok) {
        this.pid = res.valor.pid;
        this.ativo = true;
        this.ultimo_status = null;
      }
      return res;
    };

    service.status = function () {
      var res;
      if (!this.pid) {
        return okResult({
          nome: this.nome,
          ativo: false,
          pid: null,
          status: this.ultimo_status,
        });
      }
      res = waitPidHost(this.pid, true);
      if (res.ok && res.valor.concluido) {
        this.ativo = false;
        this.ultimo_status = res.valor.status;
      } else if (res.ok && res.valor.ativo) {
        this.ativo = true;
      }
      return okResult({
        nome: this.nome,
        ativo: this.ativo,
        pid: this.pid,
        status: this.ultimo_status,
      });
    };

    service.aguardar = function () {
      var res;
      if (!this.pid) {
        return errorResult("pid_ausente", "servico nao foi iniciado");
      }
      res = waitPidHost(this.pid, false);
      if (res.ok) {
        this.ativo = false;
        this.ultimo_status = res.valor.status;
      }
      return res;
    };

    service.parar = function (signalNumber) {
      if (!this.pid) {
        return okResult({
          ativo: false,
          pid: null,
        });
      }
      return killHost(this.pid, signalNumber);
    };

    return service;
  }

  function createScanEngine(config) {
    var cfg = isPlainObject(config) ? Object.assign({}, config) : {};
    var engine = {
      tipo_recurso: "motor_varredura",
      assinaturas: [],
      heuristicas: [],
      configuracao: cfg,
      quarentena: null,
    };

    engine.adicionar_assinatura = function (signature) {
      var sig = signature && signature.tipo_recurso === "assinatura_binaria" ?
        signature :
        buildBinarySignature(signature && signature.nome, signature && (signature.padrao || signature), signature && signature.meta);
      this.assinaturas.push(sig);
      return this.assinaturas.length;
    };

    engine.adicionar_heuristica = function (heuristic) {
      var h = heuristic && heuristic.tipo_recurso === "heuristica" ?
        heuristic :
        buildHeuristic(heuristic && heuristic.nome, heuristic && (heuristic.regra || heuristic), heuristic && heuristic.meta);
      this.heuristicas.push(h);
      return this.heuristicas.length;
    };

    engine.configurar_quarentena = function (dir) {
      this.quarentena = specialFactories.quarentena(dir);
      return this.quarentena;
    };

    engine.varrer_bytes = function (value, context) {
      var ctx = isPlainObject(context) ? Object.assign({}, context) : {};
      var bytes = toBytes(value);
      var typeName = ctx.tipo_arquivo || detectFileType(bytes, ctx.caminho || "");
      var text = "";
      var matches = [];
      var suspicious = [];
      try {
        text = Array.from(bytes).map(function (item) {
          return String.fromCharCode(item);
        }).join("");
      } catch (err) {
        text = "";
      }

      this.assinaturas.forEach(function (sig) {
        if (signatureMatches(sig, bytes)) {
          matches.push({
            tipo: "assinatura",
            nome: sig.nome,
          });
        }
      });

      this.heuristicas.forEach(function (heuristic) {
        if (heuristicMatches(heuristic, bytes, text, {
          caminho: ctx.caminho || null,
          tipo_arquivo: typeName,
        })) {
          matches.push({
            tipo: "heuristica",
            nome: heuristic.nome,
          });
        }
      });

      if (typeName === "executavel_windows" || typeName === "executavel_elf") {
        suspicious.push("executavel");
      }

      return okResult({
        caminho: ctx.caminho || null,
        tipo_arquivo: typeName,
        tamanho_bytes: bytes.length,
        hash_fnv1a: fnv1aHex(bytes),
        correspondencias: matches,
        suspeitas: suspicious,
        veredicto: matches.length ? "detectado" : (suspicious.length ? "suspeito" : "limpo"),
      });
    };

    engine.varrer = function (target) {
      if (typeof target === "string") {
        return this.varrer_arquivo(target);
      }
      return this.varrer_bytes(target, {});
    };

    engine.varrer_arquivo = function (path) {
      if (!existsHost(path)) {
        return errorResult("arquivo_ausente", "arquivo nao encontrado: " + path);
      }
      return this.varrer_bytes(ler_bytes(path), {
        caminho: resolveHostPath(path),
      });
    };

    engine.scan_fluxo = function (target) {
      return this.varrer(target);
    };

    engine.isolar = function (path, nome) {
      if (!this.quarentena) {
        this.configurar_quarentena(cfg.quarentena || ".gatocore/quarentena");
      }
      return this.quarentena.isolar(path, nome);
    };

    engine.restaurar = function (entry, destino) {
      if (!this.quarentena) {
        return errorResult("quarentena_ausente", "motor nao possui quarentena configurada");
      }
      return this.quarentena.restaurar(entry, destino);
    };

    if (Array.isArray(cfg.assinaturas)) {
      cfg.assinaturas.forEach(function (sig) {
        engine.adicionar_assinatura(sig);
      });
    }
    if (Array.isArray(cfg.heuristicas)) {
      cfg.heuristicas.forEach(function (heuristic) {
        engine.adicionar_heuristica(heuristic);
      });
    }
    if (cfg.quarentena) {
      engine.configurar_quarentena(cfg.quarentena);
    }

    return engine;
  }

  function createNodeRecord(typeName, name, config, defaults) {
    var cfg = isPlainObject(config) ? Object.assign({}, config) : {};
    var node = stableObject({
      tipo_recurso: "no",
      tipo_no: typeName,
      id: cfg.id || (sanitizeNamePart(typeName.toLowerCase()) + "_" + nowMs()),
      nome: name || typeName,
      visivel: cfg.visivel !== false,
      filhos: Array.isArray(cfg.filhos) ? cfg.filhos.slice() : [],
    }, defaults || {});

    Object.keys(cfg).forEach(function (key) {
      if (key !== "filhos") {
        node[key] = shallowClone(cfg[key]);
      }
    });

    node.adicionar_filho = function (child) {
      this.filhos.push(child);
      return child;
    };
    node.remover_filho = function (childId) {
      var removed = null;
      this.filhos = this.filhos.filter(function (item) {
        if (item && item.id === childId) {
          removed = item;
          return false;
        }
        return true;
      });
      return removed;
    };
    return node;
  }

  specialFactories.abrir = function (path, mode) {
    var resolved;
    var stat;
    var content;
    if (typeof path !== "string") {
      return typedRecord({
        termo: "abrir",
        classe: "verbo",
        camada: "runtime",
        uso_tecnico: "abre recurso persistente",
      }, arguments);
    }
    resolved = resolveHostPath(path);
    stat = statHost(resolved, false);
    if (!stat.ok) {
      return stat;
    }
    if (hasOsHost() && (stat.valor.mode & os.S_IFMT) === os.S_IFDIR) {
      return createWorkspace(resolved, { modo: mode || "rw" });
    }
    content = readTextHost(resolved);
    return okResult({
      tipo_recurso: "arquivo_aberto",
      caminho: resolved,
      modo: mode || "r",
      texto: content.ok ? content.valor : null,
      leitura_ok: content.ok,
      stat: stat.valor,
    });
  };

  specialFactories.workspace = function (root, config) {
    return createWorkspace(root, config);
  };

  specialFactories.segredo = function (name, fallback) {
    var value = getenvHost(name);
    if (value === undefined || value === null) {
      if (fallback !== undefined) {
        return okResult(fallback, {
          nome: String(name),
          fonte: "fallback",
        });
      }
      return errorResult("segredo_ausente", "segredo nao encontrado", {
        nome: String(name),
      });
    }
    return okResult(value, {
      nome: String(name),
      fonte: "env",
    });
  };

  specialFactories.autenticar = function (provided, expected) {
    if (isPlainObject(provided)) {
      expected = provided.esperado;
      provided = provided.token;
    }
    if (typeof expected === "string" && expected.indexOf("env:") === 0) {
      expected = getenvHost(expected.slice(4));
    }
    return okResult(provided === expected, {
      autenticado: provided === expected,
    });
  };

  specialFactories.autorizar = function (subject, action, policy) {
    var allowed = false;
    if (Array.isArray(policy)) {
      allowed = policy.indexOf(action) >= 0;
    } else if (isPlainObject(policy) && Array.isArray(policy.acoes)) {
      allowed = policy.acoes.indexOf(action) >= 0;
    } else if (subject && Array.isArray(subject.capacidades)) {
      allowed = subject.capacidades.indexOf(action) >= 0;
    }
    return okResult(allowed, {
      autorizado: allowed,
      acao: action,
    });
  };

  specialFactories.canal_mensagem = function (name) {
    var queue = specialFactories.fila();
    queue.tipo_recurso = "canal_mensagem";
    queue.nome = name || "canal";
    queue.enviar = function (value) {
      this.empurrar(makeEvent(this.nome, [value]));
      return this.tamanho();
    };
    queue.receber = function () {
      return this.tirar();
    };
    return queue;
  };

  specialFactories.workflow = function (config) {
    var steps = Array.isArray(config) ? config.slice() : (config && Array.isArray(config.etapas) ? config.etapas.slice() : []);
    return {
      tipo_recurso: "workflow",
      nome: config && config.nome ? config.nome : "workflow",
      etapas: steps,
      executar: function (input) {
        return steps.reduce(function (acc, step) {
          if (typeof step === "function") {
            return step(acc);
          }
          if (step && typeof step.executar === "function") {
            return step.executar(acc);
          }
          return acc;
        }, input);
      },
    };
  };

  specialFactories.skill = function (config) {
    var cfg = isPlainObject(config) ? Object.assign({}, config) : {};
    return {
      tipo_recurso: "skill",
      nome: cfg.nome || "skill",
      dominio: cfg.dominio || null,
      executar: typeof cfg.executar === "function" ? cfg.executar : function (input) { return input; },
      configuracao: cfg,
    };
  };

  specialFactories.gateway = function (config) {
    var cfg = isPlainObject(config) ? Object.assign({}, config) : {};
    var routes = Object.create(null);
    return {
      tipo_recurso: "gateway",
      nome: cfg.nome || "gateway",
      rotas: routes,
      registrar_rota: function (path, handler) {
        routes[String(path)] = handler;
        return Object.keys(routes).length;
      },
      resolver: function (path, payload) {
        if (!hasOwn(routes, String(path))) {
          return errorResult("rota_ausente", "rota nao encontrada", {
            rota: String(path),
          });
        }
        if (typeof routes[String(path)] === "function") {
          return routes[String(path)](payload);
        }
        return routes[String(path)];
      },
    };
  };

  specialFactories.job = function (config) {
    var cfg = isPlainObject(config) ? Object.assign({}, config) : {};
    return {
      tipo_recurso: "job",
      nome: cfg.nome || "job",
      comando: Array.isArray(cfg.comando) ? cfg.comando.slice() : null,
      executar: function (input) {
        if (typeof cfg.executar === "function") {
          return cfg.executar(input);
        }
        if (this.comando) {
          if (cfg.capturar) {
            return popenCaptureHost(this.comando, cfg);
          }
          return execHost(this.comando, cfg);
        }
        return okResult(input, {
          nome: this.nome,
        });
      },
    };
  };

  specialFactories.servico = function (config) {
    return createService(config);
  };

  specialFactories.sandbox = function (config) {
    var cfg = isPlainObject(config) ? Object.assign({}, config) : {};
    var allowed = Array.isArray(cfg.comandos_permitidos) ? cfg.comandos_permitidos.slice() : null;
    return {
      tipo_recurso: "sandbox",
      configuracao: cfg,
      executar: function (args, options) {
        var argv = Array.isArray(args) ? args.slice() : [args];
        if (allowed && argv.length && allowed.indexOf(String(argv[0])) < 0) {
          return errorResult("comando_bloqueado", "comando nao permitido pela sandbox", {
            comando: String(argv[0]),
          });
        }
        return execHost(argv, options);
      },
    };
  };

  specialFactories.runtime_docker = function (config) {
    var cfg = isPlainObject(config) ? Object.assign({}, config) : {};
    return {
      tipo_recurso: "runtime_docker",
      configuracao: cfg,
      verificar: function () {
        return popenCaptureHost(["docker", "--version"]);
      },
      executar: function (image, args) {
        var argv = ["docker", "run", "--rm", String(image)];
        if (Array.isArray(args)) {
          Array.prototype.push.apply(argv, args);
        }
        return execHost(argv, cfg);
      },
    };
  };

  specialFactories.assinatura_binaria = function (name, pattern, meta) {
    return buildBinarySignature(name, pattern, meta);
  };

  specialFactories.heuristica = function (name, rule, meta) {
    return buildHeuristic(name, rule, meta);
  };

  specialFactories.hash_bloco = function (value) {
    return fnv1aHex(toBytes(value));
  };

  specialFactories.quarentena = function (dir) {
    var root = resolveHostPath(dir || ".gatocore/quarentena");
    var stateQ = {
      registros: [],
    };
    return {
      tipo_recurso: "quarentena",
      diretorio: root,
      registros: stateQ.registros,
      preparar: function () {
        return mkdirHost(root, true);
      },
      listar: function () {
        return readdirHost(root);
      },
      isolar: function (path, alias) {
        var targetName = alias ? sanitizeNamePart(alias) : sanitizeNamePart(path);
        var dest = joinPath(root, targetName);
        var prep = this.preparar();
        var moved;
        if (!prep.ok) {
          return prep;
        }
        moved = renameHost(path, dest);
        if (moved.ok) {
          stateQ.registros.push({
            origem: resolveHostPath(path),
            destino: dest,
          });
        }
        return moved;
      },
      restaurar: function (entry, destination) {
        var source = typeof entry === "string" ? entry : (entry && entry.destino ? entry.destino : null);
        var target = destination || (entry && entry.origem ? entry.origem : null);
        if (!source || !target) {
          return errorResult("restauracao_invalida", "entrada de restauracao invalida");
        }
        return renameHost(source, target);
      },
    };
  };

  specialFactories.restaurar_quarentena = function (entry, destination, quarantineResource) {
    var quarantine = quarantineResource && quarantineResource.tipo_recurso === "quarentena" ?
      quarantineResource :
      specialFactories.quarentena(".gatocore/quarentena");
    return quarantine.restaurar(entry, destination);
  };

  specialFactories.motor_varredura = function (config) {
    return createScanEngine(config);
  };

  specialFactories.atualizar_banco = function (source, target) {
    var loaded = loadDatabaseSpec(source);
    var engine = target && target.tipo_recurso === "motor_varredura" ? target : null;
    var signatures = [];
    var heuristics = [];
    if (!loaded.ok) {
      return loaded;
    }
    if (Array.isArray(loaded.valor.assinaturas)) {
      signatures = loaded.valor.assinaturas.map(function (sig) {
        return buildBinarySignature(sig.nome, sig.padrao || sig.bytes || sig.texto || "", sig.meta);
      });
    }
    if (Array.isArray(loaded.valor.heuristicas)) {
      heuristics = loaded.valor.heuristicas.map(function (heuristic) {
        return buildHeuristic(heuristic.nome, heuristic.regra || heuristic.regex || heuristic.texto || "", heuristic.meta);
      });
    }
    if (engine) {
      signatures.forEach(function (sig) {
        engine.adicionar_assinatura(sig);
      });
      heuristics.forEach(function (heuristic) {
        engine.adicionar_heuristica(heuristic);
      });
    }
    return okResult({
      assinaturas: signatures,
      heuristicas: heuristics,
      total_assinaturas: signatures.length,
      total_heuristicas: heuristics.length,
      aplicado: !!engine,
    });
  };

  specialFactories.scan_fluxo = function (engineOrTarget, maybeTarget) {
    if (engineOrTarget && engineOrTarget.tipo_recurso === "motor_varredura") {
      return engineOrTarget.scan_fluxo(maybeTarget);
    }
    return specialFactories.varrer(engineOrTarget);
  };

  function createFunction(entry) {
    if (hasOwn(specialFactories, entry.termo)) {
      return specialFactories[entry.termo];
    }

    if (hasOwn(state.construtores, entry.termo)) {
      return state.construtores[entry.termo];
    }

    if (entry.classe === "verbo") {
      return function () {
        return callOperation(entry, toArray(arguments));
      };
    }

    if (entry.classe === "evento") {
      return function () {
        return makeEvent(entry.termo, toArray(arguments));
      };
    }

    if (entry.classe === "politica") {
      return function () {
        if (hasOwn(state.politicas, entry.termo)) {
          return state.politicas[entry.termo].apply(null, arguments);
        }
        return makePolicy(entry.termo, toArray(arguments));
      };
    }

    return function () {
      return typedRecord(entry, toArray(arguments));
    };
  }

  function parseDictionary(text) {
    return String(text)
      .split(/\r?\n/)
      .map(function (line) {
        return line.trim();
      })
      .filter(function (line) {
        return line.indexOf("|") === 0;
      })
      .map(function (line) {
        var parts = line.split("|").slice(1, -1).map(trim);
        if (parts.length < 5) {
          return null;
        }
        if (parts[0].indexOf("`") !== 0) {
          return null;
        }
        var entry = {
          termo: withoutTicks(parts[0]),
          classe: trim(parts[1]),
          camada: trim(parts[2]),
          uso_tecnico: trim(parts[3]),
          forma_sugerida: withoutTicks(parts[4]),
        };
        if (!KNOWN_CLASSES[entry.classe]) {
          return null;
        }
        return entry;
      })
      .filter(Boolean);
  }

  function registerEntry(entry) {
    var fn = createFunction(entry);
    Object.defineProperty(fn, "__gatocore_term", {
      value: entry.termo,
      configurable: true,
    });
    Object.defineProperty(fn, "__gatocore_class", {
      value: entry.classe,
      configurable: true,
    });
    Object.defineProperty(fn, "__gatocore_stdlib", {
      value: true,
      configurable: true,
    });
    state.termos[entry.termo] = entry;
    global[entry.termo] = fn;
  }

  function loadDictionaryTerms() {
    var text;
    try {
      text = ler_texto("../docs/lista_palavras.md");
      state.origem_dicionario = "../docs/lista_palavras.md";
      return parseDictionary(text);
    } catch (err) {
      state.origem_dicionario = "indisponivel";
      registryLog("erro_dicionario", String(err));
      return [];
    }
  }

  global.gatocore = gatocore;
  global.__gatocore_stdlib_loaded = true;

  loadDictionaryTerms().forEach(registerEntry);
})(globalThis);
