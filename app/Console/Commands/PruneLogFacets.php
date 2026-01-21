<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use MongoDB\BSON\UTCDateTime;

class PruneLogFacets extends Command
{
    protected $signature = 'logs:prune-facets';
    protected $description = 'Remove log facet values that have not been seen within the retention window.';

    public function handle(): int
    {
        $days = (int) config('logs.retention_days', 90);
        $days = max(1, $days);
        $cutoff = new UTCDateTime((int) round((microtime(true) - ($days * 86400)) * 1000));

        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('log_facets');

        $result = $collection->deleteMany(['last_seen' => ['$lt' => $cutoff]]);

        $this->info('Pruned facets: ' . $result->getDeletedCount());

        return Command::SUCCESS;
    }
}
