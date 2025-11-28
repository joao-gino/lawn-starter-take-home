<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('request_metrics', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('avg_response_time_ms')->default(0);
            $table->unsignedTinyInteger('most_popular_hour')->nullable();
            $table->timestamp('sampled_from')->nullable();
            $table->timestamp('sampled_to')->nullable();
            $table->timestamp('computed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_metrics');
    }
};
