<?php

namespace App\Http\Controllers;

use DateTimeImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use MongoDB\BSON\Regex;
use MongoDB\BSON\UTCDateTime;
use Symfony\Component\HttpFoundation\Response;

class LogQueryController extends Controller
{
    public function filters(Request $request): Response
    {
        $filters = [
            'levels' => $this->facetValues('level'),
            'streams' => $this->facetValues('stream'),
            'workloads' => $this->facetValues('workload'),
            'hosts' => $this->facetValues('host'),
            'containers' => $this->facetValues('container'),
            'images' => $this->facetValues('image'),
            'identifiers' => $this->facetValues('identifier'),
            'loggers' => $this->facetValues('logger'),
        ];

        return response()->json($filters);
    }

    public function index(Request $request): Response
    {
        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('log_messages');

        $match = $this->buildMatch($request);

        $limit = (int) $request->query('limit', 200);
        $limit = max(1, min($limit, 1000));

        $cursor = $collection->find(
            $match,
            [
                'sort' => ['timestamp' => -1],
                'limit' => $limit,
                'projection' => [
                    'timestamp' => 1,
                    'level' => 1,
                    'message' => 1,
                    'stream' => 1,
                    'logger' => 1,
                    'trace_id' => 1,
                    'request_id' => 1,
                    'workload' => 1,
                    'meta' => 1,
                ],
            ]
        );

        $logs = [];
        foreach ($cursor as $doc) {
            $meta = $doc['meta'] ?? [];
            $logs[] = [
                'id' => (string) ($doc['_id'] ?? ''),
                'timestamp' => $this->formatTimestamp($doc['timestamp'] ?? null),
                'level' => $doc['level'] ?? null,
                'message' => $doc['message'] ?? '',
                'stream' => $doc['stream'] ?? null,
                'logger' => $doc['logger'] ?? null,
                'trace_id' => $doc['trace_id'] ?? null,
                'request_id' => $doc['request_id'] ?? null,
                'workload' => $doc['workload'] ?? ($meta['workload'] ?? null),
                'host' => $meta['host'] ?? null,
                'container' => $meta['container'] ?? null,
                'image' => $meta['image'] ?? null,
                'identifier' => $meta['identifier'] ?? null,
            ];
        }

        return response()->json([
            'data' => $logs,
        ]);
    }

    private function buildMatch(Request $request): array
    {
        $match = [];

        $from = $this->parseDate($request->query('from'));
        $to = $this->parseDate($request->query('to'));
        if ($from || $to) {
            $range = [];
            if ($from) {
                $range['$gte'] = $from;
            }
            if ($to) {
                $range['$lte'] = $to;
            }
            $match['timestamp'] = $range;
        }

        $query = trim((string) $request->query('q', ''));
        if ($query !== '') {
            $match['message'] = new Regex($query, 'i');
        }

        $levels = $this->normalizeList($request->query('levels'));
        if (!empty($levels)) {
            $match['level'] = ['$in' => $levels];
        }

        $streams = $this->normalizeList($request->query('streams'));
        if (!empty($streams)) {
            $match['stream'] = ['$in' => $streams];
        }

        $workloads = $this->normalizeList($request->query('workloads'));
        if (!empty($workloads)) {
            $match['meta.workload'] = ['$in' => $workloads];
        }

        $hosts = $this->normalizeList($request->query('hosts'));
        if (!empty($hosts)) {
            $match['meta.host'] = ['$in' => $hosts];
        }

        $containers = $this->normalizeList($request->query('containers'));
        if (!empty($containers)) {
            $match['meta.container'] = ['$in' => $containers];
        }

        $images = $this->normalizeList($request->query('images'));
        if (!empty($images)) {
            $match['meta.image'] = ['$in' => $images];
        }

        $identifiers = $this->normalizeList($request->query('identifiers'));
        if (!empty($identifiers)) {
            $match['meta.identifier'] = ['$in' => $identifiers];
        }

        $loggers = $this->normalizeList($request->query('loggers'));
        if (!empty($loggers)) {
            $match['logger'] = ['$in' => $loggers];
        }

        return $match;
    }

    private function normalizeList(mixed $value): array
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

    private function parseDate(mixed $value): ?UTCDateTime
    {
        if (!is_string($value) || trim($value) === '') {
            return null;
        }

        try {
            $dt = new DateTimeImmutable($value);
            $ms = (int) $dt->format('Uv');
            return new UTCDateTime($ms);
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function formatTimestamp(mixed $value): ?string
    {
        if (!$value instanceof UTCDateTime) {
            return null;
        }

        return $value->toDateTime()->format(DATE_ATOM);
    }

    private function facetValues(string $type): array
    {
        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('log_facets');

        $cursor = $collection->find(
            ['type' => $type],
            [
                'projection' => ['value' => 1, '_id' => 0],
                'sort' => ['value' => 1],
            ]
        );

        $values = [];
        foreach ($cursor as $doc) {
            if (isset($doc['value']) && is_string($doc['value']) && $doc['value'] !== '') {
                $values[] = $doc['value'];
            }
        }

        return $values;
    }
}
