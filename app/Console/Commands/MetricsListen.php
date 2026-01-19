<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use MongoDB\BSON\UTCDateTime;
use PhpMqtt\Client\Facades\MQTT;

class MetricsListen extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'metrics:listen';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Listen for metrics over MQTT';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        /** @var \PhpMqtt\Client\Contracts\MqttClient $mqtt */
        $mqtt = MQTT::connection();

        $mqtt->subscribe('metrics/#', function (string $topic, string $message) {
            $this->handleMessage($topic, $message);
        }, 1);

        /** @var \PhpMqtt\Client\Contracts\MqttClient $mqtt */
        pcntl_signal(SIGINT, function () use ($mqtt) {
            $mqtt->interrupt();
        });

        $mqtt->loop(true);
    }

    protected function handleMessage(string $topic, string $message): void
    {
        $decoded = $this->decodePayload($message);

        $meta = [];

        if (preg_match('/^metrics\/docker\/([a-z0-9_-]+)\/([a-zA-Z0-9_.-]+)\/([a-z0-9_]+)$/', $topic, $matches)) {
            [, $host, $container, $metric] = $matches;
            $meta = [
                'type' => 'docker',
                'host' => $host,
                'container' => $container,
            ];
        } elseif (preg_match('/^metrics\/proxmox\/([a-z0-9_-]+)\/([a-zA-Z0-9_.-]+)\/([a-z0-9_]+)$/', $topic, $matches)) {
            [, $host, $container, $metric] = $matches;
            $meta = [
                'type' => 'proxmox',
                'host' => $host,
                'container' => $container,
            ];
        } elseif (preg_match('/^metrics\/containers\/([a-z0-9_-]+)\/([a-zA-Z0-9_.-]+)\/([a-z0-9_]+)$/', $topic, $matches)) {
            [, $host, $container, $metric] = $matches;
            $meta = [
                'type' => 'proxmox',
                'host' => $host,
                'container' => $container,
            ];
        } elseif (preg_match('/^metrics\/([a-z0-9_-]+)\/([a-z0-9_-]+)\/([a-z0-9_]+)$/', $topic, $matches)) {
            [, $host, $device, $metric] = $matches;
            $meta = [
                'type' => 'machine',
                'host' => $host,
                'device' => $device,
            ];
        } else {
            return;
        }

        if ($metric === '$info' && is_array($decoded) && !array_key_exists('value', $decoded)) {
            $timestamp = $this->normalizeTimestamp($decoded['ts'] ?? null);
            $meta['info'] = $decoded;
            $value = null;
            $unit = null;
        } else {
            $payload = $this->parseMetricPayload($decoded, $message);
            $value = $payload['value'];
            $unit = $payload['unit'];
            $timestamp = $payload['timestamp'];
        }

        DB::table('metrics')->insert([
            'timestamp' => $timestamp,
            'meta' => $meta,
            'metric' => $metric,
            'value' => $value,
            'unit' => $unit,
        ]);
    }

    private function decodePayload(string $message): mixed
    {
        $message = trim($message);
        if ($message !== '' && $message[0] === '{') {
            return json_decode($message, true);
        }
        return null;
    }

    private function parseMetricPayload(mixed $decoded, string $raw): array
    {
        if (is_array($decoded)) {
            $value = isset($decoded['value']) ? (float) $decoded['value'] : 0.0;
            $unit = isset($decoded['unit']) ? (string) $decoded['unit'] : null;
            $ts = $decoded['ts'] ?? null;
            $timestamp = $this->normalizeTimestamp($ts);
            return [
                'value' => $value,
                'unit' => $unit,
                'timestamp' => $timestamp,
            ];
        }

        return [
            'value' => floatval($raw),
            'unit' => null,
            'timestamp' => new UTCDateTime(Carbon::now()),
        ];
    }

    private function normalizeTimestamp(mixed $value): UTCDateTime
    {
        if (is_numeric($value)) {
            $numeric = (int) $value;
            if ($numeric < 1000000000000) {
                $numeric *= 1000;
            }
            return new UTCDateTime($numeric);
        }

        return new UTCDateTime(Carbon::now());
    }
}
