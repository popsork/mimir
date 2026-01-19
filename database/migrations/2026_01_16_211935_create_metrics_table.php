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
        $options = [
            'timeseries' => [
                'timeField' => 'timestamp',
                'metaField' => 'meta',
                'granularity' => 'seconds'
            ]
        ];

        Schema::create('metrics', null, $options);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('metrics');
    }
};
