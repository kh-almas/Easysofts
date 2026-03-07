<?php

use Illuminate\Support\Facades\Route;
use Modules\Purchase\Http\Controllers\PurchaseController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/purchases', [PurchaseController::class, 'index'])->name('purchases.index');
    Route::post('/purchases', [PurchaseController::class, 'store'])->name('purchases.store');
    Route::put('/purchases/{purchase}', [PurchaseController::class, 'update'])->name('purchases.update');
    Route::delete('/purchases/{purchase}', [PurchaseController::class, 'destroy'])->name('purchases.destroy');
});
