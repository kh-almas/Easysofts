<?php

use Illuminate\Support\Facades\Route;
use Modules\Factory\Http\Controllers\FactoryController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('factories', FactoryController::class)->names('factory');
});
