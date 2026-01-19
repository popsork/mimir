<template lang="pug">
FormSelectField(
    ref="field"
    v-model="documentTypeId"
    name="type"
    :label="$t('documents.fields.Type')"
    :label-visible="documentIndex === 0"
    :options="options"
    :filterable="true"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { DocumentTypeModel } from "~/models/DocumentTypeModel";

const props = defineProps<{
    documentIndex: number,
}>();

const { getDocument } = useOrderFormDocumentAccessor(() => props.documentIndex);

const { recalculateOrder } = useOrderFormStore();

const documentTypeId = computed({
    get: () => getDocument()?.documentTypeId,
    set: (id: string | null) => {
        const document = getDocument();

        if (!document) {
            return;
        }

        const documentType = (id) ? useRepo(DocumentTypeModel).find(id) : null;

        document.documentTypeId = id;
        document.documentType = documentType;

        document.attachToInvoice = (documentType) ? documentType.attachToInvoice : false;
        document.attachToInvoiceIsManual = false;
    }
});


const typesStore = useOrderFormDocumentTypesStore();

const { documentTypes } = storeToRefs(typesStore);

const options = computed(() => {
    const document = getDocument();
    if (!document) {
        return [];
    }

    return buildSelectOptions({
        collection: documentTypes.value,
        currentObject: document.documentType,
        builder: (documentType) => {
            return {
                value: documentType.id,
                label: documentType.name
            };
        }
    });
});

typesStore.loadDocumentTypesIfNeeded();

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getDocument,
    fields: ["documentType"],
});

const field = useTemplateRef("field");

const focus = () => {
    if (field.value) {
        field.value.focus();
    }
};

defineExpose({
    focus
});

</script>
<style scoped lang="scss"></style>
