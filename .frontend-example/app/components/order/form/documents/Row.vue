<template lang="pug">
fieldset(data-name="document" :data-id="document.id" :data-index="index")
    .fields
        OrderFormDocumentsFieldsType(ref="firstField" :document-index="index")
        OrderFormDocumentsFieldsName(:document-index="index")
        OrderFormDocumentsFieldsAttachToInvoice(:document-index="index")
        OrderFormDocumentsFieldsFile(:document-index="index")
        OrderFormDocumentsRemoveButton(:document-index="index")
    FormErrors(:errors="rowErrors")
</template>
<script setup lang="ts">
import type { DocumentModel, DocumentApiResourceFieldName } from "~/models/DocumentModel";

const props = defineProps<{
    index: number,
    document: DocumentModel,
}>();


const firstField = useTemplateRef("firstField");

const focus = () => {
    if (firstField.value) {
        firstField.value.focus();
    }
};
defineExpose({
    focus
});


const { form } = storeToRefs(useOrderFormStore());

const usedFieldNames: DocumentApiResourceFieldName[] = [
    "documentType",
    "name",
    "attach_to_invoice", "attach_to_invoice_is_manual"
    // custom file field currently does not support displaying errors,
    // so if validation fails for that relationship, the errors should be shown along with other unrecognized row errors
];

const rowErrors = computed(() => form.value.errors.forRecord(props.document).exceptForFields(usedFieldNames));

</script>
<style scoped lang="scss">
fieldset {
    &[data-index="0"] {
        :deep(> .fields > .field) > .label {
            margin-bottom: steps(0.5);
        }
    }

    &:not([data-index="0"]) {
        border-top: 1px solid $color-border-normal;
    }

    $field-gap: steps(1);
    $row-padding: 6px;

    .fields {
        display: flex;
        gap: $field-gap;
        align-items: center;

        padding: $row-padding 0;
    }

    .field {
        flex: 0 1 steps(20);

        &[data-name="name"] {
            flex-basis: steps(30);
        }

        &[data-name="attach-to-invoice"] {
            flex-basis: content;
        }

        &[data-name="file"] {
            flex-basis: content;
            margin-left: steps(2);
        }
    }

    .button[data-name="remove"] {
        // prevent button from stretching the fieldset height
        margin: #{$row-padding * -1} 0 #{$row-padding * -1} auto;
    }

    &[data-index="0"] {

        .fields {
            .field[data-name="attach-to-invoice"] {
                margin-top: steps(3);
            }
        }
        .button[data-name="remove"] {
            $label-height: steps(2.5);
            margin-top: #{$row-padding * -1 + $label-height};
        }
    }

    .errors {
        padding-bottom: steps(1);
    }
}
</style>
