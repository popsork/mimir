import {type TickFunction, type TickRegisterResult, useMetricsTickerStore} from "~/stores/metrics/ticker";

export const useMetricsTicker = (fn:TickFunction) => {
  const tickerStore = useMetricsTickerStore();
  let ref : TickRegisterResult | null = null;

  onMounted(() => {
    ref = tickerStore.register(fn);
  });

  onUnmounted(() => {
    if (!ref) {
      return;
    }

    ref.destroy();
    ref = null;
  });
};
