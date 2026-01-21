<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('log_facets');

        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('log_facets');

        $collection->createIndex(['type' => 1, 'value' => 1], ['unique' => true]);
        $collection->createIndex(['type' => 1]);
        $collection->createIndex(['last_seen' => 1]);
    }

    public function down(): void
    {
        Schema::dropIfExists('log_facets');
    }
};
