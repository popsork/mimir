<?php

namespace App\Http\Controllers;

use DateTimeImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use MongoDB\BSON\UTCDateTime;
use Symfony\Component\HttpFoundation\Response;

class LogIngestController extends Controller
{
    public function ingest(Request $request): Response
    {
        // 1) Super-tunn auth (statisk token)
        $expected = (string) config('services.log_ingest.token', env('LOG_INGEST_TOKEN', ''));
        if ($expected === '') {
            return response('ingest token not configured', 500);
        }

        $auth = (string) $request->header('Authorization', '');
        if (!$this->isBearerToken($auth, $expected)) {
            return response('unauthorized', 401);
        }

        $raw = $request->getContent();
        if ($raw === '' || $raw === null) {
            return response('', 204);
        }

        $lines = preg_split("/\r\n|\n|\r/", $raw);
        if (!$lines) {
            return response('', 204);
        }

        $docs = [];
        $docsCount = 0;

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '') continue;

            $event = json_decode($line, true);
            if (!is_array($event)) {
                continue;
            }

            $tsStr = $event['ts'] ?? $event['timestamp'] ?? null;
            $meta  = $event['meta'] ?? null;
            $msg   = $event['message'] ?? null;

            if (!is_string($tsStr) || $tsStr === '' || !is_array($meta) || !is_string($msg)) {
                continue;
            }

            $ts = $this->toUtcDateTime($tsStr);
            if ($ts === null) continue;

            $doc = [
                'timestamp' => $ts,
                'meta' => $meta,
                'message' => $msg,
            ];

            if (isset($event['level']) && is_string($event['level'])) {
                $doc['level'] = $event['level'];
            }
            if (isset($event['stream']) && is_string($event['stream'])) {
                $doc['stream'] = $event['stream'];
            }

            foreach (['trace_id', 'request_id', 'logger'] as $k) {
                if (isset($event[$k]) && (is_string($event[$k]) || is_int($event[$k]))) {
                    $doc[$k] = $event[$k];
                }
            }

            $docs[] = $doc;
            $docsCount++;

            if (count($docs) >= 1000) {
                $this->insertMany($docs);
                $docs = [];
            }
        }

        if (!empty($docs)) {
            $this->insertMany($docs);
        }

        return response('', 204);
    }

    private function insertMany(array $docs): void
    {
        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('log_messages');

        $collection->insertMany($docs, ['ordered' => false]);
    }

    private function isBearerToken(string $header, string $expected): bool
    {
        if (stripos($header, 'Bearer ') !== 0) return false;
        $token = substr($header, 7);

        return hash_equals($expected, $token);
    }

    private function toUtcDateTime(string $rfc3339): ?UTCDateTime
    {
        try {
            $dt = new DateTimeImmutable($rfc3339);
            $ms = (int) $dt->format('Uv');
            return new UTCDateTime($ms);
        } catch (\Throwable $e) {
            return null;
        }
    }
}
