<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SuperAdmin\AuthController as SuperAuthController;
use App\Http\Controllers\SuperAdmin\DiagnosticController;
use App\Http\Controllers\SuperAdmin\SubscriptionController;
use App\Http\Controllers\Tenant\AuthController as TenantAuthController;
use App\Http\Controllers\Tenant\DashboardController;

/*
|--------------------------------------------------------------------------
| SuperAdmin Routes
|--------------------------------------------------------------------------
*/
Route::prefix('superadmin')->group(function () {
    // Public
    Route::post('login', [SuperAuthController::class, 'login']);

    // Protected
    Route::middleware('auth:superadmin')->group(function () {
        Route::get('me', [SuperAuthController::class, 'me']);
        Route::post('logout', [SuperAuthController::class, 'logout']);
        Route::post('refresh', [SuperAuthController::class, 'refresh']);

        // Dashboard stats
        Route::get('stats', [DiagnosticController::class, 'stats']);

        // Diagnostic centers (tenants)
        Route::apiResource('diagnostics', DiagnosticController::class);

        // Subscription management
        Route::prefix('diagnostics/{id}/subscription')->group(function () {
            Route::post('renew', [SubscriptionController::class, 'renew']);
            Route::post('suspend', [SubscriptionController::class, 'suspend']);
            Route::post('activate', [SubscriptionController::class, 'activate']);
            Route::post('change-plan', [SubscriptionController::class, 'changePlan']);
            Route::get('logs', [SubscriptionController::class, 'logs']);
        });
    });
});

/*
|--------------------------------------------------------------------------
| Diagnostic Center (Tenant) Routes
|--------------------------------------------------------------------------
*/
Route::prefix('diagnostic')->group(function () {
    // Public
    Route::post('login', [TenantAuthController::class, 'login']);

    // Protected
    Route::middleware('auth:tenant')->group(function () {
        Route::get('me', [TenantAuthController::class, 'me']);
        Route::post('logout', [TenantAuthController::class, 'logout']);
        Route::get('dashboard', [DashboardController::class, 'index']);
    });
});
