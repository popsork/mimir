<template lang="pug">
OrdersCalendarItemContent(
    data-type="blocked-time-period"
    :data-item-id="itemId"
    :data-unit-id="unitId"
    :data-period-id="blockedTimePeriodId"
)
    template(v-if="period")
        .label
            span.text {{ text }}
            SvgImage(class="icon" :name="iconName")
</template>
<script setup lang="ts">
const props = defineProps<{
    itemId: string,
    blockedTimePeriodId: string,
}>();

const periodsStore = useOrdersCalendarBlockedTimePeriodsStore();

const period = computed(() => {
    return periodsStore.getRecordById(props.blockedTimePeriodId);
});

const unitId = computed(() => {
    return period.value?.unitId;
});

const text = computed(() => {
    if (!period.value) {
        return "";
    }

    return period.value.reasonName;
});

const iconName = computed(() => {
    return period.value?.isWorkingTime ? "tick" : "cross";
});


</script>
<style scoped lang="scss">
.item-content {
    text-align: center;

    .label {
        padding: 0 steps(0.5);
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;

        &:deep(.icon) {
            display: inline-block;
            vertical-align: top;
            margin-left: steps(0.5);

            &,
            svg {
                height: steps(2);
                width: steps(2);
            }
        }
    }

}
</style>


