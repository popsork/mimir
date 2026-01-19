<template lang="pug">
FormPopoverField(
    ref="popover"
    name="packages"
    :label="$t('goods_rows.fields.Packages')"
    :label-visible="goodsRowIndex === 0"
    :errors="errors"
    v-on:open="handleOpen"
    v-on:close="handleClose"
)
    template(v-slot:trigger)
        template(v-if="popoverIsOpen || numberOfPackages > 0")
            span.number-of-packages
                GenericTag(:text="numberOfPackages.toString()" size="small")
        template(v-else)
            span.add-button
                span.text {{ $t('packages.actions.Add') }}
                SvgImage(name="plus-circled" class="icon")
    template(v-slot:popover)
        .packages-popover-content
            FormCustomField(name="package-numbers" :label="$t('packages.fields.Package numbers')")
                .numbers
                    GenericTag(
                        v-for="(record, index) in packages"
                        :key="record.id"
                        size="large"
                        :text="record.number"
                        :removable="true"
                        v-on:remove="removePackage(index)"
                    )
            GenericForm(data-name="packages" v-on:submit.prevent="addNewPackage")
                fieldset
                    FormInputField(
                        ref="newNumberInput"
                        v-model="newPackageNumber"
                        name="new-number"
                        size="medium"
                        :label="$t('packages.fields.Add number')"
                    )
                    GenericButton(type="primary" button-type="submit" size="small") {{ $t('packages.actions.Add') }}

                .actions
                    GenericButton(type="ghost" size="small" v-on:click="closePopover") {{ $t('general.Close') }}
</template>
<script setup lang="ts">
import { JsonApiErrorCollection } from "~/models/JsonApiErrorCollection";


const props = defineProps<{
    goodsRowIndex: number,
}>();

const { getGoodsRow } = useOrderFormGoodsRowAccessor(() => props.goodsRowIndex);

const { recalculateOrder } = useOrderFormStore();

const goodsStore = useOrderFormGoodsStore();

const packages = computed(() => {
    const row = getGoodsRow();
    if (!row) {
        return [];
    }

    return row.packages || [];
});

const numberOfPackages = computed(() => {
    return packages.value.length;
});

const popoverIsOpen = ref(false);

const handleOpen = () => {
    popoverIsOpen.value = true;
    focusNewNumberInput();
};

const handleClose = () => {
    popoverIsOpen.value = false;
};


const newPackageNumber = ref("");

const addNewPackage = () => {
    const row = getGoodsRow();
    if (!row) {
        return;
    }

    if (newPackageNumber.value === "") {
        focusNewNumberInput();
        return;
    }

    goodsStore.addPackage(props.goodsRowIndex, newPackageNumber.value);
    recalculateOrder();
    newPackageNumber.value = "";
    focusNewNumberInput();
};

const removePackage = (index: number) => {
    const row = getGoodsRow();
    if (!row) {
        return;
    }

    goodsStore.removePackage(props.goodsRowIndex, index);
    recalculateOrder();
};

const popover = useTemplateRef("popover");
const closePopover = () => {
    if (popover.value) {
        popover.value.close();
    }
};

const newNumberInput = useTemplateRef("newNumberInput");

const focusNewNumberInput = async () => {
    await nextTick();
    if (newNumberInput.value) {
        newNumberInput.value.focus();
    }
};

const { form } = storeToRefs(useOrderFormStore());

const errors = computed(() => {
    // filter out which packages are related to the current goods row
    // and collect all of their errors underneath the single package field.
    // eventually maybe there could be a better way of displaying these
    return packages.value.reduce((errors, record) => {
        return errors.concat(form.value.errors.forRecord(record)) as JsonApiErrorCollection;
    }, new JsonApiErrorCollection());
});


</script>
<style scoped lang="scss">
.field {
    .number-of-packages,
    .add-button {
        display: inline-flex;
        width: 100%;
    }

    .number-of-packages {
        background: $color-background-lightest;
        border-radius: $element-border-radius-small;
        padding: steps(0.5);
    }

    .add-button {
        justify-content: center;
        align-items: center;
        gap: steps(0.5);
        height: steps(3);
    }

}
.packages-popover-content {
    width: steps(29);

    .field[data-name="package-numbers"] {

        .numbers {
            display: flex;
            flex-wrap: wrap;
            gap: steps(0.5);

            margin: steps(2) 0;
        }
    }

    form[data-name="packages"] {

        fieldset {
            display: flex;
            gap: steps(1);
            align-items: flex-end;
            margin-bottom: steps(2.5);
        }

        .actions {
            display: flex;
            justify-content: center;
        }
    }

}
</style>
