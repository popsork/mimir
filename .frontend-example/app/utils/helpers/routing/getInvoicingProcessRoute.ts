type InvoicingProcessRouteParams = { id: string, tab?: InvoicingProcessTabName };

export function getInvoicingProcessRoute(idOrParams: string | InvoicingProcessRouteParams) {
    const { id, tab } = typeof idOrParams === "string" ? { id: idOrParams } as InvoicingProcessRouteParams : idOrParams;
    const routeParams = {
        name: "invoicing-processes-id-tab",
        params: { id } as { id: string, tab?: string },
    };

    if (tab) {
        routeParams.params.tab = tab;
    }

    return routeParams;
}
