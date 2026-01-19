<template lang="pug">
GenericButton(icon="plus-circled" type="secondary" size="small" v-on:click="addRow") {{ $t('schedule_entries.actions.Add row') }}
</template>
<script setup lang="ts">

const store = useOrderFormScheduleEntriesStore();

const emit = defineEmits<{
    (e: "add"): void,
}>();

const { recalculateOrder } = useOrderFormStore();

const addRow = () => {
    store.addScheduleEntry();
    recalculateOrder();
    emit("add");
};


</script>
<style scoped lang="scss"></style>
