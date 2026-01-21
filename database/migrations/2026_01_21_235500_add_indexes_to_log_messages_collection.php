<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('log_messages');

        $collection->createIndex(['timestamp' => -1], ['name' => 'log_messages_timestamp_desc']);
        $collection->createIndex(['level' => 1, 'timestamp' => -1], ['name' => 'log_messages_level_timestamp']);
        $collection->createIndex(['stream' => 1, 'timestamp' => -1], ['name' => 'log_messages_stream_timestamp']);
        $collection->createIndex(['logger' => 1, 'timestamp' => -1], ['name' => 'log_messages_logger_timestamp']);
        $collection->createIndex(['workload' => 1, 'timestamp' => -1], ['name' => 'log_messages_workload_timestamp']);
        $collection->createIndex(['meta.workload' => 1, 'timestamp' => -1], ['name' => 'log_messages_meta_workload_timestamp']);
        $collection->createIndex(['meta.host' => 1, 'timestamp' => -1], ['name' => 'log_messages_meta_host_timestamp']);
        $collection->createIndex(['meta.container' => 1, 'timestamp' => -1], ['name' => 'log_messages_meta_container_timestamp']);
        $collection->createIndex(['meta.image' => 1, 'timestamp' => -1], ['name' => 'log_messages_meta_image_timestamp']);
        $collection->createIndex(['meta.identifier' => 1, 'timestamp' => -1], ['name' => 'log_messages_meta_identifier_timestamp']);
    }

    public function down(): void
    {
        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('log_messages');

        $indexNames = [
            'log_messages_timestamp_desc',
            'log_messages_level_timestamp',
            'log_messages_stream_timestamp',
            'log_messages_logger_timestamp',
            'log_messages_workload_timestamp',
            'log_messages_meta_workload_timestamp',
            'log_messages_meta_host_timestamp',
            'log_messages_meta_container_timestamp',
            'log_messages_meta_image_timestamp',
            'log_messages_meta_identifier_timestamp',
        ];

        foreach ($indexNames as $name) {
            try {
                $collection->dropIndex($name);
            } catch (\Throwable $e) {
                // Ignore missing indexes so down() can be re-run safely.
            }
        }
    }
};
