<template lang="pug">
FormInputField(
    v-model="value"
    name="driver_instructions"
    :label="$t('transport_orders.fields.Driver instructions')"
    layout="compact"
    type="textarea"
    :resizable="resizable"
    :errors="errors"
    :data-field-size="size"
    suffix-position="bottom"
)
    template(v-slot:suffix)
        button.size(type="button" :title="sizeButtonTitle" v-on:click="toggleSize")
            SvgImage(:name="sizeButtonIcon")
</template>
<script setup lang="ts">
import { useLocalStorage, StorageSerializers } from "@vueuse/core";

const props = defineProps<{
    transportOrderIndex: number,
}>();

const { getTransportOrder } = useOrderFormTransportOrderAccessor(() => props.transportOrderIndex);

const { value } = useTextFieldValue({
    recordAccessor: getTransportOrder,
    valueAttribute: "driverInstructions",
});

const resizable = computed(() => {
    // resizing of this field is currently intenionally disabled
    // because the resizing mechanism of Naive UI does not work well with minimum-height requirements for this field.
    // the field needs to extend vertically to at least fill the whole transport order row,
    // but setting min-height on the field if resizing is turned on causes problems during resizing.
    return false;
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getTransportOrder,
    field: "driver_instructions",
});

enum DriverInstructionsFieldSize {
    Default = "default",
    Large = "large",
}

// toggling the size affects all transport orders in the form (all driver instructions fields expand/collapse simultaneously).
// size preference is currenntly stored in localstorage.
// eventually, it should be stored in the user profile settings instead (TMS-1392).
const sizeInLocalStorage = useLocalStorage("driver-instructions-field-size", null, { serializer: StorageSerializers.string });

const size = computed<DriverInstructionsFieldSize>({
    get: () => {
        return sizeInLocalStorage.value === DriverInstructionsFieldSize.Large ? DriverInstructionsFieldSize.Large : DriverInstructionsFieldSize.Default;
    },
    set: (value) => {
        sizeInLocalStorage.value = value;
    }
});

const sizeIsLarge = computed(() => {
    return size.value === DriverInstructionsFieldSize.Large;
});

const toggleSize = () => {
    size.value = sizeIsLarge.value ? DriverInstructionsFieldSize.Default : DriverInstructionsFieldSize.Large;
};

const sizeButtonIcon = computed(() => {
    return sizeIsLarge.value ? "double-chevron-up" : "double-chevron-down";
});

const { t } = useI18n();
const sizeButtonTitle = computed(() => {
    return sizeIsLarge.value ? t("general.Collapse") : t("general.Expand");
});

</script>
<style scoped lang="scss">
.field {

    &[data-field-size="large"] {
        height: steps(24);
    }

    button.size {
        width: steps(2.5);
        height: steps(2.5);
    }

}
</style>
