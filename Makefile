.PHONY: build test native-test repl demo run eval ir asm native-build native-run jit bench snake gatod termos install-local uninstall-local

FILE ?=
CODE ?=
ITERATIONS ?= 100
OUTPUT ?=

build:
	$(MAKE) -C engines/quickjs qjs

test: build
	./tools/test_pt.sh
	./tools/test_cli.sh
	./tools/test_native.sh

native-test: build
	./tools/test_native.sh

repl: build
	./bin/gatocore repl

demo: build
	./tools/demo_examples.sh

run: build
	./bin/gatocore "$(FILE)"

eval: build
	./bin/gatocore eval "$(CODE)"

ir: build
	./bin/gatocore ir "$(FILE)" $(if $(OUTPUT),"$(OUTPUT)")

asm: build
	./bin/gatocore asm "$(FILE)" $(if $(OUTPUT),"$(OUTPUT)")

native-build: build
	./bin/gatocore native-build "$(FILE)" $(if $(OUTPUT),"$(OUTPUT)")

native-run: build
	./bin/gatocore native-run "$(FILE)"

jit: build
	./bin/gatocore jit "$(FILE)"

bench: build
	./tools/benchmark_pt.sh "$(FILE)" "$(ITERATIONS)"

snake: build
	./bin/gatocore samples/snakegame.ptjs

gatod: build
	./bin/gatocore samples/gatod_engine/src/main.ptjs editor

termos: build
	./bin/gatocore termos

install-local:
	mkdir -p "$(HOME)/.local/bin"
	ln -sf "$(CURDIR)/bin/gatocore" "$(HOME)/.local/bin/gatocore"

uninstall-local:
	rm -f "$(HOME)/.local/bin/gatocore"
