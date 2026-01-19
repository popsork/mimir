<template lang="pug">
OrderFormRemoveButton(
    :title="$t('schedule_entries.actions.Remove')"
    v-on:click="remove"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    scheduleEntryIndex: number,
}>();

const store = useOrderFormScheduleEntriesStore();

const { recalculateOrder } = useOrderFormStore();

const remove = () => {
    store.removeScheduleEntry(props.scheduleEntryIndex);
    recalculateOrder();
};

</script>
<style scoped lang="scss"></style>
