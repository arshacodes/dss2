<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CartItemController;
use App\Http\Controllers\OrderItemController;

// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', function (Request $request) {
    $request->user()->currentAccessToken()->delete();
    return response()->json(['message' => 'Logged out']);
});

// Authenticated routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::post('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);

    Route::get('/cart', [CartController::class, 'show']);
    Route::delete('/cart/items/{id}', [CartItemController::class, 'destroy']);
    Route::post('/cart/items', [CartItemController::class, 'store']);
    Route::get('/cart/items', [CartItemController::class, 'show']);

    Route::get('products/{id}', [ProductController::class, 'show']);

    Route::post('/orders', [OrderController::class, 'store']);
});

Route::get('/test', function () {
    return response()->json(['message' => 'Backend is reachable']);
});