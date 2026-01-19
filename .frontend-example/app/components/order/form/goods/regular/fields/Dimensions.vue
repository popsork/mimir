<template lang="pug">
FormPopoverField(
    ref="popover"
    name="dimensions"
    :label="$t('goods_rows.fields.Dimensions (L x W x H)')"
    :label-visible="goodsRowIndex === 0"
    :value="displayableValue"
    :changed="valueIsManual"
    :errors="errors"
    v-on:open="focusFirstInput"
    v-on:close="resetInternalDimensions"
)
    template(v-slot:popover)
        GenericForm(data-name="dimensions" v-on:submit.prevent="updateDimensions")
            fieldset
                FormInputField(
                    ref="firstInput"
                    v-model="internalDimensions.length"
                    type="decimal"
                    :decimal-places="lengthDecimalPlaces"
                    size="medium"
                    layout="compact"
                    :label="$t('goods_rows.fields.Length, cm')"
                )
                FormInputField(
                    v-model="internalDimensions.width"
                    size="medium"
                    type="decimal"
                    :decimal-places="widthDecimalPlaces"
                    layout="compact"
                    :label="$t('goods_rows.fields.Width, cm')"
                )
                FormInputField(
                    v-model="internalDimensions.height"
                    size="medium"
                    type="decimal"
                    :decimal-places="heightDecimalPlaces"
                    layout="compact"
                    :label="$t('goods_rows.fields.Height, cm')"
                )
            .actions
                GenericButton(type="primary" button-type="submit" size="small") {{ $t('goods_rows.actions.Update') }}
        .volume
            FormReadOnlyField(
                name="calculated-volume"
                :label="$t('goods_rows.fields.Calculated volume, m3')"
                :value="calculatedVolumeText"
                layout="compact"
                size="medium"
            )
            GenericButton(
                size="small"
                type="ghost"
                v-on:click="updateVolume"
            ) {{ $t('goods_rows.actions.Update volume') }}
</template>
<script setup lang="ts">
import { GoodsRow } from "~/models/GoodsRow";

const props = defineProps<{
    goodsRowIndex: number,
}>();

const { getGoodsRow } = useOrderFormGoodsRowAccessor(() => props.goodsRowIndex);

const { recalculateOrder } = useOrderFormStore();

type Dimensions = {
    length: number | null,
    width: number | null,
    height: number | null,
};

// all dimensions use the same manual attribute. changing any of them sets the whole field to manual
const { value: length, decimalPlaces: lengthDecimalPlaces } = useNumberFieldValue({
    recordAccessor: getGoodsRow,
    valueAttribute: "length",
    precisionAttribute: "lengthPrecision",
    manualAttribute: "dimensionsAreManual",
});

const { value: width, decimalPlaces: widthDecimalPlaces } = useNumberFieldValue({
    recordAccessor: getGoodsRow,
    valueAttribute: "width",
    precisionAttribute: "widthPrecision",
    manualAttribute: "dimensionsAreManual",
});

const { value: height, decimalPlaces: heightDecimalPlaces } = useNumberFieldValue({
    recordAccessor: getGoodsRow,
    valueAttribute: "height",
    precisionAttribute: "heightPrecision",
    manualAttribute: "dimensionsAreManual",
});

const valueIsManual = computed(() => {
    return getGoodsRow()?.dimensionsAreManual;
});

const dimensions = computed({
    get: () => {
        const result: Dimensions = {
            length: length.value,
            width: width.value,
            height: height.value
        };
        return result;
    },
    set: (value: Dimensions) => {
        length.value = value.length;
        width.value = value.width;
        height.value = value.height;
    }
});

const internalDimensions = ref(clone(dimensions.value));

const resetInternalDimensions = () => {
    internalDimensions.value = clone(dimensions.value);
};

const updateDimensions = () => {
    dimensions.value = internalDimensions.value;
    recalculateOrder();
    closePopover();
};

const popover = useTemplateRef("popover");
const closePopover = () => {
    if (popover.value) {
        popover.value.close();
    }
};

const displayableValue = computed(() => {
    // displayed values are always taken from the object in the store and not the internal state
    const values = dimensions.value;
    if (values.length === null && values.width === null && values.height === null) {
        return null;
    }
    const valueParts = [
        localizeNumber(values.length),
        localizeNumber(values.width),
        localizeNumber(values.height)
    ].map(value => (value == null) ? "-" : value);

    return valueParts.join(" x ");
});

const firstInput = useTemplateRef("firstInput");

const focusFirstInput = async () => {
    await nextTick();
    if (firstInput.value) {
        firstInput.value.focus();
    }
};

const maxVolumePrecision = GoodsRow.MAX_VOLUME_DECIMAL_PLACES;

const calculatedVolume = computed(() => {
    // this value should ideally be calculated with each keystroke in the dimensions input fields as the user types,
    // but naive ui does not update the value in realtime and ignores update-value-on-input if parse/format/precision are used,
    // therefore the value only gets calculated onchange / when the user leaves a field
    const values = internalDimensions.value;
    if (values.length === null || values.width === null || values.height === null) {
        return null;
    }

    // dimensions are always in cm (and should be integers, but that is not guaranteed)
    // volume should always be in m3
    let result = (values.length / 100) * (values.width / 100) * (values.height / 100);

    // ensure there are no more than maxVolumePrecision decimal places by rounding anything after that
    const precision = getNumberPrecision(result);
    if (precision > maxVolumePrecision) {
        const maxPrecisionMultiplier = Math.pow(10, maxVolumePrecision);
        result = Math.round(result * maxPrecisionMultiplier) / maxPrecisionMultiplier;
    }

    return result;
});

const calculatedVolumeText = computed(() => {
    if (calculatedVolume.value === null) {
        return null;
    }

    return localizeNumber(calculatedVolume.value, { maximumFractionDigits: maxVolumePrecision });
});

const updateVolume = () => {
    const row = getGoodsRow();
    if (!row) {
        return;
    }

    const intValueAndPrecision = calculatedVolumeAndPrecision.value;
    row.volume = intValueAndPrecision.intValue;
    row.volumePrecision = intValueAndPrecision.precision;
    row.volumeIsManual = true;
};

const calculatedVolumeAndPrecision = computed(() => {
    const value = calculatedVolume.value;
    if (value === null) {
        return {
            intValue: null,
            precision: null
        };
    }

    const precision = getNumberPrecision(value);
    const intValue = Math.round(value * Math.pow(10, precision));
    return {
        intValue,
        precision
    };
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getGoodsRow,
    fields: ["length", "length_precision", "width", "width_precision", "height", "height_precision"],
});

</script>
<style scoped lang="scss">
form[data-name="dimensions"] {
    width: steps(28);

    border-bottom: 1px solid $color-border-normal;
    padding-bottom: steps(2);

    fieldset {
        display: flex;
        gap: steps(1);
        margin-bottom: steps(2);
    }

    .actions {
        display: flex;
        gap: steps(1);

        .button {
            flex: 1 1 50%;
        }
    }
}
.volume {
    display: flex;
    align-items: center;
    padding-top: steps(2);
}
</style>
