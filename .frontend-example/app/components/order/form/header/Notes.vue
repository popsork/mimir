<template lang="pug">
OrderFormHeaderFieldset(:title="$t('order.fieldsets.Notes')" name="notes")
    .groups
        OrderFormHeaderNotesFromCustomer
        OrderFormHeaderNotesInternal
</template>
<script setup lang="ts">

</script>
<style scoped lang="scss">
fieldset[data-name="notes"] {
    contain: size; // prevent item from stretching the fieldsets flex row height
    overflow: hidden;

    display: grid;
    grid-template-rows: auto minmax(0, 1fr); // first row for the title, second row fills remaining space with .groups

    .groups {
        display: flex;
        gap: steps(1);

        > .group {
            flex: 1 1 0;
            min-height: 0; // enables inner scrolling in flex children
            overflow-y: auto;
        }
    }

}
</style>
