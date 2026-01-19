<template lang="pug">
ViewsHeaderViews(:views="displayableViews" route-name="orders-calendar")
</template>
<script setup lang="ts">
const viewsStore = useViewsStore();
viewsStore.loadViewsIfNeeded();

const calendarViewsStore = useOrdersCalendarViewsStore();
const { views } = storeToRefs(calendarViewsStore);

const displayableViews = computed(() => views.value.filter(v => v.type !== ViewType.Temporary));
</script>
<style scoped lang="scss">
</style>
