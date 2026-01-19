<template lang="pug">
.sidebar
    RoutesSidebarHeader(:title="$t('routes.list.sidebar.headings.Details')")
    .body
        RoutesSidebarDetailsStops
    RoutesSidebarDetailsActions
</template>
<script setup lang="ts">
</script>
<style scoped lang="scss">
.sidebar {
    height: 100%;
    background-color: $color-background-lighter;
    display: flex;
    flex-direction: column;

    .body {
        @include content-padding;
        overflow-y: scroll;
        flex: 1 1 auto;

        form {
            display: flex;
            flex-direction: column;
            gap: steps(1);

            fieldset[data-name="start-date"],
            fieldset[data-name="end-date"] {
                display: flex;
                gap: steps(1);
            }
        }
    }
}
</style>
