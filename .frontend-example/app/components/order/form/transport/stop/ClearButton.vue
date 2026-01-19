<template lang="pug">
GenericButton(
    ref="button"
    name="clear"
    type="alternative-ghost"
    size="small"
    v-on:click="clear"
) {{ $t('stops.actions.Clear') }}
</template>
<script setup lang="ts">

const props = defineProps<{
    stopIndex: number,
}>();

const { form } = storeToRefs(useOrderFormStore());

const button = useTemplateRef("button");

const getStop = () => {
    return (form.value.order.stops || [])[props.stopIndex];
};

const clear = () => {
    if (button.value) {
        button.value.blur();
    }
    const stop = getStop();

    if (!stop) {
        return;
    }

    stop.clear();
};
</script>
<style scoped lang="scss"></style>
