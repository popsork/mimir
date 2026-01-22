# Proxmox metrics

## Overview
This project can collect Proxmox metrics in two ways:

- **Cgroup-based (host-local)**: Reads cgroup and /proc data on the Proxmox host for CPU, memory, network, and block IO usage.
- **API-based (low-frequency)**: Polls the Proxmox API for per-VM/LXC disk usage and available memory.

The API collector is designed to run on a slower interval than the cgroup collector.

## API token setup
Create a Proxmox API token and give it read-only access:

1. In the Proxmox UI, create an API token for a user (Datacenter -> Permissions -> API Tokens).
2. Grant the token read access to the node/VMs (for example, `PVEAuditor` at the node level).
3. Use the token in this format:
   `user@realm!tokenid=secret`

The request header is `Authorization: PVEAPIToken=<token>`, so the configuration should only include the token value.

## Configuration
Add the API settings to your config:

```
enable_proxmox_api: true
proxmox_api_url: "https://localhost:8006"
proxmox_api_node: "pve"
proxmox_api_token: "user@realm!tokenid=secret"
proxmox_api_skip_verify: true
proxmox_api_interval_seconds: 300
```

## Metrics from the API collector
- `disk_used_bytes`
- `disk_limit_bytes`
- `disk_free_bytes`
- `disk_usage_pct`
- `mem_free_bytes`

Metric names follow the existing `*_bytes` and `*_pct` naming pattern.
