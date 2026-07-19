#include <stdint.h>
#include <stdio.h>
#include <string.h>

typedef struct {
  int64_t length;
  int64_t element_tag;
  const int64_t *items;
} ptjs_array_t;

enum {
  PTJS_TAG_I64 = 1,
  PTJS_TAG_STR = 2,
  PTJS_TAG_BOOL = 3,
  PTJS_TAG_NULL = 4,
  PTJS_TAG_ARRAY = 5
};

static uint32_t ptjs_hash_bytes(const unsigned char *bytes) {
  uint32_t hash = 0x811c9dc5u;
  while (*bytes) {
    hash ^= (uint32_t)(*bytes++);
    hash *= 0x01000193u;
  }
  return hash;
}

static const char *ptjs_tag_name(int64_t tag) {
  switch (tag) {
    case PTJS_TAG_I64:
      return "numero";
    case PTJS_TAG_STR:
      return "texto";
    case PTJS_TAG_BOOL:
      return "booleano";
    case PTJS_TAG_NULL:
      return "nulo";
    case PTJS_TAG_ARRAY:
      return "lista";
    default:
      return "objeto";
  }
}

static void ptjs_write_escaped_quoted(const char *text) {
  const unsigned char *ptr = (const unsigned char *)(text ? text : "");
  putchar('"');
  while (*ptr) {
    switch (*ptr) {
      case '\\':
        fputs("\\\\", stdout);
        break;
      case '"':
        fputs("\\\"", stdout);
        break;
      case '\n':
        fputs("\\n", stdout);
        break;
      case '\r':
        fputs("\\r", stdout);
        break;
      case '\t':
        fputs("\\t", stdout);
        break;
      default:
        putchar((int)(*ptr));
        break;
    }
    ptr++;
  }
  putchar('"');
}

static void ptjs_write_value_inline(int64_t raw, int64_t tag);

static void ptjs_write_array_inline(const ptjs_array_t *array) {
  int64_t index;
  if (!array) {
    fputs("null", stdout);
    return;
  }
  putchar('[');
  for (index = 0; index < array->length; index++) {
    if (index > 0) {
      fputs(", ", stdout);
    }
    ptjs_write_value_inline(array->items[index], array->element_tag);
  }
  putchar(']');
}

static void ptjs_write_value_inline(int64_t raw, int64_t tag) {
  switch (tag) {
    case PTJS_TAG_I64:
      printf("%lld", (long long)raw);
      break;
    case PTJS_TAG_STR:
      ptjs_write_escaped_quoted((const char *)(intptr_t)raw);
      break;
    case PTJS_TAG_BOOL:
      fputs(raw ? "true" : "false", stdout);
      break;
    case PTJS_TAG_NULL:
      fputs("null", stdout);
      break;
    case PTJS_TAG_ARRAY:
      ptjs_write_array_inline((const ptjs_array_t *)(intptr_t)raw);
      break;
    default:
      fputs("<desconhecido>", stdout);
      break;
  }
}

void ptjs_print_i64(int64_t value) {
  printf("%lld\n", (long long)value);
}

void ptjs_print_bool(int64_t value) {
  puts(value ? "true" : "false");
}

void ptjs_print_null(int64_t value) {
  (void)value;
  puts("null");
}

void ptjs_print_str(const char *value) {
  ptjs_write_escaped_quoted(value);
  putchar('\n');
}

void ptjs_print_array(const ptjs_array_t *value) {
  ptjs_write_array_inline(value);
  putchar('\n');
}

int64_t ptjs_strlen(const char *value) {
  return value ? (int64_t)strlen(value) : 0;
}

int64_t ptjs_array_len(const ptjs_array_t *value) {
  return value ? value->length : 0;
}

int64_t ptjs_array_get_i64(const ptjs_array_t *value, int64_t index) {
  if (!value || index < 0 || index >= value->length) {
    return 0;
  }
  return value->items[index];
}

void *ptjs_array_get_ptr(const ptjs_array_t *value, int64_t index) {
  if (!value || index < 0 || index >= value->length) {
    return NULL;
  }
  return (void *)(intptr_t)value->items[index];
}

const char *ptjs_string_char_at(const char *value, int64_t index) {
  static char slots[16][8];
  static int next = 0;
  char *slot;
  unsigned char ch;
  if (!value || index < 0 || index >= (int64_t)strlen(value)) {
    return "";
  }
  slot = slots[next];
  next = (next + 1) % 16;
  ch = (unsigned char)value[index];
  slot[0] = (char)ch;
  slot[1] = '\0';
  return slot;
}

int64_t ptjs_observar_i64(int64_t value) {
  printf("[observar tipo=numero] %lld\n", (long long)value);
  return value;
}

int64_t ptjs_observar_bool(int64_t value) {
  printf("[observar tipo=booleano] %s\n", value ? "true" : "false");
  return value ? 1 : 0;
}

int64_t ptjs_observar_null(int64_t value) {
  (void)value;
  puts("[observar tipo=nulo] null");
  return 0;
}

const char *ptjs_observar_str(const char *value) {
  fputs("[observar tipo=texto] ", stdout);
  ptjs_write_escaped_quoted(value);
  putchar('\n');
  return value;
}

const ptjs_array_t *ptjs_observar_array(const ptjs_array_t *value) {
  fputs("[observar tipo=lista] ", stdout);
  ptjs_write_array_inline(value);
  putchar('\n');
  return value;
}

const char *ptjs_identificar_i64(int64_t value) {
  static char buffer[4][64];
  static int next = 0;
  char *slot = buffer[next];
  next = (next + 1) % 4;
  snprintf(slot, 64, "numero:%lld", (long long)value);
  return slot;
}

const char *ptjs_identificar_bool(int64_t value) {
  static char buffer[4][32];
  static int next = 0;
  char *slot = buffer[next];
  next = (next + 1) % 4;
  snprintf(slot, 32, "booleano:%s", value ? "true" : "false");
  return slot;
}

const char *ptjs_identificar_null(int64_t value) {
  (void)value;
  return "nulo";
}

const char *ptjs_identificar_str(const char *value) {
  static char buffer[4][96];
  static int next = 0;
  char *slot = buffer[next];
  const char *safe = value ? value : "";
  next = (next + 1) % 4;
  snprintf(
    slot,
    96,
    "texto:%zu:%08x",
    strlen(safe),
    ptjs_hash_bytes((const unsigned char *)safe)
  );
  return slot;
}

const char *ptjs_identificar_array(const ptjs_array_t *value) {
  static char buffer[4][96];
  static int next = 0;
  char *slot = buffer[next];
  int64_t length = value ? value->length : 0;
  int64_t tag = value ? value->element_tag : PTJS_TAG_NULL;
  next = (next + 1) % 4;
  snprintf(slot, 96, "lista:%lld:%s", (long long)length, ptjs_tag_name(tag));
  return slot;
}
