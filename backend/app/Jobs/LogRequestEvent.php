<?php

namespace App\Jobs;

use App\Models\RequestEvent;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class LogRequestEvent implements ShouldQueue
{
    use Queueable;

    protected string $endpoint;
    protected int $duration;

    /**
     * Create a new job instance.
     */
    public function __construct(
        string $endpoint,
        int $duration
    )
    {
        $this->endpoint = $endpoint;
        $this->duration = $duration;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        RequestEvent::create([
            'endpoint' => $this->endpoint,
            'response_time_ms' => $this->duration,
            'performed_at' => now(),
        ]);
    }
}
