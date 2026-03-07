<?php

use Illuminate\Support\Facades\Route;
use Modules\BuyerOrder\Http\Controllers\BuyerOrderController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/buyer-orders', [BuyerOrderController::class, 'index'])->name('buyer-orders.index');
    Route::post('/buyer-orders', [BuyerOrderController::class, 'store'])->name('buyer-orders.store');
    Route::put('/buyer-orders/{buyerOrder}', [BuyerOrderController::class, 'update'])->name('buyer-orders.update');
    Route::delete('/buyer-orders/{buyerOrder}', [BuyerOrderController::class, 'destroy'])->name('buyer-orders.destroy');
});
