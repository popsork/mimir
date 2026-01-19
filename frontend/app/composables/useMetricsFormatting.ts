type MetricSample = {
  unit: string | null;
  value: number | null;
};

export const useMetricsFormatting = () => {
  const formatBytes = (value: number) => {
    if (value === 0) {
      return '0 B';
    }
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let index = 0;
    let scaled = value;
    while (scaled >= 1024 && index < units.length - 1) {
      scaled /= 1024;
      index += 1;
    }
    const formatter = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: scaled < 10 ? 2 : 1
    });
    return `${formatter.format(scaled)} ${units[index]}`;
  };

  const normalizePercent = (value: number) => {
    return value <= 1 ? value * 100 : value;
  };

  const formatValue = (value: number | null, unit: string | null) => {
    if (value === null) {
      return '—';
    }
    const unitKey = (unit || '').toLowerCase();
    if (unitKey === 'bytes') {
      return formatBytes(value);
    }
    if (unitKey === 'pct' || unitKey === '%') {
      const formatter = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 1
      });
      return `${formatter.format(normalizePercent(value))} %`;
    }
    if (unitKey === 'pct_raw') {
      const formatter = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 2
      });
      return `${formatter.format(value)} %`;
    }
    const formatter = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: value < 10 ? 2 : 1
    });
    const label = formatter.format(value);
    return unit ? `${label} ${unit}` : label;
  };

  const formatDurationSeconds = (value: number | null) => {
    if (value === null) {
      return '—';
    }
    const totalSeconds = Math.max(0, Math.floor(value));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const formatUnixSeconds = (value: number | null) => {
    if (value === null) {
      return '—';
    }
    return new Date(value * 1000).toLocaleString();
  };

  const formatNumber = (value: number | null, maximumFractionDigits = 2) => {
    if (value === null) {
      return '—';
    }
    const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits });
    return formatter.format(value);
  };

  const gaugeMax = (metric: MetricSample) => {
    const unit = (metric.unit || '').toLowerCase();
    if (unit === '%' || unit === 'percent' || unit === 'pct' || unit === 'pct_raw') {
      return 100;
    }
    if (unit === 'c') {
      return 100;
    }
    if (metric.value !== null && metric.value >= 0 && metric.value <= 1 && (unit === '' || unit === 'ratio')) {
      return 1;
    }
    if (metric.value === null || metric.value === 0) {
      return 1;
    }
    return metric.value * 1.25;
  };

  const gaugePercent = (metric: MetricSample) => {
    if (metric.value === null) {
      return 0;
    }
    if ((metric.unit || '').toLowerCase() === 'pct') {
      return Math.min(100, Math.round(normalizePercent(metric.value)));
    }
    if ((metric.unit || '').toLowerCase() === 'pct_raw') {
      return Math.min(100, Math.round(metric.value));
    }
    const max = gaugeMax(metric);
    return Math.min(100, Math.round((metric.value / max) * 100));
  };

  const gaugeTone = (metric: MetricSample) => {
    const unit = (metric.unit || '').toLowerCase();
    if (unit !== '%' && unit !== 'percent' && unit !== 'pct' && unit !== 'pct_raw') {
      return 'neutral';
    }
    const percent = gaugePercent(metric);
    if (percent >= 85) {
      return 'danger';
    }
    if (percent >= 65) {
      return 'warning';
    }
    return 'success';
  };

  const formatTime = (timestamp: string | null) => {
    return timestamp ? new Date(timestamp).toLocaleTimeString() : '—';
  };

  return {
    formatValue,
    formatDurationSeconds,
    formatUnixSeconds,
    formatNumber,
    normalizePercent,
    gaugePercent,
    gaugeTone,
    formatTime,
  };
};
