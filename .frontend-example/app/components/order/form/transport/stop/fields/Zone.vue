<template lang="pug">
FormReadOnlyField(
    :value="zoneLabel"
    name="zone"
    layout="compact"
    :label="$t('stops.fields.Zone')"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    stopIndex: number,
}>();

const { getStop } = useOrderFormStopAccessor(() => props.stopIndex);

const zoneLabel = computed(() => {
    const stop = getStop();
    if (!stop || !stop.zone) {
        return null;
    }
    return stop.zone.name;
});

</script>
<style scoped lang="scss"></style>
