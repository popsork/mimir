export type LogsTimeRangePreset = {
  label: string;
  value: string;
  ms: number;
};

export const DEFAULT_LOGS_TIME_RANGE_PRESET = '5m';

export const LOGS_TIME_RANGE_PRESETS: LogsTimeRangePreset[] = [
  { label: 'Last 1 minute', value: '1m', ms: 1 * 60 * 1000 },
  { label: 'Last 5 minutes', value: '5m', ms: 5 * 60 * 1000 },
  { label: 'Last 15 minutes', value: '15m', ms: 15 * 60 * 1000 },
  { label: 'Last 30 minutes', value: '30m', ms: 30 * 60 * 1000 },
  { label: 'Last hour', value: '1h', ms: 60 * 60 * 1000 },
  { label: 'Last 3 hours', value: '3h', ms: 3 * 60 * 60 * 1000 },
  { label: 'Last 6 hours', value: '6h', ms: 6 * 60 * 60 * 1000 },
  { label: 'Last 12 hours', value: '12h', ms: 12 * 60 * 60 * 1000 },
  { label: 'Last 1 day', value: '1d', ms: 24 * 60 * 60 * 1000 },
  { label: 'Last 2 days', value: '2d', ms: 2 * 24 * 60 * 60 * 1000 },
];

export const findLogsTimeRangePreset = (value: string | null) => {
  if (!value) return null;
  return LOGS_TIME_RANGE_PRESETS.find((preset) => preset.value === value) ?? null;
};

export const resolveLogsTimeRangePreset = (value: string | null) => {
  const preset = findLogsTimeRangePreset(value);
  if (!preset) return null;
  const now = new Date();
  const from = new Date(now.getTime() - preset.ms);
  return { from, to: now };
};
