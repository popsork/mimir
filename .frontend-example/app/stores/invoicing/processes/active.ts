export const useActiveInvoicingProcessesStore = (() => {

    return defineInvoicingProcessesStore({
        name: "active-invoicing-processes",
        active: true
    });

})();
