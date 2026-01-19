export function buildQueryString(queryParams: { [key: string]: string | string[] }) {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(queryParams)) {
        if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
        } else {
            params.append(key, value);
        }
    }

    return (Object.keys(queryParams).length > 0) ? `?${params}` : "";
}
