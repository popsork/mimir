# MetricsController Optimization Analysis

## Current State

The `MetricsController` uses MongoDB time-series collection (good!) but has several optimization opportunities.

## Critical Issues

### 1. ❌ No Response Caching on High-Frequency Endpoints

**Problem:**
- `index()` is called every 5 seconds by frontend ticker
- `overview()` and `containersOverview()` are also frequently polled
- No caching = MongoDB query on every request

**Impact:** High MongoDB load, increased latency

**Solution:**
```php
// Add to index() method
$cacheKey = "metrics:index:{$minutes}";
return Cache::remember($cacheKey, 5, function () use ($minutes) {
    // existing aggregation logic
});
```

**Recommended Cache TTLs:**
- `index()`: 5 seconds (matches ticker interval)
- `overview()`: 10 seconds
- `containersOverview()`: 10 seconds
- `deviceSeries()`: 30 seconds (historical data, changes less)
- `containerHistory()`: 30 seconds

### 2. ❌ N+1 Query Pattern in deviceSeries() and containerHistory()

**Problem:**
```php
// Lines 343-349: Runs separate query for each metric
foreach ($metrics as $metric) {
    $match = $baseMatch;
    $match['metric'] = $metric;
    $series[] = [
        'metric' => $metric,
        'points' => $this->fetchHistoryPoints($collection, $match, $limit),
    ];
}
```

For 5 metrics = 5 separate MongoDB queries!

**Impact:** High latency, especially for charts with multiple metrics

**Solution:** Use single aggregation with $facet:
```php
$pipeline = [
    ['$match' => [
        'timestamp' => ['$gte' => $cutoff],
        'meta.host' => $host,
        'meta.device' => $device,
        'metric' => ['$in' => $metrics],  // Single query for all metrics
    ]],
    ['$sort' => ['timestamp' => 1]],
    ['$limit' => $limit * count($metrics)],
    [
        '$group' => [
            '_id' => '$metric',
            'points' => ['$push' => ['timestamp' => '$timestamp', 'value' => '$value']]
        ]
    ]
];
```

### 3. ❌ overview() Runs 2 Separate Aggregations

**Problem:**
```php
// Lines 419-443: Machine metrics aggregation
$machineCursor = $collection->aggregate($machinePipeline);

// Lines 460-481: Proxmox metrics aggregation
$proxmoxCursor = $collection->aggregate($proxmoxPipeline);
```

**Impact:** 2× latency, 2× MongoDB load

**Solution:** Combine into single aggregation with $facet or use concurrent queries

### 4. ⚠️ Missing Compound Indexes

**Current State:**
- Time-series collection has automatic indexes on `timestamp` and `meta`
- But queries also filter by `metric`, `meta.type`, `meta.device`, `meta.container`

**Recommended Additional Indexes:**
```javascript
// For machine metrics queries
db.metrics.createIndex({
  "timestamp": -1,
  "meta.type": 1,
  "meta.host": 1,
  "meta.device": 1,
  "metric": 1
});

// For container metrics queries
db.metrics.createIndex({
  "timestamp": -1,
  "meta.type": 1,
  "meta.host": 1,
  "meta.container": 1,
  "metric": 1
});
```

## Moderate Issues

### 5. ⚠️ Large Result Sets Processed in PHP Memory

**Problem:**
```php
// Lines 100-124: All results loaded into memory
foreach ($cursor as $row) {
    // Build nested arrays in PHP
}
```

**Solution:**
- Use MongoDB aggregation $group to pre-structure data
- Or use streaming/generators for very large datasets

### 6. ⚠️ No Request Validation

**Problem:**
```php
$host = $request->query('host');
$device = $request->query('device');
// Basic string checks only
```

**Solution:** Use FormRequest classes for validation

### 7. ⚠️ No Rate Limiting

**Problem:** Ticker calls `index()` every 5 seconds - no rate limiting if multiple clients

**Solution:** Add rate limiting middleware in routes/api.php

## Performance Benchmarks (Estimated)

### Current Performance
- `index()`: ~100-300ms per request (no cache)
- `deviceSeries(5 metrics)`: ~200-500ms (5 queries)
- `overview()`: ~150-400ms (2 queries)

### After Optimizations
- `index()`: ~5-10ms (cached)
- `deviceSeries(5 metrics)`: ~50-100ms (1 query)
- `overview()`: ~80-150ms (1 query + cache)

**Total Load Reduction:** ~80-90% fewer MongoDB queries

## Implementation Priority

### High Priority (Do First)
1. ✅ Add response caching to `index()`, `overview()`, `containersOverview()`
2. ✅ Fix N+1 pattern in `deviceSeries()` and `containerHistory()`
3. ✅ Create compound indexes

### Medium Priority
4. Combine `overview()` aggregations
5. Add request validation (FormRequests)

### Low Priority
6. Add rate limiting
7. Streaming for large result sets

## Cache Invalidation Strategy

**Current:** No cache invalidation

**Recommended:**
```php
// When new metrics arrive, invalidate caches
Cache::tags(['metrics'])->flush();

// Or use specific keys
Cache::forget("metrics:index:{$minutes}");
```

**Better:** Use Redis with short TTLs (5-30 seconds) - data self-expires

## Code Changes Required

### 1. Add Caching Trait
```php
trait CachesMetrics
{
    private function cacheMetricsResponse(string $key, int $seconds, callable $callback)
    {
        return Cache::tags(['metrics'])->remember($key, $seconds, $callback);
    }
}
```

### 2. Update index() Method
```php
public function index(Request $request): Response
{
    $minutes = (int) $request->query('minutes', 60);
    $minutes = max(1, min($minutes, 1440));

    $cacheKey = "metrics:index:{$minutes}";

    $data = Cache::remember($cacheKey, 5, function () use ($minutes) {
        // existing aggregation logic
    });

    return response()->json($data);
}
```

### 3. Fix deviceSeries() N+1
```php
public function deviceSeries(Request $request): Response
{
    // ... validation ...

    $pipeline = [
        [
            '$match' => [
                'timestamp' => ['$gte' => $cutoff],
                'meta.host' => $host,
                'meta.device' => $device,
                'metric' => ['$in' => $metrics],  // Query all metrics at once
                '$or' => [
                    ['meta.type' => 'machine'],
                    ['meta.type' => ['$exists' => false]],
                ],
            ],
        ],
        ['$sort' => ['timestamp' => 1]],
        ['$limit' => $limit * count($metrics)],
        [
            '$group' => [
                '_id' => '$metric',
                'points' => [
                    '$push' => [
                        'timestamp' => '$timestamp',
                        'value' => '$value',
                    ],
                ],
            ],
        ],
    ];

    $cursor = $collection->aggregate($pipeline);
    $series = [];

    foreach ($cursor as $row) {
        $points = [];
        foreach ($row['points'] as $point) {
            $points[] = [
                'timestamp' => $this->formatTimestamp($point['timestamp'] ?? null),
                'value' => isset($point['value']) ? (float) $point['value'] : null,
            ];
        }

        $series[] = [
            'metric' => $row['_id'],
            'points' => $points,
        ];
    }

    return response()->json([
        'host' => $host,
        'device' => $device,
        'minutes' => $minutes,
        'series' => $series,
    ]);
}
```

## Migration for Indexes

Create: `database/migrations/2026_01_25_create_metrics_indexes.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('metrics');

        // Machine metrics index
        $collection->createIndex([
            'timestamp' => -1,
            'meta.type' => 1,
            'meta.host' => 1,
            'meta.device' => 1,
            'metric' => 1,
        ], ['name' => 'machine_metrics_lookup']);

        // Container metrics index
        $collection->createIndex([
            'timestamp' => -1,
            'meta.type' => 1,
            'meta.host' => 1,
            'meta.container' => 1,
            'metric' => 1,
        ], ['name' => 'container_metrics_lookup']);
    }

    public function down(): void
    {
        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('metrics');

        $collection->dropIndex('machine_metrics_lookup');
        $collection->dropIndex('container_metrics_lookup');
    }
};
```

## Testing Impact

After implementing optimizations:

1. **Load Test:**
   ```bash
   ab -n 1000 -c 10 http://localhost:42100/api/metrics
   ```

2. **Monitor MongoDB:**
   ```javascript
   db.metrics.explain("executionStats").aggregate([...])
   ```

3. **Check Cache Hit Rate:**
   ```php
   Cache::getStore()->getRedis()->info('stats')
   ```

## Conclusion

**Current State:** Functional but inefficient
**Estimated Impact:** 80-90% reduction in database load
**Implementation Time:** ~4-6 hours for high-priority items
**Risk:** Low (caching is safe with short TTLs)

**Recommendation:** Implement high-priority optimizations immediately. These will significantly improve frontend responsiveness and reduce server load.
