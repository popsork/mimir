package mqtt

import (
	"encoding/json"
	"log"
	"time"

	"mimir-metrics/internal/config"
	"mimir-metrics/internal/metrics"
)

type Printer struct {
	topicTemplate string
	statusTopic   string
	host          string
}

func NewPrinter(cfg config.Config) *Printer {
	statusTopic := renderTopic(cfg.StatusTopic, cfg.Host, "", "")
	printer := &Printer{
		topicTemplate: cfg.TopicTemplate,
		statusTopic:   statusTopic,
		host:          cfg.Host,
	}
	printer.logStatus("offline", true)
	printer.logStatus("online", false)
	return printer
}

func (p *Printer) PublishMetric(metric metrics.Metric) error {
	ts := metric.Timestamp
	if ts.IsZero() {
		ts = time.Now()
	}
	var payload []byte
	var err error
	if metric.Payload != nil {
		payload, err = json.Marshal(metric.Payload)
	} else {
		payload, err = json.Marshal(metricPayload{
			Value:  metric.Value,
			TS:     ts.UnixMilli(),
			Unit:   metric.Unit,
			Source: metric.Source,
		})
	}
	if err != nil {
		return err
	}

	topic := metric.Topic
	if topic == "" {
		topic = renderTopic(p.topicTemplate, p.host, metric.Device, metric.Name)
	}
	log.Printf("mqtt dry-run: publish topic=%s payload=%s", topic, payload)
	return nil
}

func (p *Printer) Close() {}

func (p *Printer) logStatus(status string, will bool) {
	payload, err := json.Marshal(statusPayload{
		Status: status,
		TS:     time.Now().UnixMilli(),
	})
	if err != nil {
		log.Printf("mqtt dry-run: status payload failed: %v", err)
		return
	}

	label := "publish"
	if will {
		label = "will"
	}
	log.Printf("mqtt dry-run: %s topic=%s payload=%s", label, p.statusTopic, payload)
}
