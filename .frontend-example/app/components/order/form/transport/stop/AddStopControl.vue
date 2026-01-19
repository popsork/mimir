<template lang="pug">
.add-stop(:class="{ 'active': controlActive }" :data-position="position")
    GenericButton(
        :id="buttonId"
        ref="button"
        name="add"
        size="small"
        :title="$t('stops.actions.Add stop')"
        icon="plus"
        v-on:click="addStop"
        v-on:mouseenter="showControl"
        v-on:mouseleave="hideControl"
    )
    label(
        :for="buttonId"
        :title="$t('stops.actions.Add stop')"
        v-on:mouseenter="showControl"
        v-on:mouseleave="hideControl"
    )
</template>
<script setup lang="ts">
const props = defineProps<{
    index: number,
    position: "before" | "after",
}>();

const buttonId = computed(() => generateNewUuid());

const controlActive = ref(false);

const showControl = () => {
    controlActive.value = true;
};

const hideControl = () => {
    controlActive.value = false;
};

const button = useTemplateRef("button");

const store = useOrderFormStopsStore();

const { recalculateOrder } = useOrderFormStore();

const addStop = () => {
    if (button.value) {
        button.value.blur();
    }
    const newStopPosition = (props.position === "before")
        ? { beforeStopIndex: props.index, beforePreviousTransportOrder: false }
        : { beforeStopIndex: props.index + 1, beforePreviousTransportOrder: true };

    store.addStop(newStopPosition);
    recalculateOrder();
    hideControl();
};

</script>
<style scoped lang="scss">
.add-stop {
    &:not(.active) {
        opacity: 0;
    }

    .button {
        position: absolute;
        top: steps(-1.5);
        z-index: 1;
    }

    label {
        display: block;
        @include clickable-button;

        $decoration-height: 6px;
        position: absolute;
        z-index: 0;
        left: 0;
        top: 0;
        width: 100%;
        background: $color-background-accent-darker;
        border: 1px solid $color-border-accent;
        height: $decoration-height;
        transform: translateY(-50%);
        border-radius: $decoration-height;
    }
}
</style>
