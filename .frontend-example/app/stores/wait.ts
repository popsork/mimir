export type WaiterParams = string | number | { [key: string]: string | number };

export const useWaitStore = defineStore("wait", () => {
    const getDefaultValues = () => {
        return {
            waiters: new Map<string, number>()
        };
    };

    const defaults = getDefaultValues();
    const waiters = ref(defaults.waiters);

    const keyDelimiter = ":";

    const getWaiterKey = (name: WaitingFor, params?: WaiterParams) => {
        const keyParts = [name] as string[];
        if (params !== undefined) {
            keyParts.push(JSON.stringify(params));
        }
        return keyParts.join(keyDelimiter);
    };

    const start = (name: WaitingFor, params?: WaiterParams) => {
        const key = getWaiterKey(name, params);
        const timestamp = Date.now();
        waiters.value.set(key, timestamp);
        return timestamp;
    };

    const end = (name: WaitingFor, params?: WaiterParams) => {
        const key = getWaiterKey(name, params);
        waiters.value.delete(key);
    };

    const endAll = (name: WaitingFor) => {
        // if multiple waiters are started with the same name but different params,
        // this ends all of them based on name only
        const keyPrefix = getWaiterKey(name) + keyDelimiter;
        for (const key of waiters.value.keys()) {
            if (key.startsWith(keyPrefix)) {
                waiters.value.delete(key);
            }
        }
    };

    const getActiveWaiterTimestamp = (name: WaitingFor, params?: WaiterParams) => {
        const key = getWaiterKey(name, params);
        return waiters.value.get(key);
    };

    const isWaitingFor = (name: WaitingFor, params?: WaiterParams) => {
        // it is possible to check for a specific waiter with specific params,
        // or for any waiter with the given name, regardless of what params it was started with.

        const exactMatch = getActiveWaiterTimestamp(name, params) !== undefined;
        if (exactMatch) {
            return true;
        }

        if (params !== undefined) {
            // only look for a specific waiter.
            // if it did not match the exact key, then it is not running
            return false;
        }
        // if no params are provided, check if any waiter with the given name is active
        const keyPrefix = getWaiterKey(name) + keyDelimiter;
        return Array.from(waiters.value.keys()).some(key => key.startsWith(keyPrefix) && waiters.value.get(key) !== undefined);
    };

    const is = isWaitingFor;

    return {
        start,
        end,
        endAll,
        isWaitingFor,
        is,
        getActiveWaiterTimestamp,
    };
});
