<?php

use Illuminate\Support\Facades\Route;
use Modules\BuyerOrder\Http\Controllers\BuyerOrderController;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function () {
    Route::apiResource('buyerorders', BuyerOrderController::class)->names('buyerorder');
});
