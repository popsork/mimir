<template lang="pug">
fieldset(v-bind="rowAttributes")
    .fields
        OrderFormDebitRowsFieldsArticleGroup(ref="firstField" v-bind="commonFieldProps")
        OrderFormDebitRowsFieldsArticle(v-bind="commonFieldProps")
        OrderFormDebitRowsFieldsSpecification(v-bind="commonFieldProps")
        OrderFormDebitRowsFieldsQuantity(v-bind="commonFieldProps")
        OrderFormDebitRowsFieldsQuantityUnit(v-bind="commonFieldProps")
        OrderFormDebitRowsFieldsPrice(v-bind="commonFieldProps")
        OrderFormDebitRowsFieldsPriceSource(v-bind="commonFieldProps")
        OrderFormDebitRowsFieldsDiscount(v-bind="commonFieldProps")
        OrderFormDebitRowsFieldsTotalPrice(v-bind="commonFieldProps")
        template(v-if="target === DebitRowTarget.Transport")
            OrderFormDebitRowsFieldsCommission(v-bind="commonFieldProps")
            OrderFormDebitRowsFieldsPayeeOverride(v-bind="commonFieldProps")
        template(v-else)
            //- to make the fields align vertically between customer and transport rows,
            //- we need to add empty field placeholders when there are no real fields
            //- in order for flexbox to calculate the same widths in both customer and transport rows
            .field.placeholder(data-name="commission")
            .field.placeholder(data-name="unit-override")
        OrderFormDebitRowsRemoveButton(v-if="rowIsRemovable" :transport-order-id="transportOrderId" :debit-row-index="index")
    FormErrors(:errors="rowErrors")
</template>
<script setup lang="ts">
import type { DebitRow, DebitRowApiResourceFieldName } from "~/models/DebitRow";

const props = defineProps<{
    index: number,
    debitRow: DebitRow,
}>();

const transportOrderId = computed(() => props.debitRow.transportOrderId);

const target = computed<DebitRowTarget>(() => {
    return (transportOrderId.value === null) ? DebitRowTarget.Customer : DebitRowTarget.Transport;
});

const commonFieldProps = computed(() => {
    return {
        transportOrderId: transportOrderId.value,
        debitRowIndex: props.index,
        debitRowType: props.debitRow.debitRowType
    };
});

const rowIsRemovable = computed(() => {
    return props.debitRow.debitRowType !== DebitRowType.Addon;
});

const store = useOrderFormDebitRowsStore();

const rowIsHighlighted = computed(() => {
    const highlightedRowIndexes = store.getHighlightedDebitRowIndexes(transportOrderId.value);
    return highlightedRowIndexes.includes(props.index);
});


const rowAttributes = computed(() => {
    return {
        "data-name": "debit-row",
        "data-type": props.debitRow.debitRowType,
        "data-target": target.value,
        "data-index": props.index,
        "data-order-by": props.debitRow.sequenceNumber,
        "data-id": props.debitRow.id,
        "data-origin-type": props.debitRow.originType ?? "null",
        "data-origin-id": props.debitRow.originId ?? "null",
        "data-parent-id": props.debitRow.parentId ?? "null",
        class: {
            highlighted: rowIsHighlighted.value,
        }
    };
});


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

const usedFieldNames: DebitRowApiResourceFieldName[] = [
    "suggestedArticleGroup", "article",
    "specification", "quantity", "quantity_precision", "quantityUnit",
    "price", "price_precision", "discount", "total_price", "total_price_precision", "commission",
    "payee"
];

const rowErrors = computed(() => form.value.errors.forRecord(props.debitRow).exceptForFields(usedFieldNames));

</script>
<style scoped lang="scss">
fieldset {
    position: relative;

    $field-gap: steps(1);
    $row-padding: 6px;

    .fields {
        display: flex;
        gap: $field-gap;
        align-items: flex-start;
    }


    $removal-button-width: steps(4.5);

    &[data-type="addon"] {
        background: $color-background-light;
        padding-right: $removal-button-width + $field-gap;
    }

    &.highlighted {
        // to highlight a row, put a colored layer under the fields
        // and make the layer a bit vertically larger than the row

        &::before {
            content: "";
            display: block;
            position: absolute;
            top: steps(-0.5);
            right: 0;
            bottom: steps(-0.5);
            left: 0;
            background: $color-background-light;
        }

        // don't highlight the background underneath the labels in the first row
        &[data-index="0"] {
            &::before {
                top: steps(2);
            }
        }
    }

    &[data-index="0"] {
        :deep(> .fields > .field) > .label {
            margin-bottom: steps(0.5);
        }
    }

    .field {
        flex: 0 1 steps(16);
        width: steps(16);

        &[data-name="price-item"] {
            flex-shrink: 0;
        }

        &[data-name="article-group"],
        &[data-name="article"],
        &[data-name="specification"],
        &[data-name="unit-override"] {
            flex: 0 1 steps(35);
            width: steps(35);
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
        padding-top: steps(1);
        padding-bottom: steps(1);
    }
}
</style>
