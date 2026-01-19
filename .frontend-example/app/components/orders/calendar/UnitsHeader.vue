<template lang="pug">
.units-header
    .sidebar
    //- this calendar is only for the day headers and does not show any hour slots or items
    OrdersCalendarUnitCalendar
</template>
<script setup lang="ts">

</script>
<style scoped lang="scss">
.units-header {
    display: flex;
    flex-direction: row;
    background: $color-background-light;

    .sidebar {
        flex: 0;
    }

    .calendar {
        flex: 1;
    }
}
</style>
