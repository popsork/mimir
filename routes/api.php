<?php

use App\Http\Controllers\LogQueryController;
use App\Http\Controllers\MetricsController;
use Illuminate\Support\Facades\Route;

Route::get('logs', [LogQueryController::class, 'index'])
    ->name('api.logs.index');

Route::get('logs/filters', [LogQueryController::class, 'filters'])
    ->name('api.logs.filters');

Route::get('metrics', [MetricsController::class, 'index'])
    ->name('api.metrics.index');

Route::get('metrics/tree', [MetricsController::class, 'tree'])
    ->name('api.metrics.tree');

Route::get('metrics/container', [MetricsController::class, 'containerMetrics'])
    ->name('api.metrics.container');

Route::get('metrics/device-history', [MetricsController::class, 'deviceHistory'])
    ->name('api.metrics.device-history');

Route::get('metrics/device-series', [MetricsController::class, 'deviceSeries'])
    ->name('api.metrics.device-series');

Route::get('metrics/container-history', [MetricsController::class, 'containerHistory'])
    ->name('api.metrics.container-history');

Route::get('metrics/overview', [MetricsController::class, 'overview'])
    ->name('api.metrics.overview');

Route::get('metrics/containers-overview', [MetricsController::class, 'containersOverview'])
    ->name('api.metrics.containers-overview');
