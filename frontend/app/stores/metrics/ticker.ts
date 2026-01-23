export type TickFunction = () => void;
export type TickRegisterResult = {
  destroy: () => void;
}
export const useMetricsTickerStore = defineStore("metrics-ticker", () => {
  const callbacks = ref([] as TickFunction[]);
  const running = ref(false);
  const timeout = ref(undefined as string | NodeJS.Timeout | number | undefined);
  const interval = ref(5000);

  const register = (fn: TickFunction): TickRegisterResult => {
    callbacks.value.push(fn);
    return {
      destroy: () => {
        const index = callbacks.value.indexOf(fn);
        if (index === -1) {
          return;
        }

        callbacks.value.splice(index, 1);
      },
    };
  };

  const tick = () => {
    callbacks.value.forEach(fn => fn());

    if (running.value) {
      timeout.value = setTimeout(tick, interval.value);
    }
  };

  const start = () => {
    if (running.value) {
      return;
    }

    running.value = true;
    // @ts-ignore
    timeout.value = setTimeout(tick, interval.value);
  };

  const stop = () => {
    running.value = false;
  }

  const abort = () => {
    stop();
    clearTimeout(timeout.value);
  }

  start();

  return {
    register,
    start,
    stop,
    abort,
    running,
  };
});
