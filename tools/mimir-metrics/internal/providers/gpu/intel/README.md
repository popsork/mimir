# Intel GPU Metrics (Windows)

This provider is scaffolded behind the `intelmd` build tag and uses a C wrapper
that you must implement with the Intel Metrics Discovery SDK.

## Files

- `intel_windows.go`: default stub when not using `intelmd`
- `intel_md_windows.go`: cgo provider that calls the wrapper
- `mdapi_wrapper.h` / `mdapi_wrapper.c`: C wrapper stubs to replace with SDK calls

## Steps to wire the SDK

1) Add Intel Metrics Discovery SDK headers/libs to a local path, e.g.
   `third_party/intel-md/`.
2) Update `mdapi_wrapper.c` to include the SDK headers and implement:
   - `mdapi_init()`
   - `mdapi_device_count()`
   - `mdapi_device_metrics()`
   - `mdapi_shutdown()`
3) Set `INTEL_MD_SDK` to the SDK root (the path that contains `include/` and `lib/`).
4) Update the `-l` name in `intel_md_windows.go` to match the SDK library name.
   The `-l<name>` maps to `<name>.lib` on Windows.
5) Add or adjust `#cgo` directives in `intel_md_windows.go` for include/lib paths
   and library names, for example:

```c
#cgo CFLAGS: -I${INTEL_MD_SDK}/include
#cgo LDFLAGS: -L${INTEL_MD_SDK}/lib -l<libname>
```

6) Build on Windows with:

```bash
go build -tags intelmd ./cmd/mimir-metrics
```

## Helper script

On Windows, run `scripts\\intel-md-env.ps1` to locate the SDK, set `INTEL_MD_SDK`,
and suggest the `-l` name:

```powershell
scripts\intel-md-env.ps1 -Root "C:\path\to\sdk"
```

## Metrics mapping

The Go provider expects these values per device:

- `temp`
- `power`
- `vram_used`
- `vram_total`
- `usage`

Return 0 on success from `mdapi_device_metrics`. Non-zero values will skip
that device for the current cycle.
