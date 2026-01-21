<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use MongoDB\BSON\UTCDateTime;
use Symfony\Component\HttpFoundation\Response;

class MetricsController extends Controller
{
    public function index(Request $request): Response
    {
        $minutes = (int) $request->query('minutes', 60);
        $minutes = max(1, min($minutes, 1440));

        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('metrics');

        $cutoff = new UTCDateTime(Carbon::now()->subMinutes($minutes));

        $pipeline = [
            [
                '$match' => [
                    'timestamp' => ['$gte' => $cutoff],
                    '$or' => [
                        ['meta.type' => 'machine'],
                        ['meta.type' => ['$exists' => false]],
                    ],
                ],
            ],
            ['$sort' => ['timestamp' => -1]],
            [
                '$group' => [
                    '_id' => [
                        'host' => '$meta.host',
                        'device' => '$meta.device',
                        'metric' => '$metric',
                        'unit' => '$unit',
                    ],
                    'timestamp' => ['$first' => '$timestamp'],
                    'value' => ['$first' => '$value'],
                ],
            ],
            [
                '$project' => [
                    '_id' => 0,
                    'host' => '$_id.host',
                    'device' => '$_id.device',
                    'metric' => '$_id.metric',
                    'unit' => '$_id.unit',
                    'value' => 1,
                    'timestamp' => 1,
                ],
            ],
            [
                '$group' => [
                    '_id' => [
                        'host' => '$host',
                        'device' => '$device',
                    ],
                    'metrics' => [
                        '$push' => [
                            'metric' => '$metric',
                            'unit' => '$unit',
                            'value' => '$value',
                            'timestamp' => '$timestamp',
                        ],
                    ],
                ],
            ],
            [
                '$project' => [
                    '_id' => 0,
                    'host' => '$_id.host',
                    'device' => '$_id.device',
                    'metrics' => 1,
                ],
            ],
            [
                '$group' => [
                    '_id' => '$host',
                    'devices' => [
                        '$push' => [
                            'device' => '$device',
                            'metrics' => '$metrics',
                        ],
                    ],
                ],
            ],
            ['$sort' => ['_id' => 1]],
        ];

        $cursor = $collection->aggregate($pipeline);

        $hosts = [];
        foreach ($cursor as $row) {
            $hostName = $row['_id'] ?? 'unknown';
            $devices = [];
            foreach ($row['devices'] ?? [] as $deviceGroup) {
                $metrics = [];
                foreach ($deviceGroup['metrics'] ?? [] as $metric) {
                    $metrics[] = [
                        'metric' => $metric['metric'] ?? 'unknown',
                        'unit' => $metric['unit'] ?? null,
                        'value' => isset($metric['value']) ? (float) $metric['value'] : 0.0,
                        'timestamp' => $this->formatTimestamp($metric['timestamp'] ?? null),
                    ];
                }

                $devices[] = [
                    'device' => $deviceGroup['device'] ?? null,
                    'metrics' => $metrics,
                ];
            }

            $hosts[] = [
                'host' => $hostName,
                'devices' => $devices,
            ];
        }

        return response()->json([
            'window_minutes' => $minutes,
            'hosts' => $hosts,
        ]);
    }

    private function formatTimestamp(mixed $value): ?string
    {
        if (!$value instanceof UTCDateTime) {
            return null;
        }

        return $value->toDateTime()->format(DATE_ATOM);
    }

    private function fetchHistoryPoints($collection, array $match, int $limit): array
    {
        $pipeline = [
            ['$match' => $match],
            ['$sort' => ['timestamp' => 1]],
            ['$limit' => $limit],
            [
                '$project' => [
                    '_id' => 0,
                    'timestamp' => 1,
                    'value' => 1,
                ],
            ],
        ];

        $cursor = $collection->aggregate($pipeline);
        $points = [];
        foreach ($cursor as $row) {
            $points[] = [
                'timestamp' => $this->formatTimestamp($row['timestamp'] ?? null),
                'value' => isset($row['value']) ? (float) $row['value'] : null,
            ];
        }

        return $points;
    }

    private function normalizeMetricList(mixed $value): array
    {
        if (is_array($value)) {
            return array_values(array_filter(array_map('strval', $value), fn ($v) => $v !== ''));
        }

        if (is_string($value) && $value !== '') {
            $parts = array_map('trim', explode(',', $value));
            return array_values(array_filter($parts, fn ($v) => $v !== ''));
        }

        return [];
    }

    public function tree(Request $request): Response
    {
        $cacheEnabled = app()->environment('production');
        $cacheKey = 'metrics_tree';

        if ($request->boolean('refresh') || !$cacheEnabled) {
            Cache::forget($cacheKey);
        }

        $data = $cacheEnabled
            ? Cache::remember($cacheKey, 60, function () {
                return $this->buildTreePayload();
            })
            : $this->buildTreePayload();

        return response()->json($data);
    }

    public function containerMetrics(Request $request): Response
    {
        $type = $request->query('type');
        $host = $request->query('host');
        $container = $request->query('container');

        if (!in_array($type, ['docker', 'proxmox'], true) || !is_string($host) || !is_string($container)) {
            return response()->json(['error' => 'Invalid parameters.'], Response::HTTP_BAD_REQUEST);
        }

        $minutes = (int) $request->query('minutes', 60);
        $minutes = max(1, min($minutes, 1440));

        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('metrics');

        $cutoff = new UTCDateTime(Carbon::now()->subMinutes($minutes));

        $pipeline = [
            [
                '$match' => [
                    'timestamp' => ['$gte' => $cutoff],
                    'meta.type' => $type,
                    'meta.host' => $host,
                    'meta.container' => $container,
                ],
            ],
            ['$sort' => ['timestamp' => -1]],
            [
                '$group' => [
                    '_id' => [
                        'metric' => '$metric',
                        'unit' => '$unit',
                    ],
                    'timestamp' => ['$first' => '$timestamp'],
                    'value' => ['$first' => '$value'],
                ],
            ],
            [
                '$project' => [
                    '_id' => 0,
                    'metric' => '$_id.metric',
                    'unit' => '$_id.unit',
                    'value' => 1,
                    'timestamp' => 1,
                ],
            ],
        ];

        $cursor = $collection->aggregate($pipeline);
        $metrics = [];
        foreach ($cursor as $metric) {
            $metrics[] = [
                'metric' => $metric['metric'] ?? 'unknown',
                'unit' => $metric['unit'] ?? null,
                'value' => isset($metric['value']) ? (float) $metric['value'] : null,
                'timestamp' => $this->formatTimestamp($metric['timestamp'] ?? null),
            ];
        }

        return response()->json([
            'host' => $host,
            'container' => $container,
            'type' => $type,
            'metrics' => $metrics,
        ]);
    }

    public function deviceHistory(Request $request): Response
    {
        $host = $request->query('host');
        $device = $request->query('device');
        $metric = $request->query('metric');

        if (!is_string($host) || !is_string($device) || !is_string($metric)) {
            return response()->json(['error' => 'Invalid parameters.'], Response::HTTP_BAD_REQUEST);
        }

        $minutes = (int) $request->query('minutes', 120);
        $minutes = max(1, min($minutes, 1440));
        $limit = (int) $request->query('limit', 600);
        $limit = max(10, min($limit, 5000));

        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('metrics');

        $cutoff = new UTCDateTime(Carbon::now()->subMinutes($minutes));

        $match = [
            'timestamp' => ['$gte' => $cutoff],
            'metric' => $metric,
            'meta.host' => $host,
            'meta.device' => $device,
            '$or' => [
                ['meta.type' => 'machine'],
                ['meta.type' => ['$exists' => false]],
            ],
        ];

        $points = $this->fetchHistoryPoints($collection, $match, $limit);

        return response()->json([
            'host' => $host,
            'device' => $device,
            'metric' => $metric,
            'minutes' => $minutes,
            'points' => $points,
        ]);
    }

    public function deviceSeries(Request $request): Response
    {
        $host = $request->query('host');
        $device = $request->query('device');
        $metrics = $this->normalizeMetricList($request->query('metrics'));

        if (!is_string($host) || !is_string($device) || empty($metrics)) {
            return response()->json(['error' => 'Invalid parameters.'], Response::HTTP_BAD_REQUEST);
        }

        $minutes = (int) $request->query('minutes', 120);
        $minutes = max(1, min($minutes, 1440));
        $limit = (int) $request->query('limit', 600);
        $limit = max(10, min($limit, 5000));

        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('metrics');

        $cutoff = new UTCDateTime(Carbon::now()->subMinutes($minutes));

        $baseMatch = [
            'timestamp' => ['$gte' => $cutoff],
            'meta.host' => $host,
            'meta.device' => $device,
            '$or' => [
                ['meta.type' => 'machine'],
                ['meta.type' => ['$exists' => false]],
            ],
        ];

        $series = [];
        foreach ($metrics as $metric) {
            $match = $baseMatch;
            $match['metric'] = $metric;
            $series[] = [
                'metric' => $metric,
                'points' => $this->fetchHistoryPoints($collection, $match, $limit),
            ];
        }

        return response()->json([
            'host' => $host,
            'device' => $device,
            'minutes' => $minutes,
            'series' => $series,
        ]);
    }

    public function containerHistory(Request $request): Response
    {
        $type = $request->query('type');
        $host = $request->query('host');
        $container = $request->query('container');
        $metrics = $this->normalizeMetricList($request->query('metrics'));

        if (!in_array($type, ['docker', 'proxmox'], true) || !is_string($host) || !is_string($container) || empty($metrics)) {
            return response()->json(['error' => 'Invalid parameters.'], Response::HTTP_BAD_REQUEST);
        }

        $minutes = (int) $request->query('minutes', 120);
        $minutes = max(1, min($minutes, 1440));
        $limit = (int) $request->query('limit', 600);
        $limit = max(10, min($limit, 5000));

        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('metrics');

        $cutoff = new UTCDateTime(Carbon::now()->subMinutes($minutes));

        $baseMatch = [
            'timestamp' => ['$gte' => $cutoff],
            'meta.type' => $type,
            'meta.host' => $host,
            'meta.container' => $container,
        ];

        $series = [];
        foreach ($metrics as $metric) {
            $match = $baseMatch;
            $match['metric'] = $metric;
            $series[] = [
                'metric' => $metric,
                'points' => $this->fetchHistoryPoints($collection, $match, $limit),
            ];
        }

        return response()->json([
            'host' => $host,
            'container' => $container,
            'type' => $type,
            'minutes' => $minutes,
            'series' => $series,
        ]);
    }

    public function overview(Request $request): Response
    {
        $minutes = (int) $request->query('minutes', 60);
        $minutes = max(1, min($minutes, 1440));

        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('metrics');

        $cutoff = new UTCDateTime(Carbon::now()->subMinutes($minutes));

        $machinePipeline = [
            [
                '$match' => [
                    'timestamp' => ['$gte' => $cutoff],
                    '$or' => [
                        ['meta.type' => 'machine'],
                        ['meta.type' => ['$exists' => false]],
                    ],
                    'meta.device' => ['$in' => ['cpu', 'mem', 'disk']],
                    'metric' => ['$in' => ['usage', 'used', 'total']],
                ],
            ],
            ['$sort' => ['timestamp' => -1]],
            [
                '$group' => [
                    '_id' => [
                        'host' => '$meta.host',
                        'device' => '$meta.device',
                        'metric' => '$metric',
                    ],
                    'value' => ['$first' => '$value'],
                    'timestamp' => ['$first' => '$timestamp'],
                ],
            ],
        ];

        $machineCursor = $collection->aggregate($machinePipeline);
        $machineMap = [];
        foreach ($machineCursor as $row) {
            $host = $row['_id']['host'] ?? null;
            $device = $row['_id']['device'] ?? null;
            $metric = $row['_id']['metric'] ?? null;
            if (!$host || !$device || !$metric) {
                continue;
            }
            $machineMap[$host][$device][$metric] = [
                'value' => isset($row['value']) ? (float) $row['value'] : null,
                'timestamp' => $this->formatTimestamp($row['timestamp'] ?? null),
            ];
        }

        $proxmoxPipeline = [
            [
                '$match' => [
                    'timestamp' => ['$gte' => $cutoff],
                    'meta.type' => 'proxmox',
                    'metric' => ['$in' => ['cpu_usage_pct', 'mem_usage_pct', 'mem_used_bytes', 'mem_limit_bytes']],
                ],
            ],
            ['$sort' => ['timestamp' => -1]],
            [
                '$group' => [
                    '_id' => [
                        'host' => '$meta.host',
                        'container' => '$meta.container',
                        'metric' => '$metric',
                    ],
                    'value' => ['$first' => '$value'],
                    'timestamp' => ['$first' => '$timestamp'],
                ],
            ],
        ];

        $proxmoxCursor = $collection->aggregate($proxmoxPipeline);
        $proxmoxMap = [];
        foreach ($proxmoxCursor as $row) {
            $host = $row['_id']['host'] ?? null;
            $container = $row['_id']['container'] ?? null;
            $metric = $row['_id']['metric'] ?? null;
            if (!$host || !$container || !$metric) {
                continue;
            }
            $proxmoxMap[$host][$container][$metric] = [
                'value' => isset($row['value']) ? (float) $row['value'] : null,
                'timestamp' => $this->formatTimestamp($row['timestamp'] ?? null),
            ];
        }

        $items = [];

        foreach ($machineMap as $host => $devices) {
            $cpu = $devices['cpu']['usage'] ?? null;
            $mem = $this->deriveUsageFromMetrics($devices['mem'] ?? []);
            $disk = $this->deriveUsageFromMetrics($devices['disk'] ?? []);

            $items[] = [
                'id' => "machine:$host",
                'label' => $host,
                'cpu' => $cpu,
                'mem' => $mem,
                'disk' => $disk,
                'type' => 'machine',
            ];
        }

        foreach ($proxmoxMap as $host => $containers) {
            foreach ($containers as $container => $metrics) {
                $cpu = $metrics['cpu_usage_pct'] ?? null;
                $mem = $this->deriveUsageFromMetrics([
                    'usage' => $metrics['mem_usage_pct'] ?? null,
                    'used' => $metrics['mem_used_bytes'] ?? null,
                    'total' => $metrics['mem_limit_bytes'] ?? null,
                ]);
                $items[] = [
                    'id' => "proxmox:$host:$container",
                    'label' => $host . ' / ' . $container,
                    'cpu' => $cpu,
                    'mem' => $mem,
                    'disk' => null,
                    'type' => 'proxmox',
                ];
            }
        }

        usort($items, fn ($a, $b) => strcmp($a['label'], $b['label']));

        return response()->json([
            'minutes' => $minutes,
            'items' => $items,
        ]);
    }

    public function containersOverview(Request $request): Response
    {
        $type = $request->query('type');
        $host = $request->query('host');

        if (!in_array($type, ['docker', 'proxmox'], true) || !is_string($host)) {
            return response()->json(['error' => 'Invalid parameters.'], Response::HTTP_BAD_REQUEST);
        }

        $minutes = (int) $request->query('minutes', 60);
        $minutes = max(1, min($minutes, 1440));

        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('metrics');

        $cutoff = new UTCDateTime(Carbon::now()->subMinutes($minutes));

        $pipeline = [
            [
                '$match' => [
                    'timestamp' => ['$gte' => $cutoff],
                    'meta.type' => $type,
                    'meta.host' => $host,
                ],
            ],
            ['$sort' => ['timestamp' => -1]],
            [
                '$group' => [
                    '_id' => [
                        'container' => '$meta.container',
                        'metric' => '$metric',
                    ],
                    'value' => ['$first' => '$value'],
                    'timestamp' => ['$first' => '$timestamp'],
                ],
            ],
        ];

        $cursor = $collection->aggregate($pipeline);
        $containers = [];

        foreach ($cursor as $row) {
            $container = $row['_id']['container'] ?? null;
            $metric = $row['_id']['metric'] ?? null;
            if (!$container || !$metric) {
                continue;
            }
            $containers[$container][$metric] = [
                'value' => isset($row['value']) ? (float) $row['value'] : null,
                'timestamp' => $this->formatTimestamp($row['timestamp'] ?? null),
            ];
        }

        $items = [];
        $running = 0;
        foreach ($containers as $containerName => $metrics) {
            $status = $metrics['status']['value'] ?? null;
            $isRunning = $status !== null ? ((float) $status >= 1) : null;
            if ($isRunning) {
                $running++;
            }

            $cpu = $metrics['cpu_usage_pct'] ?? null;
            $mem = $this->deriveUsageFromMetrics([
                'usage' => $metrics['mem_usage_pct'] ?? null,
                'used' => $metrics['mem_used_bytes'] ?? null,
                'total' => $metrics['mem_limit_bytes'] ?? null,
            ]);
            $uptime = $metrics['uptime_seconds'] ?? null;

            $items[] = [
                'name' => $containerName,
                'status' => $isRunning,
                'cpu' => $cpu,
                'mem' => $mem,
                'uptime' => $uptime,
            ];
        }

        usort($items, function (array $a, array $b) {
            $aRank = $a['status'] === true ? 0 : ($a['status'] === false ? 1 : 2);
            $bRank = $b['status'] === true ? 0 : ($b['status'] === false ? 1 : 2);
            if ($aRank !== $bRank) {
                return $aRank <=> $bRank;
            }
            return strcmp($a['name'], $b['name']);
        });

        return response()->json([
            'host' => $host,
            'type' => $type,
            'minutes' => $minutes,
            'total' => count($items),
            'running' => $running,
            'items' => $items,
        ]);
    }

    private function deriveUsageFromMetrics(array $metrics): ?array
    {
        $usage = $metrics['usage'] ?? null;
        if (is_array($usage) && array_key_exists('value', $usage) && $usage['value'] !== null) {
            return $usage;
        }
        $used = $metrics['used'] ?? null;
        $total = $metrics['total'] ?? null;
        if (is_array($used) && is_array($total) && ($used['value'] ?? null) !== null && ($total['value'] ?? null)) {
            return [
                'value' => ((float) $used['value'] / (float) $total['value']) * 100,
                'timestamp' => $used['timestamp'] ?? $total['timestamp'] ?? null,
            ];
        }
        return null;
    }

    private function buildTreePayload(): array
    {
        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('metrics');

            $hosts = $collection->distinct('meta.host', []);
            $hosts = array_values(array_filter($hosts, fn ($host) => $host !== null && $host !== ''));
            sort($hosts);

            $machineDevices = $this->groupByHostAndField($collection, [
                '$or' => [
                    ['meta.type' => 'machine'],
                    ['meta.type' => ['$exists' => false]],
                ],
            ], 'meta.device', 'devices');

            $dockerContainers = $this->groupByHostAndField($collection, ['meta.type' => 'docker'], 'meta.container', 'containers');
            $proxmoxContainers = $this->groupByHostAndField($collection, ['meta.type' => 'proxmox'], 'meta.container', 'containers');

            $runningCounts = $this->computeRunningCounts($collection);
            $containerStatuses = $this->computeContainerStatuses($collection);

            $hostsData = [];
            foreach ($hosts as $host) {
                $hostsData[] = [
                    'host' => $host,
                    'devices' => $machineDevices[$host] ?? [],
                    'docker' => [
                        'containers' => $this->mapContainersWithStatus($dockerContainers[$host] ?? [], $containerStatuses['docker'][$host] ?? []),
                    ],
                    'proxmox' => [
                        'containers' => $this->mapContainersWithStatus($proxmoxContainers[$host] ?? [], $containerStatuses['proxmox'][$host] ?? []),
                    ],
                ];
            }

            return [
                'overview' => [
                    'hosts' => count($hosts),
                    'docker_containers' => $runningCounts['docker']['total'],
                    'container_containers' => $runningCounts['proxmox']['total'],
                    'total_containers' => $runningCounts['docker']['total'] + $runningCounts['proxmox']['total'],
                    'docker_running' => $runningCounts['docker']['running'],
                    'container_running' => $runningCounts['proxmox']['running'],
                    'total_running' => $runningCounts['docker']['running'] + $runningCounts['proxmox']['running'],
                ],
                'hosts' => $hostsData,
            ];
    }

    private function groupByHostAndField($collection, array $match, string $field, string $key): array
    {
        $pipeline = [
            ['$match' => $match],
            ['$group' => ['_id' => ['host' => '$meta.host', 'value' => '$' . $field]]],
            ['$group' => ['_id' => '$_id.host', $key => ['$push' => '$_id.value']]],
            ['$sort' => ['_id' => 1]],
        ];

        $cursor = $collection->aggregate($pipeline);
        $result = [];
        foreach ($cursor as $row) {
            $host = $row['_id'] ?? null;
            if (!$host) {
                continue;
            }
            $rawValues = $row[$key] ?? [];
            if ($rawValues instanceof \MongoDB\Model\BSONArray) {
                $rawValues = $rawValues->getArrayCopy();
            } elseif ($rawValues instanceof \MongoDB\Model\BSONDocument) {
                $rawValues = $rawValues->getArrayCopy();
            }
            $values = array_values(array_filter((array) $rawValues, fn ($value) => $value !== null && $value !== ''));
            sort($values);
            $result[$host] = $values;
        }

        return $result;
    }

    private function computeRunningCounts($collection): array
    {
        $pipeline = [
            ['$match' => ['meta.type' => ['$in' => ['docker', 'proxmox']], 'metric' => 'status']],
            ['$sort' => ['timestamp' => -1]],
            [
                '$group' => [
                    '_id' => [
                        'type' => '$meta.type',
                        'host' => '$meta.host',
                        'container' => '$meta.container',
                    ],
                    'value' => ['$first' => '$value'],
                ],
            ],
            [
                '$group' => [
                    '_id' => '$_id.type',
                    'total' => ['$sum' => 1],
                    'running' => [
                        '$sum' => [
                            '$cond' => [
                                ['$eq' => ['$value', 1]],
                                1,
                                0,
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $cursor = $collection->aggregate($pipeline);
        $counts = [
            'docker' => ['total' => 0, 'running' => 0],
            'proxmox' => ['total' => 0, 'running' => 0],
        ];

        foreach ($cursor as $row) {
            $type = $row['_id'] ?? null;
            if (!$type || !isset($counts[$type])) {
                continue;
            }
            $counts[$type]['total'] = (int) ($row['total'] ?? 0);
            $counts[$type]['running'] = (int) ($row['running'] ?? 0);
        }

        return $counts;
    }

    private function computeContainerStatuses($collection): array
    {
        $pipeline = [
            ['$match' => ['meta.type' => ['$in' => ['docker', 'proxmox']], 'metric' => 'status']],
            ['$sort' => ['timestamp' => -1]],
            [
                '$group' => [
                    '_id' => [
                        'type' => '$meta.type',
                        'host' => '$meta.host',
                        'container' => '$meta.container',
                    ],
                    'value' => ['$first' => '$value'],
                ],
            ],
            [
                '$group' => [
                    '_id' => [
                        'type' => '$_id.type',
                        'host' => '$_id.host',
                    ],
                    'containers' => [
                        '$push' => [
                            'name' => '$_id.container',
                            'value' => '$value',
                        ],
                    ],
                ],
            ],
        ];

        $cursor = $collection->aggregate($pipeline);
        $result = [
            'docker' => [],
            'proxmox' => [],
        ];

        foreach ($cursor as $row) {
            $type = $row['_id']['type'] ?? null;
            $host = $row['_id']['host'] ?? null;
            if (!$type || !$host || !isset($result[$type])) {
                continue;
            }
            $containers = [];
            foreach ($row['containers'] ?? [] as $entry) {
                $name = $entry['name'] ?? null;
                if (!$name) {
                    continue;
                }
                $value = $entry['value'] ?? 0;
                $containers[$name] = (float) $value >= 1;
            }
            $result[$type][$host] = $containers;
        }

        return $result;
    }

    private function mapContainersWithStatus(array $containers, array $statusMap): array
    {
        $items = [];
        foreach ($containers as $container) {
            $items[] = [
                'name' => $container,
                'running' => $statusMap[$container] ?? null,
            ];
        }
        usort($items, function (array $a, array $b) {
            $aRank = $a['running'] === true ? 0 : ($a['running'] === false ? 1 : 2);
            $bRank = $b['running'] === true ? 0 : ($b['running'] === false ? 1 : 2);
            if ($aRank !== $bRank) {
                return $aRank <=> $bRank;
            }
            return strcmp($a['name'], $b['name']);
        });
        return $items;
    }
}
