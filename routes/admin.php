<?php

use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\DiagnosticController;
use App\Http\Controllers\Admin\InvoiceController;
use App\Http\Controllers\Admin\ModuleController;
use App\Http\Controllers\Admin\PasswordResetController;
use App\Http\Controllers\Admin\SubscriptionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->group(function () {
    // Public
    Route::post('login', [AdminAuthController::class, 'login']);
    Route::post('forgot-password', [PasswordResetController::class, 'forgotPassword']);
    Route::post('reset-password', [PasswordResetController::class, 'resetPassword']);

    // Protected
    Route::middleware('auth:admin')->group(function () {
        Route::get('me', [AdminAuthController::class, 'me']);
        Route::put('profile', [AdminAuthController::class, 'update']);
        Route::post('logout', [AdminAuthController::class, 'logout']);
        Route::post('refresh', [AdminAuthController::class, 'refresh']);

        // Dashboard stats
        Route::get('stats', [DiagnosticController::class, 'stats']);

        // Diagnostic centers (tenants)
        Route::apiResource('diagnostics', DiagnosticController::class);

        // Modules (config-based)
        Route::get('modules', [ModuleController::class, 'index']);
        Route::get('diagnostics/{id}/modules', [ModuleController::class, 'tenantModules']);
        Route::put('diagnostics/{id}/modules', [ModuleController::class, 'syncTenantModules']);

        // Subscription management
        Route::prefix('diagnostics/{id}/subscription')->group(function () {
            Route::post('renew', [SubscriptionController::class, 'renew']);
            Route::post('suspend', [SubscriptionController::class, 'suspend']);
            Route::post('activate', [SubscriptionController::class, 'activate']);
            Route::get('logs', [SubscriptionController::class, 'logs']);
        });

        // Payment status
        Route::put('diagnostics/{id}/payment-status', [SubscriptionController::class, 'updatePaymentStatus']);

        // Invoices
        Route::get('diagnostics/{id}/invoices', [InvoiceController::class, 'index']);
        Route::put('invoices/{id}', [InvoiceController::class, 'update']);
    });
});
