<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestEvent extends Model
{
    public $fillable = ['endpoint', 'response_time_ms', 'performed_at', 'meta'];
}
