<template lang="pug">
NPopover(
    ref="popover"
    class="popover-dialog"
    placement="bottom"
    trigger="click"
    :raw="true"
    :on-update:show="handleUpdateShow"
)
    template(v-slot:trigger)
        slot(name="trigger")

    .header
        h2.title {{ title }}
        GenericButton(
            :title="$t('general.Close')"
            type="alternative-ghost"
            size="small"
            icon="cross"
            v-on:click="close"
        )
    slot

    .actions(v-if="slots.actions")
        slot(name="actions")

</template>
<script setup lang="ts">
import { NPopover } from "naive-ui"; // explicit import needed for typescript during build

defineProps<{
    title: string,
}>();

const slots = useSlots();

const popover = useTemplateRef("popover");

const emit = defineEmits<{
    (e: "open"): void,
}>();

const handleUpdateShow = async (show: boolean) => {
    if (show) {
        await nextTick();
        emit("open");
    }
};

const close = () => {
    if (popover.value) {
        popover.value.setShow(false);
    }
};

useCallbackOnEscape(() => {
    close();
});

defineExpose({
    close
});

</script>
<style scoped lang="scss">
.popover-dialog {
    .header {
        display: flex;
        gap: steps(1);
        align-items: center;
        min-height: steps(3.5);
        margin-bottom: steps(0.5);

        .title {
            flex: 1;
            @include normal-medium-text;
        }

        .button {
            margin-right: steps(-0.5);
        }
    }

    .actions {
        margin-top: steps(1.5);
        display: flex;

        :slotted(.button) {
            flex: 1 1 50%;
        }
    }
}
</style>
<style lang="scss">
// these are global styles
.n-popover.popover-dialog {

    border-radius: $dialog-border-radius;
    min-width: 0;
    width: steps(32.5);
    padding: steps(1.5) steps(2) steps(2);

    @include dialog-shadow;

    &,
    .n-popover-arrow-wrapper .n-popover-arrow {
        background-color: $color-background-light;
        border: none;
    }

}
</style>
