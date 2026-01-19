<template lang="pug">
GenericForm.order.page(:prevent-submission-on-enter="true" v-on:submit.prevent="saveOrder")
    WaitingBox(:while="WaitingFor.OrderFormOrderLoading")
        .content
            OrderFormHeader
            OrderFormTabSelector
            OrderFormActiveTabContent(v-if="tabName" :tab="tabName")
        OrderFormFooter
</template>
<script setup lang="ts">
definePageMeta({
    activeTopLevelRouteName: "orders"
});

const route = useRoute();

const defaultTabName = Object.values(OrderFormTabName)[0];

const validTabNames = Object.values(OrderFormTabName);

const tabName = computed(() => {
    if (typeof route.params.tab !== "string" || !validTabNames.includes(route.params.tab as OrderFormTabName)) {
        return null;
    }
    return route.params.tab as OrderFormTabName;
});
const store = useOrderFormStore();

watch(tabName, (tabName) => {
    if (!tabName) {
        goToRoute({
            name: route.name,
            params: {
                ...route.params,
                tab: defaultTabName,
            }
        }, { replace: true });
    }
}, { immediate: true });

const { order, orderIsNew, orderIsMissing, orderIsLoaded, orderIsTemplate } = storeToRefs(store);

const routeOrderId = computed(() => {
    if (typeof route.params.id !== "string") {
        return null;
    }
    if (route.params.id === "new") {
        return null;
    }
    return route.params.id;
});

watch(routeOrderId, (orderIdFromRoute) => {
    // note that this watcher gets triggered also when switching tabs in the form
    store.loadOrderIfNeeded(orderIdFromRoute);

}, { immediate: true });


const orderIdAndLoadedState = computed(() => {
    return {
        id: order.value.id,
        isLoaded: orderIsLoaded.value,
    };
});

watch(orderIdAndLoadedState, (state) => {
    // prevent accessing the schedule tab if the order cannot have schedule entries
    if (state.isLoaded && tabName.value === OrderFormTabName.Schedule && !order.value.canHaveScheduleEntries()) {
        goToRoute({
            name: route.name,
            params: {
                ...route.params,
                tab: defaultTabName,
            }
        }, { replace: true });
    }
}, { immediate: true });

onBeforeRouteLeave((to, from, next) => {
    // this watcher does not run when simply switching tabs, as the route remains the same

    closeMessages();

    // clear order from store when leaving order form to prevent stale data if returning to the same order later.
    store.reset();

    next();
});

watch(orderIsMissing, (orderIsMissing) => {
    if (orderIsMissing) {
        show404();
    }
});

const { showMessage, closeMessages } = useFloatingMessage();

const saveOrder = async () => {
    // NOTE: when modifying this function, also consider changes needed in OrderFormSaveAsTemplateDialog.vue

    const shouldRedirectAfterSave = orderIsNew.value;

    const savingOk = await store.saveOrder();

    if (savingOk) {
        showMessage({
            type: FloatingMessageType.Success,
            text: orderIsTemplate.value ? t("order.messages.Template saved") : t("order.messages.Order saved"),
        });
    } else {
        showMessage({
            type: FloatingMessageType.Error,
            text: orderIsTemplate.value
                ? t("order.messages.Template saving failed due to validation errors")
                : t("order.messages.Order saving failed due to validation errors")
        });
    }

    if (!savingOk || !shouldRedirectAfterSave) {
        return;
    }

    goToOrderRoute({ id: order.value.id, tab: tabName.value || defaultTabName }, { replace: true });
};

const { form } = storeToRefs(store);
const specialErrors = computed(() => form.value.specialErrors);
watch(specialErrors, (errors) => {
    if (errors.length < 1) {
        return;
    }
    errors.forEach((error) => {
        showMessage({
            type: FloatingMessageType.Error,
            text: error.message,
            autoClose: false
        });
    });

    // after the messages are shown, the errors should be cleared, as they are no longer relevant afterwards
    store.clearSpecialErrors();
});

const { t } = useI18n();

const titleParts = computed(() => {
    if (orderIsNew.value) {
        return t("pages.titles.New order");
    }

    return t("pages.titles.Order", { number: order.value.number });
});

usePageTitle({ parts: titleParts });

const actionsStore = useOrderActionStore();
actionsStore.loadActionsIfNeeded();
</script>
<style scoped lang="scss">
.order.page {
    display: flex;
    flex-direction: column;

    .content {
        flex: 1 1 auto;

        width: 100%;
        max-width: $max-order-form-width;
        margin-left: auto;
        margin-right: auto;

        display: flex;
        flex-direction: column;

        .header {
            flex: 0 0 auto;
        }

        .tab-selector {
            flex: 0 0 auto;
        }

        .active-tab-content {
            flex: 1 1 auto;
            overflow-y: auto;
            scrollbar-gutter: stable;
        }
    }

    .footer {
        margin-top: auto;
        flex: 0 0 auto;
    }
}
</style>





