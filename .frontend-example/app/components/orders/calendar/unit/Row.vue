<template lang="pug">
.unit(:data-id="idAttributeValue")
    OrdersCalendarUnitSidebar(:unit-id="id")
    OrdersCalendarUnitCalendar(:unit-id="id")
</template>
<script setup lang="ts">
const props = defineProps<{
    id: string,
}>();

const idAttributeValue = computed(() => {
    // a "unit-" prefix is added to the value
    // this is to avoid CSS.escape overescaping the first character of the id if it is a number
    // when later locating this node with document.querySelector
    return `unit-${props.id}`;
});

</script>
<style scoped lang="scss">
.unit {
    display: flex;
    flex-direction: row;
    border-top: 2px solid $color-border-normal;
    margin-bottom: steps(0.5);

    .sidebar {
        flex: 0;
    }

    .calendar {
        flex: 1;
    }
}
</style>
