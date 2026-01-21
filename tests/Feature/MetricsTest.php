<?php

use Illuminate\Support\Facades\DB;
use MongoDB\BSON\UTCDateTime;

beforeEach(function () {
    if (!mongoAvailable()) {
        $this->markTestSkipped('MongoDB not available.');
    }

    ensureMongoCollection('metrics', [
        'timeseries' => [
            'timeField' => 'timestamp',
            'metaField' => 'meta',
            'granularity' => 'seconds',
        ],
    ]);

    clearMongoCollection('metrics');
});

it('returns latest metrics grouped by host and device', function () {
    $collection = DB::connection('mongodb')->getMongoDB()->selectCollection('metrics');
    $nowMs = (int) now()->format('Uv');

    $collection->insertMany([
        [
            'timestamp' => new UTCDateTime($nowMs),
            'metric' => 'usage',
            'unit' => 'pct',
            'value' => 42,
            'meta' => ['host' => 'alpha', 'device' => 'cpu', 'type' => 'machine'],
        ],
        [
            'timestamp' => new UTCDateTime($nowMs),
            'metric' => 'usage',
            'unit' => 'pct',
            'value' => 55,
            'meta' => ['host' => 'alpha', 'device' => 'mem', 'type' => 'machine'],
        ],
    ]);

    $response = $this->getJson('/api/metrics?minutes=60');
    $response->assertOk()->assertJsonPath('window_minutes', 60);

    $hosts = $response->json('hosts');
    expect($hosts)->not()->toBeEmpty();
    expect($hosts[0]['host'])->toBe('alpha');
});

it('returns device history points', function () {
    $collection = DB::connection('mongodb')->getMongoDB()->selectCollection('metrics');
    $base = now()->subMinutes(5);

    $collection->insertMany([
        [
            'timestamp' => new UTCDateTime((int) $base->copy()->subMinutes(2)->format('Uv')),
            'metric' => 'usage',
            'unit' => 'pct',
            'value' => 10,
            'meta' => ['host' => 'alpha', 'device' => 'cpu', 'type' => 'machine'],
        ],
        [
            'timestamp' => new UTCDateTime((int) $base->format('Uv')),
            'metric' => 'usage',
            'unit' => 'pct',
            'value' => 20,
            'meta' => ['host' => 'alpha', 'device' => 'cpu', 'type' => 'machine'],
        ],
    ]);

    $response = $this->getJson('/api/metrics/device-history?host=alpha&device=cpu&metric=usage&minutes=120');
    $response->assertOk()->assertJsonPath('host', 'alpha');
    $response->assertJsonPath('device', 'cpu');
    $response->assertJsonPath('metric', 'usage');

    $points = $response->json('points');
    expect($points)->toHaveCount(2);
});

it('returns overview items for machine metrics', function () {
    $collection = DB::connection('mongodb')->getMongoDB()->selectCollection('metrics');
    $nowMs = (int) now()->format('Uv');

    $collection->insertMany([
        [
            'timestamp' => new UTCDateTime($nowMs),
            'metric' => 'usage',
            'unit' => 'pct',
            'value' => 30,
            'meta' => ['host' => 'alpha', 'device' => 'cpu', 'type' => 'machine'],
        ],
        [
            'timestamp' => new UTCDateTime($nowMs),
            'metric' => 'usage',
            'unit' => 'pct',
            'value' => 40,
            'meta' => ['host' => 'alpha', 'device' => 'mem', 'type' => 'machine'],
        ],
        [
            'timestamp' => new UTCDateTime($nowMs),
            'metric' => 'usage',
            'unit' => 'pct',
            'value' => 50,
            'meta' => ['host' => 'alpha', 'device' => 'disk', 'type' => 'machine'],
        ],
    ]);

    $response = $this->getJson('/api/metrics/overview?minutes=60');
    $response->assertOk();

    $items = $response->json('items');
    expect($items)->not()->toBeEmpty();
    expect($items[0]['id'])->toBe('machine:alpha');
});

it('returns device series for multiple metrics', function () {
    $collection = DB::connection('mongodb')->getMongoDB()->selectCollection('metrics');
    $nowMs = (int) now()->format('Uv');

    $collection->insertMany([
        [
            'timestamp' => new UTCDateTime($nowMs),
            'metric' => 'bytes_in',
            'unit' => 'bytes',
            'value' => 1000,
            'meta' => ['host' => 'alpha', 'device' => 'net', 'type' => 'machine'],
        ],
        [
            'timestamp' => new UTCDateTime($nowMs),
            'metric' => 'bytes_out',
            'unit' => 'bytes',
            'value' => 1500,
            'meta' => ['host' => 'alpha', 'device' => 'net', 'type' => 'machine'],
        ],
    ]);

    $response = $this->getJson('/api/metrics/device-series?host=alpha&device=net&metrics=bytes_in,bytes_out&minutes=60');
    $response->assertOk();
    $series = $response->json('series');
    expect($series)->toHaveCount(2);
});

it('returns container history series', function () {
    $collection = DB::connection('mongodb')->getMongoDB()->selectCollection('metrics');
    $nowMs = (int) now()->format('Uv');

    $collection->insertMany([
        [
            'timestamp' => new UTCDateTime($nowMs),
            'metric' => 'cpu_usage_pct',
            'unit' => 'pct',
            'value' => 0.5,
            'meta' => ['host' => 'alpha', 'container' => 'web', 'type' => 'docker'],
        ],
        [
            'timestamp' => new UTCDateTime($nowMs),
            'metric' => 'status',
            'unit' => 'bool',
            'value' => 1,
            'meta' => ['host' => 'alpha', 'container' => 'web', 'type' => 'docker'],
        ],
    ]);

    $response = $this->getJson('/api/metrics/container-history?host=alpha&type=docker&container=web&metrics=cpu_usage_pct,status&minutes=60');
    $response->assertOk();
    $series = $response->json('series');
    expect($series)->toHaveCount(2);
});
