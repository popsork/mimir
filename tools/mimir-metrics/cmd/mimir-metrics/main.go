package main

import (
	"context"
	"flag"
	"log"
	"os"
	"os/signal"
	"runtime"
	"strings"
	"sync"
	"syscall"
	"time"

	"mimir-metrics/internal/config"
	"mimir-metrics/internal/metrics"
	"mimir-metrics/internal/mqtt"
	"mimir-metrics/internal/providers"
	"mimir-metrics/internal/providers/cpu"
	"mimir-metrics/internal/providers/disk"
	"mimir-metrics/internal/providers/diskio"
	"mimir-metrics/internal/providers/docker"
	"mimir-metrics/internal/providers/gpu"
	"mimir-metrics/internal/providers/memory"
	"mimir-metrics/internal/providers/netio"
	"mimir-metrics/internal/providers/proxmox"
	"mimir-metrics/internal/providers/system"
	"mimir-metrics/internal/providers/temps"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lmsgprefix)
	log.SetPrefix("mimir-metrics: ")

	configPath := flag.String("config", "config.yaml", "config file path")
	brokerURL := flag.String("broker", "", "mqtt broker url")
	clientID := flag.String("client-id", "", "mqtt client id")
	username := flag.String("username", "", "mqtt username")
	password := flag.String("password", "", "mqtt password")
	topicTemplate := flag.String("topic-template", "", "topic template")
	statusTopic := flag.String("status-topic", "", "status topic")
	interval := flag.Int("interval", 0, "interval seconds")
	host := flag.String("host", "", "host override")
	diskPaths := flag.String("disk-paths", "", "comma separated disk paths")
	dryRun := flag.Bool("dry-run", false, "print mqtt topics/payloads instead of publishing")
	dryRunOnce := flag.Bool("dry-run-once", false, "print one collection cycle and exit (implies -dry-run)")
	disableLocal := flag.Bool("disable-local", false, "disable local host metrics")
	enableDocker := flag.Bool("enable-docker", false, "enable docker metrics")
	dockerSocket := flag.String("docker-socket", "", "docker socket path")
	dockerInterval := flag.Int("docker-interval", 0, "docker interval seconds")
	enableProxmox := flag.Bool("enable-proxmox", false, "enable proxmox metrics")
	proxmoxInterval := flag.Int("proxmox-interval", 0, "proxmox interval seconds")
	enableProxmoxAPI := flag.Bool("enable-proxmox-api", false, "enable proxmox api metrics")
	proxmoxAPIURL := flag.String("proxmox-api-url", "", "proxmox api base url (e.g. https://localhost:8006)")
	proxmoxAPINode := flag.String("proxmox-api-node", "", "proxmox api node name")
	proxmoxAPIToken := flag.String("proxmox-api-token", "", "proxmox api token (user@realm!tokenid=secret)")
	proxmoxAPISkipVerify := flag.Bool("proxmox-api-skip-verify", false, "skip proxmox api tls verification")
	proxmoxAPIInterval := flag.Int("proxmox-api-interval", 0, "proxmox api interval seconds")
	flag.Parse()

	cfg, err := config.Load(*configPath)
	if err != nil {
		log.Fatalf("config load failed: %v", err)
	}

	if *brokerURL != "" {
		cfg.BrokerURL = *brokerURL
	}
	if *clientID != "" {
		cfg.ClientID = *clientID
	}
	if *username != "" {
		cfg.Username = *username
	}
	if *password != "" {
		cfg.Password = *password
	}
	if *topicTemplate != "" {
		cfg.TopicTemplate = *topicTemplate
	}
	if *statusTopic != "" {
		cfg.StatusTopic = *statusTopic
	}
	if *interval > 0 {
		cfg.IntervalSeconds = *interval
	}
	if *host != "" {
		cfg.Host = *host
	}
	if *diskPaths != "" {
		cfg.DiskPaths = splitCSV(*diskPaths)
	}
	if *dryRun {
		cfg.DryRun = true
	}
	if *dryRunOnce {
		cfg.DryRun = true
	}
	if *disableLocal {
		cfg.EnableLocal = false
	}
	if *enableDocker {
		cfg.EnableDocker = true
	}
	if *dockerSocket != "" {
		cfg.DockerSocket = *dockerSocket
	}
	if *dockerInterval > 0 {
		cfg.DockerInterval = *dockerInterval
	}
	if *enableProxmox {
		cfg.EnableProxmox = true
	}
	if *proxmoxInterval > 0 {
		cfg.ProxmoxInterval = *proxmoxInterval
	}
	if *enableProxmoxAPI {
		cfg.EnableProxmoxAPI = true
	}
	if *proxmoxAPIURL != "" {
		cfg.ProxmoxAPIURL = *proxmoxAPIURL
	}
	if *proxmoxAPINode != "" {
		cfg.ProxmoxAPINode = *proxmoxAPINode
	}
	if *proxmoxAPIToken != "" {
		cfg.ProxmoxAPIToken = *proxmoxAPIToken
	}
	if *proxmoxAPISkipVerify {
		cfg.ProxmoxAPISkipVerify = true
	}
	if *proxmoxAPIInterval > 0 {
		cfg.ProxmoxAPIInterval = *proxmoxAPIInterval
	}

	if cfg.Host == "" {
		hostname, err := os.Hostname()
		if err != nil {
			log.Fatalf("hostname lookup failed: %v", err)
		}
		cfg.Host = hostname
	}
	if cfg.ClientID == "" {
		cfg.ClientID = "mimir-metrics-" + cfg.Host
	}
	if len(cfg.DiskPaths) == 0 {
		cfg.DiskPaths = defaultDiskPaths()
	}

	var publisher metricPublisher
	if cfg.DryRun {
		publisher = mqtt.NewPrinter(cfg)
	} else {
		var err error
		publisher, err = mqtt.New(cfg)
		if err != nil {
			log.Fatalf("mqtt init failed: %v", err)
		}
	}
	defer publisher.Close()

	var providersList []providers.Provider
	if cfg.EnableLocal {
		providersList = []providers.Provider{
			cpu.New(),
			memory.New(),
			disk.New(cfg.DiskPaths),
			diskio.New(),
			netio.New(),
			system.New(),
		}
	}
	providersList = append(providersList, gpu.Providers()...)
	providersList = append(providersList, temps.Providers()...)
	providersList = append(providersList, docker.Providers(cfg)...)
	providersList = append(providersList, proxmox.Providers(cfg)...)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	if *dryRunOnce {
		collectAndPublish(ctx, providersList, publisher)
		return
	}

	ticker := time.NewTicker(cfg.Interval())
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			collectAndPublish(ctx, providersList, publisher)
		}
	}
}

func collectAndPublish(ctx context.Context, providersList []providers.Provider, publisher metricPublisher) {
	var wg sync.WaitGroup
	var mu sync.Mutex
	var allMetrics []metrics.Metric

	wg.Add(len(providersList))
	for _, p := range providersList {
		go func(provider providers.Provider) {
			defer wg.Done()
			
			// Create a child context with timeout for each provider to ensure one slow provider doesn't block forever
			// Using 10s as a reasonable upper bound for collection
			ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
			defer cancel()

			ms, err := provider.Collect(ctx)
			if err != nil {
				log.Printf("provider %s failed: %v", provider.Name(), err)
				return
			}
			
			mu.Lock()
			allMetrics = append(allMetrics, ms...)
			mu.Unlock()
		}(p)
	}
	wg.Wait()

	for _, metric := range allMetrics {
		if err := publisher.PublishMetric(metric); err != nil {
			log.Printf("publish %s/%s failed: %v", metric.Device, metric.Name, err)
		}
	}
}

type metricPublisher interface {
	PublishMetric(metrics.Metric) error
	Close()
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	var out []string
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}

func defaultDiskPaths() []string {
	if runtime.GOOS == "windows" {
		return []string{"C:\\"}
	}
	return []string{"/"}
}
