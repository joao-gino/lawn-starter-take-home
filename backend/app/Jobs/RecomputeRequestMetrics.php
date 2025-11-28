<?php

namespace App\Jobs;

use App\Models\RequestEvent;
use App\Models\RequestMetric;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class RecomputeRequestMetrics implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $avgResponseTime = (int) round(RequestEvent::avg('response_time_ms') ?? 0);

        $mostPopularHour = RequestEvent::selectRaw('HOUR(performed_at) as hour, COUNT(*) as total')
            ->groupBy('hour')
            ->orderByDesc('total')
            ->value('hour');

        $sampledFrom = RequestEvent::min('performed_at');
        $sampledTo   = RequestEvent::max('performed_at');

        RequestMetric::updateOrCreate(
            ['id' => 1],
            [
                'avg_response_time_ms' => $avgResponseTime,
                'most_popular_hour'    => $mostPopularHour,
                'sampled_from'         => $sampledFrom,
                'sampled_to'           => $sampledTo,
                'computed_at'          => now(),
            ]
        );
    }
}
