<?php

return [
    'tree_cache_minutes' => (int) env('METRICS_TREE_CACHE_MINUTES', 60),
    'tree_default_days' => (int) env('METRICS_TREE_DEFAULT_DAYS', 30),
    'tree_active_days' => (int) env('METRICS_TREE_ACTIVE_DAYS', 3),
];
