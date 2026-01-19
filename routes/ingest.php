<?php

use App\Http\Controllers\LogIngestController;
use Illuminate\Support\Facades\Route;

Route::post('logs/ingest', [LogIngestController::class, 'ingest'])
    ->name('api.logs.ingest')
    ->withoutMiddleware([
        \Illuminate\Routing\Middleware\ThrottleRequests::class,
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
        \Illuminate\Foundation\Http\Middleware\InvokeDeferredCallbacks::class,
        \Illuminate\Http\Middleware\TrustHosts::class,
        \Illuminate\Http\Middleware\TrustProxies::class,
        \Illuminate\Http\Middleware\HandleCors::class,
        \Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance::class,
        \Illuminate\Foundation\Http\Middleware\TrimStrings::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
        \Illuminate\Http\Middleware\ValidatePathEncoding::class,
        \Illuminate\Http\Middleware\ValidatePostSize::class,
    ]);
