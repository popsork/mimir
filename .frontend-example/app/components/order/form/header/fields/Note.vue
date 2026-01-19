<template lang="pug">
.note(:data-type="type")
    template(v-if="editable")
        template(v-if="note")
            FormInputField(
                ref="field"
                v-model="note.notes"
                name="note"
                :label="label"
                type="textarea"
                layout="loose"
                size="medium"
                :autosize="true"
            )
        template(v-else)
            FormCustomField(name="add" :label="label" size="medium")
                GenericButton(type="secondary" size="small" v-on:click="addNote") {{ $t('order.notes.actions.Add note') }}
    template(v-else)
        FormReadOnlyField(
            :label="label"
            :value="note?.notes"
            layout="loose"
            size="medium"
            :multiline="true"
        )
</template>
<script setup lang="ts">
const props = defineProps<{
    type: OrderNoteType,
    editable: boolean,
}>();

const store = useOrderFormNotesStore();

const note = computed(() => {
    return store.getNoteByType(props.type);
});

const { t } = useI18n();

const label = computed(() => {
    return t("order.notes.types." + props.type);
});

const field = useTemplateRef("field");

const addNote = async () => {
    store.addNote(props.type);
    await nextTick();
    field.value?.focus();
};

</script>
<style scoped lang="scss">
.note {
    .field[data-name="add"] {
        button {
            margin: steps(0.5) 0;
        }
    }
}
</style>
