<template lang="pug">
FloatingDock(v-if="shouldShowDock" :bounding-element="boundingElement")
    template(v-slot:actions)
        GenericButton(
            icon="ticked-circle"
            :waiting-for="WaitingFor.MarkingOrdersAsInvoiceable"
            :disabled="!markingAsInvoiceableIsEnabled"
            v-on:click="markAsInvoiceable"
        ) {{ $t("invoicing.orders.actions.Mark as invoiceable") }}
        GenericButton(
            icon="arrow-outward"
            :disabled="!invoicingButtonIsEnabled"
            v-on:click="showInvoicingDialog"
        )  {{ $t("invoicing.orders.actions.Invoice") }}
    template(v-slot:message)
        p {{ $t("invoicing.orders.messages.N orders selected", { number: selectedRowIds.length }) }}

</template>
<script setup lang="ts">
defineProps<{
    boundingElement?: HTMLElement | null,
}>();

const tableStore = useInvoicingOrdersTableStore();
const { selectedRowIds, selectedRows } = storeToRefs(tableStore);

const shouldShowDock = computed(() => {
    return selectedRowIds.value.length > 0;
});

const actionsStore = useInvoicingOrdersActionsStore();

const { t } = useI18n();
const { showMessage } = useFloatingMessage();
const markingAsInvoiceableIsEnabled = computed(() => {
    if (selectedRowIds.value.length < 1) {
        return false;
    }

    // if the selected rows only contain statuses that are definitely not markable as invoiceable,
    // then we disable the button.
    const nonMarkableStatuses = [
        OrderStatus.Invoiceable,
        OrderStatus.Invoicing,
    ];

    if (selectedRows.value.every((row: InvoicingOrderRow) => nonMarkableStatuses.includes(row.status))) {
        return false;
    }
    return true;
});

const markAsInvoiceable = async () => {
    const record = await actionsStore.markOrdersAsInvoiceable(selectedRowIds.value.map(id => id.toString()));

    const results = record.getResultTotals();
    if (results.success > 0) {
        showMessage({
            type: FloatingMessageType.Success,
            text: t("invoicing.orders.messages.N orders marked as invoiceable", { number: results.success }),
        });
    }
    if (results.failure > 0) {
        showMessage({
            type: FloatingMessageType.Error,
            text: t("invoicing.orders.messages.N orders failed to be marked as invoiceable", { number: results.failure }),
        });
    }
};

const waitStore = useWaitStore();
const invoicingButtonIsEnabled = computed(() => {
    return selectedRowsAreInvoiceable.value && !waitStore.is(WaitingFor.InvoicingProcessCreation);
});

const selectedRowsAreInvoiceable = computed(() => {
    if (selectedRowIds.value.length < 1) {
        return false;
    }

    return selectedRows.value.every((row: InvoicingOrderRow) => {
        if (row.status !== OrderStatus.Invoiceable) {
            return false;
        }

        // if an order is included in an invoicing process, it cannot be invoiced again unless the process is cancelled
        if (row.invoice_process_status && row.invoice_process_status !== InvoicingProcessStatus.Cancelled) {
            return false;
        }

        return true;
    });
});

const invoicingStore = useInvoicingOrdersInvoicingStore();
const { invoicingByOrders } = storeToRefs(invoicingStore);
const showInvoicingDialog = () => {
    invoicingStore.initializeInvoicingByOrders();
};

watch(selectedRowsAreInvoiceable, (newValue) => {
    // close invoicing by orders dialog if some of the selected rows are no longer invoiceable
    if (!newValue && invoicingByOrders.value) {
        invoicingStore.reset();
    }
});



</script>
<style scoped lang="scss"></style>
