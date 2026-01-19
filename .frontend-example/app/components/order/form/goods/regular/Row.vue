<template lang="pug">
fieldset(data-name="goods-row" :data-id="goodsRow.id" :data-index="index" :class="{ highlighted: rowIsHighlighted }")
    .fields
        OrderFormGoodsRegularFieldsSpecification(ref="firstField" :goods-row-index="index")
        OrderFormGoodsRegularFieldsQuantity(:goods-row-index="index")
        OrderFormGoodsRegularFieldsQuantityType(:goods-row-index="index")
        OrderFormGoodsRegularFieldsWeight(:goods-row-index="index")
        OrderFormGoodsRegularFieldsVolume(:goods-row-index="index")
        OrderFormGoodsRegularFieldsLoadingMetres(:goods-row-index="index")
        OrderFormGoodsRegularFieldsPalletPlaces(:goods-row-index="index")
        OrderFormGoodsRegularFieldsCalculatedWeight(:goods-row-index="index")
        OrderFormGoodsRegularFieldsDimensions(:goods-row-index="index")
        OrderFormGoodsRegularFieldsPackages(:goods-row-index="index")
        OrderFormGoodsRegularFieldsContainsDangerousItems(:goods-row-index="index")
        OrderFormGoodsRegularRemoveButton(:goods-row-index="index")
    FormErrors(:errors="rowErrors")
    OrderFormGoodsDangerousPanel(:goods-row-index="index")
</template>
<script setup lang="ts">
import type { GoodsRow, GoodsRowApiResourceFieldName } from "~/models/GoodsRow";

const props = defineProps<{
    index: number,
    goodsRow: GoodsRow,
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

const usedFieldNames: GoodsRowApiResourceFieldName[] = [
    "specification", "quantity", "quantity_precision", "goodsRowQuantityType",
    "weight", "weight_precision", "volume", "volume_precision",
    "loading_metres", "loading_metres_precision", "pallet_places", "pallet_places_precision",
    "length", "length_precision", "width", "width_precision", "height", "height_precision",
];

const rowErrors = computed(() => form.value.errors.forRecord(props.goodsRow).exceptForFields(usedFieldNames));

const { hoveredGoodsRowIndex } = storeToRefs(useOrderFormGoodsStore());

const rowIsHighlighted = computed(() => hoveredGoodsRowIndex.value === props.index);


</script>
<style scoped lang="scss">
fieldset {
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

        &[data-name="specification"] {
            flex-basis: steps(51);
        }

        &[data-name="quantity-type"],
        &[data-name="calculated-weight"],
        &[data-name="dimensions"] {
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

    .panel[data-name="dangerous-goods"] {
        margin-bottom: steps(2);
    }
}
</style>
