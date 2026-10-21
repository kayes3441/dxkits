<?php

use Illuminate\Support\Facades\Route;

// Serve the React SPA for all non-API routes. The negative lookahead keeps
// this catch-all from shadowing the API route groups registered in
// bootstrap/app.php.
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '(?!api(?:/|$)).*');
