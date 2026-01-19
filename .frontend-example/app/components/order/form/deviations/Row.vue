<template lang="pug">
fieldset(data-name="deviation-row" :data-id="deviationRow.id" :data-index="index")
    .fields
        OrderFormDeviationsFieldsStatus(ref="firstField" :deviation-row-index="index")
        OrderFormDeviationsFieldsDateAndTime(:deviation-row-index="index")
        OrderFormDeviationsFieldsType(:deviation-row-index="index")
        OrderFormDeviationsFieldsCause(:deviation-row-index="index")
        OrderFormDeviationsFieldsDescription(:deviation-row-index="index")
        OrderFormDeviationsFieldsTransportOrder(:deviation-row-index="index")
        OrderFormDeviationsFieldsImages(:deviation-row-index="index")
        OrderFormDeviationsFieldsSource(:deviation-row-index="index")
        OrderFormDeviationsFieldsUser(:deviation-row-index="index")
        OrderFormDeviationsRemoveButton(:deviation-row-index="index")
    FormErrors(:errors="rowErrors")
</template>
<script setup lang="ts">
import type { DeviationRow, DeviationRowApiResourceFieldName } from "~/models/DeviationRow";

const props = defineProps<{
    index: number,
    deviationRow: DeviationRow,
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

const usedFieldNames: DeviationRowApiResourceFieldName[] = [
    "status",
    "deviationType",
    "deviationCause",
    "transportOrder",
    "description",
];

const rowErrors = computed(() => form.value.errors.forRecord(props.deviationRow).exceptForFields(usedFieldNames));

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
        flex: 0 1 steps(20);
        width: steps(20);

        &[data-name="status"] {
            flex-basis: steps(11);
        }

        &[data-name="date-and-time"] {
            flex-basis: steps(15);
        }

        &[data-name="type"],
        &[data-name="cause"] {
            flex-basis: steps(26);
        }

        &[data-name="description"] {
            flex-basis: steps(65);
        }

        &[data-name="transport-order"] {
            flex-basis: steps(16);
        }

        &[data-name="images"] {
            flex-basis: steps(20);
            // this field is not allowed to get narrower as it needs to always fit the icon, number and button
            flex-shrink: 0;
        }

        &[data-name="source"] {
            flex-basis: steps(30);
        }

        &[data-name="user"] {
            flex-basis: steps(20);
        }
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
