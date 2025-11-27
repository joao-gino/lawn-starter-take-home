<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SwapiController;

Route::get('/swapi/{resource}/{identifier?}', [SwapiController::class, 'proxy'])
    ->where([
        'resource' => '[A-Za-z-]+',
        'identifier' => '.*',
    ]);