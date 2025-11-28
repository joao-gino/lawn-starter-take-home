<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestMetric extends Model
{
    public $fillable = ['avg_response_time_ms', 'most_popular_hour', 'sampled_from', 'sampled_to', 'computed_at'];
}
