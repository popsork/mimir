package metrics

import "time"

type Metric struct {
	Device    string
	Name      string
	Value     float64
	Unit      string
	Source    string
	Timestamp time.Time
	Topic     string
	Payload   any
}
