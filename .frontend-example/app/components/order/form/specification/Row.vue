<template lang="pug">
fieldset(data-name="specification-row" :data-id="specificationRow.id" :data-index="index")
    .fields
        OrderFormSpecificationFieldsStartedAt(ref="firstField" :specification-row-index="index")
        OrderFormSpecificationFieldsEndedAt(:specification-row-index="index")
        OrderFormSpecificationFieldsStartPoint(:specification-row-index="index")
        OrderFormSpecificationFieldsEndPoint(:specification-row-index="index")
        OrderFormSpecificationFieldsActivity(:specification-row-index="index")
        OrderFormSpecificationFieldsNotes(:specification-row-index="index")
        OrderFormSpecificationFieldsReceiptNumber(:specification-row-index="index")
        OrderFormSpecificationFieldsQuantity(:specification-row-index="index")
        OrderFormSpecificationFieldsQuantityType(:specification-row-index="index")
        OrderFormSpecificationFieldsHours(:specification-row-index="index")
        OrderFormSpecificationFieldsImages(:specification-row-index="index")
        OrderFormSpecificationRemoveButton(:specification-row-index="index")
    FormErrors(:errors="rowErrors")
</template>
<script setup lang="ts">
import type { SpecificationRow, SpecificationRowApiResourceFieldName } from "~/models/SpecificationRow";

const props = defineProps<{
    index: number,
    specificationRow: SpecificationRow,
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

const usedFieldNames: SpecificationRowApiResourceFieldName[] = [
    "started_at",
    "ended_at",
    "start_point_name",
    "start_point_street_name",
    "start_point_street_number",
    "start_point_postal_code",
    "start_point_city",
    "start_point_country",
    "start_point_latitude",
    "start_point_longitude",
    "start_point_accuracy",
    "end_point_name",
    "end_point_street_name",
    "end_point_street_number",
    "end_point_postal_code",
    "end_point_city",
    "end_point_country",
    "end_point_latitude",
    "end_point_longitude",
    "end_point_accuracy",
    "activity",
    "activity_name_override",
    "notes",
    "receipt_number",
    "quantity",
    "quantity_precision",
    "specificationRowQuantityType",
    "hours",
    "hours_precision",
];

const rowErrors = computed(() => form.value.errors.forRecord(props.specificationRow).exceptForFields(usedFieldNames));

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
        align-items: flex-start;

        padding: $row-padding 0;
    }

    .field {
        flex: 0 1 steps(10);
        width: steps(10);

        &[data-name="started-at"],
        &[data-name="ended-at"] {
            flex-basis: steps(18);
        }

        &[data-name="activity"] {
            flex-basis: steps(40);
        }

        &[data-name="notes"] {
            flex-basis: steps(44);
        }

        &[data-name="receipt-number"] {
            flex-basis: steps(12);
        }

        &[data-name="hours"] {
            flex-basis: steps(7);
        }

        &[data-name="images"] {
            flex-basis: steps(20);
            // this field is not allowed to get narrower as it needs to always fit the icon, number and button
            flex-shrink: 0;
        }
    }

    &:deep(.field[data-name="start-point"]),
    &:deep(.field[data-name="end-point"]) {
        flex-basis: steps(28);
    }

    .button[data-name="remove"] {
        // prevent button from stretching the fieldset height
        margin: #{$row-padding * -1} 0 #{$row-padding * -1} auto;
    }

    &[data-index="0"] {
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
