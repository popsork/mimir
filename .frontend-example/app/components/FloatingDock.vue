<template lang="pug">
.floating-dock(ref="dock" :style="{ left: `${x}px`, top: `${y}px` }")
    .content
        template(v-if="slots.actions")
            .actions
                slot(name="actions")
        template(v-if="slots.message")
            .message
                slot(name="message")
    .handle(v-on:mousedown.stop.prevent="onDragStart")
        GenericButton(
            ref="moveHandler"
            name="moveHandler"
            type="ghost"
            icon="double-vertical-dots"
            :title="$t('general.Move')"
            size="small"
        )
</template>
<script setup lang="ts">
const props = defineProps<{
    boundingElement?: HTMLElement | null,
}>();

const slots = useSlots();

const dock = useTemplateRef("dock");
const moveHandler = useTemplateRef("moveHandler");

const defaultDockWidth = 330;
const x = ref(window.innerWidth / 2 - (defaultDockWidth / 2));
const y = ref(window.innerHeight - 100);
const offsetX = ref(0);
const offsetY = ref(0);

const isDragging = ref(false);

const getBoundingRect = (): DOMRect => {
    if (props.boundingElement) {
        return props.boundingElement.getBoundingClientRect();
    }
    return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
};

const onDragStart = (event: MouseEvent) => {

    if (!moveHandler.value || !moveHandler.value.$el.contains(event.target as Node))
        return;

    isDragging.value = true;

    offsetX.value = event.clientX - x.value;
    offsetY.value = event.clientY - y.value;

    window.addEventListener("mousemove", onDragging);
    window.addEventListener("mouseup", onDragEnd);
};

const onDragging = (event: MouseEvent) => {
    if (!isDragging.value || !dock.value) {
        return;
    }

    const boxWidth = dock.value.offsetWidth;
    const boxHeight = dock.value.offsetHeight;

    const rect = getBoundingRect();
    const maxX = rect.width - boxWidth;
    const maxY = rect.bottom - boxHeight;

    const newX = event.clientX - offsetX.value;
    const newY = event.clientY - offsetY.value;

    x.value = Math.max(-50, Math.min(newX, maxX + 50));
    y.value = Math.max(rect.top, Math.min(newY, maxY + 50));
};

const onDragEnd = async () => {
    if (!dock.value) {
        return;
    }

    isDragging.value = false;

    adjustPosition();
};

const adjustPosition = () => {
    if (!dock.value) {
        return;
    }

    const boxWidth = dock.value.offsetWidth;
    const boxHeight = dock.value.offsetHeight;

    const maxX = window.innerWidth - boxWidth;
    const maxY = window.innerHeight - boxHeight;

    x.value = Math.max(0, Math.min(x.value, maxX));
    y.value = Math.max(0, Math.min(y.value, maxY));
};

const { height: windowHeight } = useWindowSize({ includeScrollbar: true, type: "inner" });

watch(windowHeight, () => {
    // ensure position is recalculated if window is resized
    // to avoid dock being left outside the viewport
    adjustPosition();
});

onBeforeUnmount(() => {
    window.removeEventListener("mousemove", onDragging);
    window.removeEventListener("mouseup", onDragEnd);
});

</script>
<style scoped lang="scss">
.floating-dock {
    @include dialog-shadow;
    display: flex;
    padding: steps(1.5) 0 steps(1.5) steps(1.5);
    border-radius: $element-border-radius;
    background-color: $color-background-darker;
    position: absolute;
    align-items: center;
    z-index: 11;

    .handle {
        display: flex;
        padding: steps(1);
        margin-left: steps(3);

        .button {
            background-color: $color-background-darker;
        }

        [data-name="moveHandler"] {
            cursor: move;
        }
    }

    .actions {
        display: flex;
        justify-content: space-around;
        gap: steps(1);
    }

    .message {
        @include normal-text;
        margin-top: steps(1);
    }
}
</style>
