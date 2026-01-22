package config

import (
	"errors"
	"os"
	"time"

	"gopkg.in/yaml.v3"
)

type Config struct {
	BrokerURL            string   `yaml:"broker_url"`
	ClientID             string   `yaml:"client_id"`
	Username             string   `yaml:"username"`
	Password             string   `yaml:"password"`
	TopicTemplate        string   `yaml:"topic_template"`
	StatusTopic          string   `yaml:"status_topic"`
	IntervalSeconds      int      `yaml:"interval_seconds"`
	Host                 string   `yaml:"host"`
	DiskPaths            []string `yaml:"disk_paths"`
	DryRun               bool     `yaml:"dry_run"`
	EnableLocal          bool     `yaml:"enable_local"`
	EnableDocker         bool     `yaml:"enable_docker"`
	DockerSocket         string   `yaml:"docker_socket"`
	DockerInterval       int      `yaml:"docker_interval_seconds"`
	EnableProxmox        bool     `yaml:"enable_proxmox"`
	ProxmoxInterval      int      `yaml:"proxmox_interval_seconds"`
	EnableProxmoxAPI     bool     `yaml:"enable_proxmox_api"`
	ProxmoxAPIURL        string   `yaml:"proxmox_api_url"`
	ProxmoxAPINode       string   `yaml:"proxmox_api_node"`
	ProxmoxAPIToken      string   `yaml:"proxmox_api_token"`
	ProxmoxAPISkipVerify bool     `yaml:"proxmox_api_skip_verify"`
	ProxmoxAPIInterval   int      `yaml:"proxmox_api_interval_seconds"`
}

func Default() Config {
	return Config{
		BrokerURL:       "tcp://localhost:1883",
		TopicTemplate:   "metrics/$host/$device/$metric",
		StatusTopic:     "status/$host",
		IntervalSeconds: 10,
		DockerSocket:    "/var/run/docker.sock",
		EnableLocal:     true,
	}
}

func Load(path string) (Config, error) {
	cfg := Default()
	if path == "" {
		return cfg, nil
	}

	info, err := os.Stat(path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return cfg, nil
		}
		return cfg, err
	}
	if info.IsDir() {
		return cfg, errors.New("config path is a directory")
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return cfg, err
	}
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return cfg, err
	}

	loadEnv(&cfg)

	return cfg, nil
}

func loadEnv(cfg *Config) {
	if v := os.Getenv("MIMIR_BROKER_URL"); v != "" {
		cfg.BrokerURL = v
	}
	if v := os.Getenv("MIMIR_CLIENT_ID"); v != "" {
		cfg.ClientID = v
	}
	if v := os.Getenv("MIMIR_USERNAME"); v != "" {
		cfg.Username = v
	}
	if v := os.Getenv("MIMIR_PASSWORD"); v != "" {
		cfg.Password = v
	}
	if v := os.Getenv("MIMIR_TOPIC_TEMPLATE"); v != "" {
		cfg.TopicTemplate = v
	}
	if v := os.Getenv("MIMIR_STATUS_TOPIC"); v != "" {
		cfg.StatusTopic = v
	}
	if v := os.Getenv("MIMIR_HOST"); v != "" {
		cfg.Host = v
	}
}

func (c Config) Interval() time.Duration {
	if c.IntervalSeconds <= 0 {
		return 10 * time.Second
	}
	return time.Duration(c.IntervalSeconds) * time.Second
}

func (c Config) DockerIntervalDuration() time.Duration {
	if c.DockerInterval <= 0 {
		return 0
	}
	return time.Duration(c.DockerInterval) * time.Second
}

func (c Config) ProxmoxIntervalDuration() time.Duration {
	if c.ProxmoxInterval <= 0 {
		return 0
	}
	return time.Duration(c.ProxmoxInterval) * time.Second
}

func (c Config) ProxmoxAPIIntervalDuration() time.Duration {
	if c.ProxmoxAPIInterval <= 0 {
		return 0
	}
	return time.Duration(c.ProxmoxAPIInterval) * time.Second
}
