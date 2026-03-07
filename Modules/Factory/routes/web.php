<?php

use Illuminate\Support\Facades\Route;
use Modules\Factory\Http\Controllers\FactoryController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/factories', [FactoryController::class, 'index'])->name('factories.index');
    Route::post('/factories', [FactoryController::class, 'store'])->name('factories.store');
    Route::put('/factories/{factory}', [FactoryController::class, 'update'])->name('factories.update');
    Route::delete('/factories/{factory}', [FactoryController::class, 'destroy'])->name('factories.destroy');
});
