<?php

use App\Http\Controllers\Tenant\AuthController as TenantAuthController;
use App\Http\Controllers\Tenant\DashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Lab Routes
|--------------------------------------------------------------------------
*/
Route::prefix('diagnostic')->group(function () {
    // Public
    Route::post('login', [TenantAuthController::class, 'login']);

    // Protected
    Route::middleware('auth:tenant')->group(function () {
        Route::get('profile', [TenantAuthController::class, 'profile']);
        Route::post('logout', [TenantAuthController::class, 'logout']);
        Route::get('dashboard', [DashboardController::class, 'index']);
    });
});
