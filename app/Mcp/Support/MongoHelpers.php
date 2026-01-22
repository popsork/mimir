<?php

namespace App\Mcp\Support;

use DateTimeImmutable;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;
use MongoDB\BSON\Binary;
use MongoDB\BSON\Decimal128;
use MongoDB\BSON\Int64;
use MongoDB\Model\BSONArray;
use MongoDB\Model\BSONDocument;

final class MongoHelpers
{
    public static function parseDate(mixed $value): ?UTCDateTime
    {
        if ($value === null) {
            return null;
        }

        try {
            if (is_int($value) || is_float($value)) {
                return new UTCDateTime(self::normalizeUnixMillis((float) $value));
            }

            if (is_string($value)) {
                $value = trim($value);
                if ($value === '') {
                    return null;
                }

                if (is_numeric($value)) {
                    return new UTCDateTime(self::normalizeUnixMillis((float) $value));
                }

                $dt = new DateTimeImmutable($value);
                $ms = (int) $dt->format('Uv');
                return new UTCDateTime($ms);
            }
        } catch (\Throwable $e) {
            return null;
        }

        return null;
    }

    public static function formatTimestamp(mixed $value): ?string
    {
        if (! $value instanceof UTCDateTime) {
            return null;
        }

        return $value->toDateTime()->format(DATE_ATOM);
    }

    public static function normalizeList(mixed $value): array
    {
        if (is_array($value)) {
            return array_values(array_filter(array_map('strval', $value), fn ($v) => $v !== ''));
        }

        if (is_string($value) && $value !== '') {
            $parts = array_map('trim', explode(',', $value));
            return array_values(array_filter($parts, fn ($v) => $v !== ''));
        }

        return [];
    }

    public static function normalizeBsonValue(mixed $value): mixed
    {
        if ($value instanceof UTCDateTime) {
            return $value->toDateTime()->format(DATE_ATOM);
        }

        if ($value instanceof ObjectId) {
            return (string) $value;
        }

        if ($value instanceof Binary) {
            return base64_encode($value->getData());
        }

        if ($value instanceof Decimal128) {
            return (string) $value;
        }

        if ($value instanceof Int64) {
            return (int) $value;
        }

        if ($value instanceof BSONArray || $value instanceof BSONDocument) {
            $value = $value->getArrayCopy();
        }

        if (is_array($value)) {
            foreach ($value as $key => $item) {
                $value[$key] = self::normalizeBsonValue($item);
            }
        }

        return $value;
    }

    private static function normalizeUnixMillis(float $value): int
    {
        if ($value > 9999999999) {
            return (int) round($value);
        }

        return (int) round($value * 1000);
    }
}
