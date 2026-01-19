<template lang="pug">
OrdersCalendarItemContent(
    data-type="new-item"
)
    h4.title {{ $t("orders.calendar.actions.Block time") }}
    p.times {{ timePeriodText }}
</template>
<script setup lang="ts">
const props = defineProps<{
    start: Date,
    end: Date,
}>();


const timePeriodText = computed(() => {
    return getTimePeriodText(props.start, props.end);
});

</script>
<style scoped lang="scss">
.item-content {
    text-align: center;

    .title,
    .times {
        padding: 0 steps(0.5);
    }

}
</style>


