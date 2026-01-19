export function clone<T>(object: T): T {
    if (object === undefined) {
        return object;
    }
    return JSON.parse(JSON.stringify(object));
}

