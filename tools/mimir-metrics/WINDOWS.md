# Windows setup

This document describes what to do on a Windows machine to enable Intel GPU
metrics (temps, power, VRAM, utilization) using the Intel Metrics Discovery SDK.

## Prereqs

- Go toolchain with CGO enabled.
- C/C++ build tools (Visual Studio Build Tools or similar).
- Intel Metrics Discovery SDK installed locally.

## Steps

1) Install the Intel Metrics Discovery SDK and note its root folder (the path
   that contains `include/` and `lib/`).
2) Run the helper script to set `INTEL_MD_SDK` and get the library name:

```powershell
scripts\intel-md-env.ps1 -Root "C:\path\to\sdk"
```

3) Set CGO include and lib paths before building:

```powershell
$env:CGO_CFLAGS = "-IC:\path\to\sdk\include"
$env:CGO_LDFLAGS = "-LC:\path\to\sdk\lib"
```

4) Update the `-l` name in `internal/providers/gpu/intel/intel_md_windows.go`
   to match the SDK `.lib` filename (without the `.lib` extension). The
   default is `igdmd64` for 64-bit builds.
4) Implement the C wrapper in `internal/providers/gpu/intel/mdapi_wrapper.c`
   using the SDK headers. Replace the stub functions:
   - `mdapi_init()`
   - `mdapi_device_count()`
   - `mdapi_device_metrics()`
   - `mdapi_shutdown()`
5) Build with the Intel tag:

```powershell
go build -tags intelmd ./cmd/mimir-metrics
```

## Notes

- The Intel provider is disabled unless built with `-tags intelmd`.
- Metrics expected by the Go layer:
  - `temp`
  - `power`
  - `vram_used`
  - `vram_total`
  - `usage`
