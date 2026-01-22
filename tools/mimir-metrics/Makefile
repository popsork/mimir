GO ?= go
BINARY ?= mimir-metrics

.PHONY: all build run dry-run dry-run-once tidy fmt vet test clean

all: build

build:
	$(GO) build -o $(BINARY) ./cmd/mimir-metrics

run:
	$(GO) run ./cmd/mimir-metrics

dry-run:
	$(GO) run ./cmd/mimir-metrics -dry-run

dry-run-once:
	$(GO) run ./cmd/mimir-metrics -dry-run-once

tidy:
	$(GO) mod tidy

fmt:
	$(GO) fmt ./...

vet:
	$(GO) vet ./...

test:
	$(GO) test ./...

clean:
	rm -f $(BINARY)
