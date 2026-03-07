<?php

use Illuminate\Support\Facades\Route;
use Modules\Product\Http\Controllers\BomItemController;
use Modules\Product\Http\Controllers\ProductController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

    Route::get('/bom-items', [BomItemController::class, 'index'])->name('bom-items.index');
    Route::post('/bom-items', [BomItemController::class, 'store'])->name('bom-items.store');
    Route::put('/bom-items/{bomItem}', [BomItemController::class, 'update'])->name('bom-items.update');
    Route::delete('/bom-items/{bomItem}', [BomItemController::class, 'destroy'])->name('bom-items.destroy');
});
