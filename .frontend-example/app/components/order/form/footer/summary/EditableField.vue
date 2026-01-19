<template lang="pug">
p.combined-field(:data-name="name" :class="{ 'changed': changed }")
    span.label {{ label }}
    template(v-if="editing")
        FormInputField(
            ref="field"
            v-model="value"
            type="decimal"
            :decimal-places="decimalPlaces"
            :name="name"
            :changed="changed"
            v-on:change="recalculateOrder"
            v-on:keydown.escape="clearAndStopEditing"
            v-on:keydown.enter="stopEditing"
        )
            template(v-slot:suffix)
                button(data-name="close" type="button" :title="$t('general.Apply')" v-on:click="stopEditing")
                    SvgImage(name="circled-tick")
    template(v-else)
        span.value {{ valueText }}
        button(data-name="edit" type="button" v-on:click="startEditing")
            SvgImage(class="icon" name="pencil" :alt="$t('order.summaries.goods.actions.Edit')")
</template>
<script setup lang="ts">
defineProps<{
    name: string,
    label: string,
    valueText: string,
    decimalPlaces: number,
    changed: boolean,
}>();

const editing = ref(false);

const value = defineModel<number | null>();

const field = useTemplateRef("field");

const startEditing = async () => {
    editing.value = true;
    await nextTick();
    field.value?.focus();
};

const stopEditing = () => {
    editing.value = false;
};

const clearAndStopEditing = () => {
    value.value = null;
    stopEditing();
};

const { recalculateOrder } = useOrderFormStore();

</script>
<style scoped lang="scss">
.combined-field {
    display: inline-flex;
    gap: steps(1);
    align-items: center;

    .label::after {
        content: ":";
    }

    button[data-name="edit"] {
        @include clickable-button;
        color: $color-text-lightest;
    }

    .field {
        flex: 0 1 steps(11);
        width: steps(11);
    }

    button[data-name="close"] {
        @include clickable-button;
    }

    &.changed .value {
        color: $color-text-changed;
    }

}
</style>
