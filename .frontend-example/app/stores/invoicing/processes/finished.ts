export const useFinishedInvoicingProcessesStore = (() => {

    return defineInvoicingProcessesStore({
        name: "finished-invoicing-processes",
        active: false
    });

})();
