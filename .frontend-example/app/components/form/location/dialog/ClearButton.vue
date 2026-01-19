<template lang="pug">
GenericButton(type="secondary" size="small" v-on:click="clearValues") {{ $t("locations.actions.Clear location") }}
</template>
<script setup lang="ts">

const store = useOrderFormLocationDialogStore();

const clearValues = () => {
    store.clearForm();
};

</script>
<style scoped lang="scss"></style>
