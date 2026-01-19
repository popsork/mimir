<template lang="pug">
GenericRouteTab(:name="name" :has-errors="hasErrors")
    template(v-slot:title)
        slot(name="title")
    template(v-if="slots.summary" v-slot:summary)
        slot(name="summary")
</template>
<script setup lang="ts">

const props = defineProps<{
    name: OrderFormTabName,
}>();

const slots = useSlots();

const formStore = useOrderFormStore();

const hasErrors = computed(() => {
    // highlight order form tab if it has internal validation errors.
    // this is important during dry runs, because missing mandatory fields in a closed form tab
    // may prevent the whole order calculation from being processed,
    // and if the user is working in another tab, he might not see why nothing is being recalculated there.

    // this is not ideal and should probably be improved in the future,
    // (this also does not show that a required field is missing in the main header section)
    // but for now at least it indicates that something is wrong inside a closed tab.

    return formStore.tabHasInternalErrors(props.name);
});

</script>
<style scoped lang="scss"></style>
