<template lang="pug">
fieldset(
    data-name="dangerous-goods-row"
    :data-id="dangerousGoodsRow.id"
    :data-index="dangerousGoodsRowIndex"
    :class="{ highlighted: rowIsHighlighted }"
)
    .fields
        OrderFormGoodsDangerousFieldsSubstanceType(:dangerous-goods-row-id="dangerousGoodsRow.id" :row-index="dangerousGoodsRowIndex")
        OrderFormGoodsDangerousFieldsWasteCode(:dangerous-goods-row-id="dangerousGoodsRow.id" :row-index="dangerousGoodsRowIndex")
        OrderFormGoodsDangerousFieldsUnitedNationsNumber(:dangerous-goods-row-id="dangerousGoodsRow.id" :row-index="dangerousGoodsRowIndex")
        OrderFormGoodsDangerousFieldsAdrClass(:dangerous-goods-row-id="dangerousGoodsRow.id" :row-index="dangerousGoodsRowIndex")
        OrderFormGoodsDangerousFieldsSpecification(:dangerous-goods-row-id="dangerousGoodsRow.id" :row-index="dangerousGoodsRowIndex")
        OrderFormGoodsDangerousFieldsSubstanceAmount(:dangerous-goods-row-id="dangerousGoodsRow.id" :row-index="dangerousGoodsRowIndex")
        OrderFormGoodsDangerousFieldsSubstanceUnit(:dangerous-goods-row-id="dangerousGoodsRow.id" :row-index="dangerousGoodsRowIndex")
        OrderFormGoodsDangerousFieldsQuantity(:dangerous-goods-row-id="dangerousGoodsRow.id" :row-index="dangerousGoodsRowIndex")
        OrderFormGoodsDangerousFieldsQuantityType(:dangerous-goods-row-id="dangerousGoodsRow.id" :row-index="dangerousGoodsRowIndex")
        OrderFormGoodsDangerousRemoveButton(:dangerous-goods-row-id="dangerousGoodsRow.id")

    FormErrors(:errors="rowErrors")
</template>
<script setup lang="ts">
import type { DangerousGoodsRow, DangerousGoodsRowApiResourceFieldName } from "~/models/DangerousGoodsRow";

const props = defineProps<{
    dangerousGoodsRow: DangerousGoodsRow,
    dangerousGoodsRowIndex: number,
}>();

const { form } = storeToRefs(useOrderFormStore());

const usedFieldNames: DangerousGoodsRowApiResourceFieldName[] = [
    "dangerousGoodsRowSubstanceType", "wasteCode", "unitedNationsNumber",
    "adr_class", "specification", "substance_amount", "substance_amount_precision", "substance_quantity_unit",
    "quantity", "quantity_precision", "dangerousGoodsRowQuantityType"
];

const rowErrors = computed(() => form.value.errors.forRecord(props.dangerousGoodsRow).exceptForFields(usedFieldNames));

const { hoveredDangerousGoodsRowId } = storeToRefs(useOrderFormDangerousGoodsStore());

const rowIsHighlighted = computed(() => hoveredDangerousGoodsRowId.value === props.dangerousGoodsRow.id);


</script>
<style scoped lang="scss">
fieldset[data-name="dangerous-goods-row"] {
    position: relative;

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
        flex: 0 1 steps(9);
        width: steps(9);

        &[data-name="substance-type"] {
            flex-basis: steps(16);
        }

        &[data-name="waste-code"] {
            flex-basis: steps(30);
        }

        &[data-name="united-nations-number"] {
            flex-basis: steps(30);
        }

        &[data-name="specification"] {
            flex-basis: steps(51);
        }

        &[data-name="quantity-type"] {
            flex-basis: steps(16);
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

    &.highlighted {
        // to highlight a row, put a colored layer under the fields

        &::before {
            content: "";
            display: block;
            position: absolute;
            inset: 0;
            background: $color-background-light;
        }

        // don't highlight the background underneath the labels in the first row
        &[data-index="0"] {
            &::before {
                top: steps(2.5);
            }
        }
    }

    .errors {
        padding-bottom: steps(1);
    }
}
</style>
