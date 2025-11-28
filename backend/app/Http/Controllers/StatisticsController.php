<?php

namespace App\Http\Controllers;

use App\Models\RequestMetric;

class StatisticsController extends Controller
{
    public function averageRequestTime()
    {
        $metrics = RequestMetric::first();
        return response()->json([
            'average_response_time_ms' => $metrics->avg_response_time_ms ?? 0,
            'sample_window' => [
                'from' => $metrics->sampled_from,
                'to' => $metrics->sampled_to,
            ],
        ]);
    }

    public function mostPopularHour()
    {
        $metrics = RequestMetric::first();
        return response()->json([
            'most_popular_hour' => $metrics->most_popular_hour,
            'sample_window' => [
                'from' => $metrics->sampled_from,
                'to' => $metrics->sampled_to,
            ],
        ]);
    }
}
