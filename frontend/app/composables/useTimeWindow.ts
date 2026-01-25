import { useMetricsWindowStore } from '~/stores/metrics/window';

export const useTimeWindow = () => {
  const windowStore = useMetricsWindowStore();
  const { windowMinutes } = storeToRefs(windowStore);

  const windowOptions = [5, 15, 30, 60, 120, 360, 720, 1440];

  const formatWindowLabel = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    }
    const hours = minutes / 60;
    if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    return '24 hours';
  };

  const setWindowMinutes = (value: number) => {
    windowStore.setWindowMinutes(value);
  };

  return {
    windowMinutes,
    windowOptions,
    formatWindowLabel,
    setWindowMinutes,
  };
};
