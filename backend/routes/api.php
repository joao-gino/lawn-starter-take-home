<?php

use App\Http\Controllers\StatisticsController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SwapiController;

Route::get('/swapi/{resource}/{identifier?}', [SwapiController::class, 'proxy'])
    ->where([
        'resource' => '[A-Za-z-]+',
        'identifier' => '.*',
    ]);

Route::get('/stats/average-request-time', [StatisticsController::class, 'averageRequestTime']);
Route::get('/stats/most-popular-hour', [StatisticsController::class, 'mostPopularHour']);