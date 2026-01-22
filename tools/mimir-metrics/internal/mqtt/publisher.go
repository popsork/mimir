package mqtt

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/eclipse/paho.mqtt.golang"

	"mimir-metrics/internal/config"
	"mimir-metrics/internal/metrics"
	"mimir-metrics/internal/utils"
)

type Publisher struct {
	client        mqtt.Client
	topicTemplate string
	statusTopic   string
	host          string
}

type statusPayload struct {
	Status string `json:"status"`
	TS     int64  `json:"ts"`
}

type metricPayload struct {
	Value  float64 `json:"value"`
	TS     int64   `json:"ts"`
	Unit   string  `json:"unit"`
	Source string  `json:"source"`
}

func New(cfg config.Config) (*Publisher, error) {
	opts := mqtt.NewClientOptions()
	opts.AddBroker(cfg.BrokerURL)
	opts.SetClientID(cfg.ClientID)
	opts.SetUsername(cfg.Username)
	opts.SetPassword(cfg.Password)
	opts.SetAutoReconnect(true)
	opts.SetConnectRetry(true)
	opts.SetConnectRetryInterval(5 * time.Second)

	statusTopic := renderTopic(cfg.StatusTopic, cfg.Host, "", "")
	offlinePayload, err := json.Marshal(statusPayload{
		Status: "offline",
		TS:     time.Now().UnixMilli(),
	})
	if err != nil {
		return nil, err
	}
	opts.SetWill(statusTopic, string(offlinePayload), 1, true)

	opts.SetOnConnectHandler(func(c mqtt.Client) {
		onlinePayload, err := json.Marshal(statusPayload{
			Status: "online",
			TS:     time.Now().UnixMilli(),
		})
		if err != nil {
			log.Printf("mqtt: failed to marshal online payload: %v", err)
			return
		}
		token := c.Publish(statusTopic, 1, true, onlinePayload)
		if !token.WaitTimeout(5*time.Second) || token.Error() != nil {
			if token.Error() != nil {
				log.Printf("mqtt: failed to publish online status: %v", token.Error())
			} else {
				log.Printf("mqtt: timeout publishing online status")
			}
		}
	})
	opts.SetConnectionLostHandler(func(_ mqtt.Client, err error) {
		log.Printf("mqtt: connection lost: %v", err)
	})

	client := mqtt.NewClient(opts)
	if token := client.Connect(); !token.WaitTimeout(10*time.Second) || token.Error() != nil {
		if token.Error() != nil {
			log.Printf("mqtt: initial connect failed: %v", token.Error())
		} else {
			log.Printf("mqtt: initial connect timeout")
		}
	}

	return &Publisher{
		client:        client,
		topicTemplate: cfg.TopicTemplate,
		statusTopic:   statusTopic,
		host:          cfg.Host,
	}, nil
}

func (p *Publisher) PublishMetric(metric metrics.Metric) error {
	if !p.client.IsConnected() {
		return nil
	}

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
	token := p.client.Publish(topic, 1, false, payload)
	if !token.WaitTimeout(5 * time.Second) {
		return fmt.Errorf("mqtt: publish timeout")
	}
	return token.Error()
}

func (p *Publisher) Close() {
	if p.client != nil && p.client.IsConnected() {
		p.client.Disconnect(250)
	}
}

func renderTopic(tpl, host, device, metric string) string {
	replacer := strings.NewReplacer(
		"$host", utils.SanitizeTopicPart(host),
		"$device", utils.SanitizeTopicPart(device),
		"$metric", utils.SanitizeTopicPart(metric),
	)
	return replacer.Replace(tpl)
}
