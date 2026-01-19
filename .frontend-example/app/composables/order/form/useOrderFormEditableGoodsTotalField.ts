import type { GoodsRowSummary } from "~/models/GoodsRowSummary";
import { GoodsTotalOverride } from "~/models/GoodsTotalOverride";

// this composable is for editable fields in goods summary in the order form's footer.
// by default, the fields are read-only and take their values from GoodsRowSummary.
// if the order has a GoodsTotalOverride relationship, that relationship is editable and its values take precedence.
// if the user decides to edit a field, then a GoodsTotalOverride record is automatically created if it doesn't already exist,
// and the value is set there, without touching the GoodsRowSummary, which always remains read-only.

// for this to work, both GoodsRowSummary and GoodsTotalOverride must have the same attributes for value and precision.

export const useOrderFormEditableGoodsTotalField = (
    { valueAttribute, precisionAttribute, decimalPlaces }:
    {
        valueAttribute: keyof GoodsTotalOverride & keyof GoodsRowSummary,
        precisionAttribute: keyof GoodsTotalOverride & keyof GoodsRowSummary,
        decimalPlaces: number,
    }
) => {

    const orderFormStore = useOrderFormStore();

    const { order } = storeToRefs(orderFormStore);

    const override = computed(() => {
        return order.value.goodsTotalOverride;
    });

    const getOverride = () => override.value ?? undefined;

    const { value: overrideValue, decimalPlaces: overrideDecimalPlaces } = useNumberFieldValue({
        recordAccessor: getOverride,
        valueAttribute,
        precisionAttribute,
        decimalPlaces,
    });


    const summary = computed(() => {
        return order.value.goodsRowSummary;
    });

    const getSummary = () => summary.value ?? undefined;

    const { value: summaryValue, decimalPlaces: summaryDecimalPlaces } = useNumberFieldValue({
        recordAccessor: getSummary,
        valueAttribute,
        precisionAttribute,
        decimalPlaces,
    });

    // if no override record exists, use value from summary (read-only),
    // but if override record exists and has value, it takes precedence
    const displayableValue = computed(() => {
        return overrideValue.value ?? summaryValue.value;
    });

    const calculatedDecimalPlaces = computed(() => {
        return overrideValue.value ? overrideDecimalPlaces.value : summaryDecimalPlaces.value;
    });

    const valueText = computed(() => {
        if (displayableValue.value === null) {
            return getBlankValueLabelText();
        }
        return localizeNumber(displayableValue.value)!;
    });

    const valueIsManual = computed(() => {
        return !!override.value && overrideValue.value !== null;
    });

    const editableValue = computed({
        get: () => {
            return displayableValue.value;
        },
        set: (newValue: number | null) => {
            // if no override record exists, but user is setting a value, create the override record
            if (!override.value && newValue !== null) {
                order.value.goodsTotalOverride = GoodsTotalOverride.buildBlank({ customerOrderId: order.value.id! });
                orderFormStore.registerRelationshipAddition(
                    "GoodsTotalOverride",
                    order.value.goodsTotalOverride.id!,
                );
            }

            overrideValue.value = newValue;
        }
    });

    return {
        editableValue,
        decimalPlaces: calculatedDecimalPlaces,
        valueIsManual,
        valueText
    };

};
