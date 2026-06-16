<?php

use App\Http\Controllers\Api\AdminArticleController;
use App\Http\Controllers\Api\AdminTagController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TagController;
use Illuminate\Support\Facades\Route;

// Health check
Route::get('/health', fn () => response()->json(['status' => 'ok']));

// Public
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{slug}', [ArticleController::class, 'show']);
Route::get('/tags', [TagController::class, 'index']);

// Auth
Route::post('/login', [AuthController::class, 'login']);

// Admin (requires Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::prefix('admin')->group(function () {
        Route::apiResource('articles', AdminArticleController::class);
        Route::apiResource('tags', AdminTagController::class)->except(['show']);
    });
});
