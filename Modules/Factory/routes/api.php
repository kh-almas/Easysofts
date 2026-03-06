<?php

use Illuminate\Support\Facades\Route;
use Modules\Factory\Http\Controllers\FactoryController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('factories', FactoryController::class)->names('factory');
});
