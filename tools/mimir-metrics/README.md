# mimir-metrics

Cross-platform metrics agent that publishes system metrics over MQTT.

## Payloads

Metrics are sent as one topic per metric:

- Default topic template: `metrics/$host/$device/$metric`
- Example topic: `metrics/my-host/cpu/usage`
- Payload (JSON): `{"value":65.2,"ts":1736451234567,"unit":"C","source":"nvml"}`

Status uses a retained topic for LWT/birth:

- Topic: `status/$host`
- Birth payload: `{"status":"online","ts":1736451234567}`
- LWT payload: `{"status":"offline","ts":1736451234567}`

## Config

See `config.example.yaml` for all fields. CLI flags override config values.

Example:

```bash
mimir-metrics -broker tcp://localhost:1883 -interval 5
```

To print MQTT topics/payloads without publishing:

```bash
mimir-metrics -dry-run
```

To print one collection cycle and exit:

```bash
mimir-metrics -dry-run-once
```

## Current providers

- CPU usage percent (gopsutil)
- Memory used/total/percent (gopsutil)
- Swap used/total/percent (gopsutil)
- Disk used/total/percent (gopsutil)
- Disk IO read/write bytes/ops/time (gopsutil)
- Network IO bytes/packets/errors/drops (gopsutil)
- System load/uptime/boot/process count (gopsutil)
- NVIDIA GPU temps/power/VRAM/usage on Linux (NVML)
- Intel GPU provider stub on Windows (hook Intel Metrics Discovery SDK)
- Linux CPU temps + fan RPM via hwmon/thermal sysfs
- macOS CPU temps via AppleSMC (SMC keys)

## Metric naming

Metrics are normalized across platforms with the same device/metric names. GPU
devices are reported as `gpu0`, `gpu1`, etc:

- `cpu/usage` (percent)
- `cpu/temp` (C)
- `gpuN/usage` (percent)
- `gpuN/temp` (C)
- `gpuN/power` (W)
- `gpuN/vram_used` (bytes)
- `gpuN/vram_total` (bytes)
- `mem/usage` (percent)
- `mem/used` (bytes)
- `mem/total` (bytes)
- `swap/usage` (percent)
- `swap/used` (bytes)
- `swap/total` (bytes)
- `disk/usage` (percent)
- `disk/used` (bytes)
- `disk/total` (bytes)
- `diskio/read_bytes` (bytes)
- `diskio/write_bytes` (bytes)
- `diskio/read_ops` (ops)
- `diskio/write_ops` (ops)
- `diskio/read_time_ms` (ms)
- `diskio/write_time_ms` (ms)
- `diskio/io_time_ms` (ms)
- `net/bytes_in` (bytes)
- `net/bytes_out` (bytes)
- `net/packets_in` (packets)
- `net/packets_out` (packets)
- `net/errors_in` (count)
- `net/errors_out` (count)
- `net/drops_in` (count)
- `net/drops_out` (count)
- `system/load1` (load)
- `system/load5` (load)
- `system/load15` (load)
- `system/uptime` (seconds)
- `system/boot_time` (unix_seconds)
- `system/processes` (count)
- `fan/rpm` (max RPM)

## GPU dependencies

- Linux NVIDIA: NVML (bundled with NVIDIA driver)
- Windows Intel: integrate Intel Metrics Discovery SDK for temps/power/VRAM

## Intel MD scaffolding

The Windows Intel provider has a build-tagged scaffold. Build with `-tags intelmd`
and replace the stub C wrapper with real Intel Metrics Discovery SDK calls:

- `internal/providers/gpu/intel/mdapi_wrapper.h`
- `internal/providers/gpu/intel/mdapi_wrapper.c`

## Build

```bash
go build ./cmd/mimir-metrics
```
