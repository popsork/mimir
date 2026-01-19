type OrderRouteParams = { id: string, tab?: OrderFormTabName };

export function getOrderRoute(idOrParams: string | OrderRouteParams) {
    const { id, tab } = typeof idOrParams === "string" ? { id: idOrParams } as OrderRouteParams : idOrParams;
    const routeParams = {
        name: "orders-id-tab",
        params: { id } as { id: string, tab?: string },
    };

    if (tab) {
        routeParams.params.tab = tab;
    }

    return routeParams;
}
