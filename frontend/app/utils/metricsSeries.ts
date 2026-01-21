export type HistoryPoint = {
  timestamp: string | null;
  value: number | null;
};

export type SeriesPoint = {
  timestamp: string;
  value: number;
};

const sortPoints = (points: HistoryPoint[]) => {
  return points
    .filter(point => Boolean(point.timestamp))
    .map(point => ({
      timestamp: point.timestamp as string,
      value: typeof point.value === 'number' ? point.value : 0,
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const toRateSeries = (points: HistoryPoint[]) => {
  const sorted = sortPoints(points);
  const rates: SeriesPoint[] = [];
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1];
    const current = sorted[i];
    if (!prev || !current) {
      continue;
    }
    const deltaValue = current.value - prev.value;
    const deltaTime = (new Date(current.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 1000;
    if (deltaTime <= 0) {
      continue;
    }
    const rate = deltaValue / deltaTime;
    rates.push({
      timestamp: current.timestamp,
      value: rate < 0 ? 0 : rate,
    });
  }
  return rates;
};

export const mergeSeries = (seriesByKey: Record<string, HistoryPoint[] | SeriesPoint[]>) => {
  const map = new Map<string, Record<string, number | string>>();
  for (const [key, points] of Object.entries(seriesByKey)) {
    for (const point of points) {
      const timestamp = point.timestamp;
      if (!timestamp) {
        continue;
      }
      const entry = map.get(timestamp) ?? { timestamp };
      entry[key] = typeof point.value === 'number' ? point.value : 0;
      map.set(timestamp, entry);
    }
  }
  return Array.from(map.values()).sort((a, b) => {
    const aTime = new Date(a.timestamp as string).getTime();
    const bTime = new Date(b.timestamp as string).getTime();
    return aTime - bTime;
  });
};
