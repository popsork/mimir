<?php

use Illuminate\Support\Facades\DB;

beforeEach(function () {
    if (!mongoAvailable()) {
        $this->markTestSkipped('MongoDB not available.');
    }

    ensureMongoCollection('log_messages', [
        'timeseries' => [
            'timeField' => 'timestamp',
            'metaField' => 'meta',
            'granularity' => 'seconds',
        ],
    ]);
    ensureMongoCollection('log_facets');

    clearMongoCollection('log_messages');
    clearMongoCollection('log_facets');

    config(['services.log_ingest.token' => 'testtoken']);
});

it('ingests and queries logs with filters', function () {
    $older = now()->subMinutes(10)->toIso8601String();
    $recent = now()->subMinutes(1)->toIso8601String();

    $payload = json_encode([
        'ts' => $older,
        'level' => 'info',
        'stream' => 'stdout',
        'message' => 'old message',
        'meta' => [
            'host' => 'alpha',
            'workload' => 'api',
        ],
    ]) . "\n" . json_encode([
        'ts' => $recent,
        'level' => 'error',
        'stream' => 'stderr',
        'message' => 'recent message',
        'meta' => [
            'host' => 'alpha',
            'workload' => 'api',
        ],
    ]);

    $this->withHeader('Authorization', 'Bearer testtoken')
        ->call('POST', '/api/logs/ingest', [], [], [], ['CONTENT_TYPE' => 'application/json'], $payload)
        ->assertStatus(204);

    $response = $this->getJson('/api/logs?levels=error');
    $response->assertOk()->assertJsonCount(1, 'data');
    expect($response->json('data.0.level'))->toBe('error');

    $from = now()->subMinutes(5)->toIso8601String();
    $response = $this->getJson('/api/logs?from=' . urlencode($from));
    $response->assertOk()->assertJsonCount(1, 'data');
});

it('returns facet filters from ingested logs', function () {
    $payload = json_encode([
        'ts' => now()->subMinutes(2)->toIso8601String(),
        'level' => 'info',
        'stream' => 'stdout',
        'message' => 'first message',
        'meta' => [
            'host' => 'alpha',
            'workload' => 'api',
            'identifier' => 'svc-a',
        ],
    ]) . "\n" . json_encode([
        'ts' => now()->subMinutes(1)->toIso8601String(),
        'level' => 'warn',
        'stream' => 'stderr',
        'message' => 'second message',
        'meta' => [
            'host' => 'beta',
            'workload' => 'web',
            'identifier' => 'svc-b',
        ],
    ]);

    $this->withHeader('Authorization', 'Bearer testtoken')
        ->call('POST', '/api/logs/ingest', [], [], [], ['CONTENT_TYPE' => 'application/json'], $payload)
        ->assertStatus(204);

    $response = $this->getJson('/api/logs/filters');
    $response->assertOk();

    $levels = $response->json('levels');
    $workloads = $response->json('workloads');
    $identifiers = $response->json('identifiers');

    expect($levels)->toContain('info')->toContain('warn');
    expect($workloads)->toContain('api')->toContain('web');
    expect($identifiers)->toContain('svc-a')->toContain('svc-b');
});
