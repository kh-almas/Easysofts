<?php

use Illuminate\Support\Facades\Route;
use Modules\Inventory\Http\Controllers\InventoryController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/inventory-txns', [InventoryController::class, 'index'])->name('inventory-txns.index');
    Route::post('/inventory-txns', [InventoryController::class, 'store'])->name('inventory-txns.store');
    Route::put('/inventory-txns/{inventoryTxn}', [InventoryController::class, 'update'])->name('inventory-txns.update');
    Route::delete('/inventory-txns/{inventoryTxn}', [InventoryController::class, 'destroy'])->name('inventory-txns.destroy');
});
