<template lang="pug">
.field(data-name="accuracy")
    template(v-if="accuracy")
        FormLocationAccuracyIndicator(:accuracy="accuracy" :show-label="true")
</template>
<script setup lang="ts">

const store = useOrderFormLocationDialogStore();

const { form } = storeToRefs(store);

const accuracy = computed(() => {
    return form.value.destination.location.accuracy || null;
});

</script>
<style scoped lang="scss">
.field {
    display: flex;
    align-items: center;

}
</style>
