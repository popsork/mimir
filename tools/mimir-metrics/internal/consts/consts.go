package consts

// Device names
const (
	DeviceCPU    = "cpu"
	DeviceMemory = "mem"
	DeviceSwap   = "swap"
	DeviceDisk   = "disk"
	DeviceDiskIO = "diskio"
	DeviceNet    = "net"
	DeviceSystem = "system"
)

// Metric names
const (
	MetricUsage      = "usage"
	MetricUsed       = "used"
	MetricTotal      = "total"
	MetricFree       = "free"
	MetricTemp       = "temp"
	MetricPower      = "power"
	MetricReadBytes  = "read_bytes"
	MetricWriteBytes = "write_bytes"
	MetricReadOps    = "read_ops"
	MetricWriteOps   = "write_ops"
)

// Units
const (
	UnitPercent = "pct"
	UnitCelsius = "C"
	UnitBytes   = "bytes"
	UnitWatts   = "W"
	UnitCount   = "count"
	UnitSeconds = "s"
)
