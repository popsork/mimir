<template lang="pug">
OrdersSidebarOverviewSection(
    v-if="stopInfo && stopInfo.name"
    :title="$t('orders.sidebar.stops.Stop', { number: number })"
    :items="items"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    stopInfo: OrdersDetailsSidebarOverviewStopInfo | null,
    number: number,
}>();

const { t } = useI18n();

const items = computed(() => {
    if (!props.stopInfo) {
        return [];
    }
    return [
        {
            name: "name",
            label: t("orders.sidebar.stops.Name"),
            labelVisible: false,
            value: props.stopInfo.name,
            multiline: true,
        },
        {
            name: "street-name",
            label: t("orders.sidebar.stops.Street name"),
            labelVisible: false,
            value: props.stopInfo.streetName
        },
        {
            name: "postal-code-and-city",
            labelVisible: false,
            label: t("orders.sidebar.stops.Postal code and city"),
            value: props.stopInfo.postalCodeAndCity
        },
        {
            name: "notes",
            label: t("orders.sidebar.stops.Stop notes", { number: props.number }),
            value: props.stopInfo.notes,
            multiline: true,
        }
    ];
});

</script>
<style scoped lang="scss">
.section {
    :deep(.item) {
        &[data-name="name"],
        &[data-name="notes"] {
            grid-column: span 2;
        }

        &[data-name="notes"] {
            display: block;

            dt,
            dd {
                display: inline;
            }
            dt {
                margin-right: steps(1);
            }
        }
    }
}
</style>
