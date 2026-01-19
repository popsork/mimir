<template lang="pug">
StyleSection(title="Popover fields")

    StyleDescription
        | Popover fields may look like normal inputs but cannot be edited directly.
        br
        | Instead, they are actually buttons that open up a popover when clicked.
        br
        | The functionality inside the popover and the field's displayed value is completely custom each time.
        br
        | Currently, only loose layout / medium size variant is implemented.

    StyleExamples
        StyleExample
            FormPopoverField(v-bind="fieldAttributes()")
                template(v-slot:popover)
                    p {{ popoverDescription }}
                    p {{ simpleFieldDescription }}

        StyleExample
            FormPopoverField(
                v-bind="fieldAttributes('custom fields in popover')"
                ref="defaultExample"
                :value="displayedValue"
                v-on:open="focusFirstInput"
                v-on:close="cancel"
            )
                template(v-slot:popover)
                    GenericForm.custom-popover-content(v-on:submit.prevent="update")
                        p {{ popoverDescription }}
                        p {{ multipleFieldsDescription }}
                        FormInputField(ref="defaultExampleFirstInput" v-model="internalFoo" size="medium" layout="compact" label="First part")
                        FormInputField(v-model="internalBar" size="medium" layout="compact" label="Second part")
                        .actions
                            GenericButton(type="ghost" size="small" v-on:click="cancel") Cancel
                            GenericButton(type="primary" button-type="submit" size="small" v-on:click="update") Update

        StyleExample
            FormPopoverField(
                v-bind="fieldAttributes('custom trigger content as well')"
                ref="customTriggerExample"
                v-on:open="focusFirstInput"
                v-on:close="cancel"
            )
                template(v-slot:trigger)
                    p.custom-trigger
                        | Custom
                        |
                        span trigger
                        |
                        | HTML ({{ displayedValue }})
                template(v-slot:popover)
                    GenericForm.custom-popover-content(v-on:submit.prevent="update")
                        p {{ popoverDescription }}
                        p {{ multipleFieldsDescription }}
                        FormInputField(ref="customTriggerExampleFirstInput" v-model="internalFoo" size="medium" layout="compact" label="First part")
                        FormInputField(v-model="internalBar" size="medium" layout="compact" label="Second part")
                        .actions
                            GenericButton(type="ghost" size="small" v-on:click="cancel") Cancel
                            GenericButton(type="primary" button-type="submit" size="small" v-on:click="update") Update

        StyleExample(width="narrow")
            FormPopoverField(v-bind="fieldAttributes('overflowing label')")
                template(v-slot:popover)
                    p {{ popoverDescription }}
                    p {{ simpleFieldDescription }}

    StyleLabelHidingDescription

    StyleExamples
        StyleExample
            FormPopoverField(v-bind="fieldAttributes()" :label-visible="false")
                template(v-slot:popover)
                    p {{ popoverDescription }}
                    p {{ simpleFieldDescription }}

        StyleExample
            FormPopoverField(
                v-bind="fieldAttributes('custom fields in popover')"
                ref="hiddenLabelExample"
                :label-visible="false"
                :value="displayedValue"
                v-on:open="focusFirstInput"
                v-on:close="cancel"
            )
                template(v-slot:popover)
                    GenericForm.custom-popover-content(v-on:submit.prevent="update")
                        p {{ popoverDescription }}
                        p {{ multipleFieldsDescription }}
                        FormInputField(ref="hiddenLabelExampleFirstInput" v-model="internalFoo" size="medium" layout="compact" label="First part")
                        FormInputField(v-model="internalBar" size="medium" layout="compact" label="Second part")
                        .actions
                            GenericButton(type="ghost" size="small" v-on:click="cancel") Cancel
                            GenericButton(type="primary" button-type="submit" size="small" v-on:click="update") Update

        StyleExample
            FormPopoverField(
                v-bind="fieldAttributes('custom trigger content as well')"
                ref="hiddenLabelCustomTriggerExample"
                :label-visible="false"
                v-on:open="focusFirstInput"
                v-on:close="cancel"
            )
                template(v-slot:trigger)
                    p.custom-trigger
                        | Custom
                        |
                        span trigger
                        |
                        | HTML ({{ displayedValue }})
                template(v-slot:popover)
                    GenericForm.custom-popover-content(v-on:submit.prevent="update")
                        p {{ popoverDescription }}
                        p {{ multipleFieldsDescription }}
                        FormInputField(ref="hiddenLabelCustomTriggerExampleFirstInput" v-model="internalFoo" size="medium" layout="compact" label="First part")
                        FormInputField(v-model="internalBar" size="medium" layout="compact" label="Second part")
                        .actions
                            GenericButton(type="ghost" size="small" v-on:click="cancel") Cancel
                            GenericButton(type="primary" button-type="submit" size="small" v-on:click="update") Update

</template>
<script setup lang="ts">

const popoverDescription = "Custom popover content for more complex fields.";
const simpleFieldDescription = "See other fields in this row for fuller examples.";
const multipleFieldsDescription = "If multiple fields are used, this should be a form element, so that dialog can be closed with Enter key.";


const defaultValueFoo = "Existing";
const defaultValueBar = "value";

const valueFoo = ref(defaultValueFoo);
const valueBar = ref(defaultValueBar);

const internalFoo = ref(valueFoo.value);
const internalBar = ref(valueBar.value);

const displayedValue = computed(() => `${valueFoo.value} ${valueBar.value}`);

const exampleRefs = [
    useTemplateRef("defaultExample"),
    useTemplateRef("customTriggerExample"),
    useTemplateRef("hiddenLabelExample"),
    useTemplateRef("hiddenLabelCustomTriggerExample")
];

const closeAll = () => {
    exampleRefs.forEach((ref) => {
        if (ref.value) {
            ref.value.close();
        }
    });
};

const cancel = () => {
    internalFoo.value = valueFoo.value;
    internalBar.value = valueBar.value;
    closeAll();
};

const update = () => {
    valueFoo.value = internalFoo.value;
    valueBar.value = internalBar.value;
    closeAll();
};

const firstInputRefs = [
    useTemplateRef("defaultExampleFirstInput"),
    useTemplateRef("customTriggerExampleFirstInput"),
    useTemplateRef("hiddenLabelExampleFirstInput"),
    useTemplateRef("hiddenLabelCustomTriggerExampleFirstInput")
];

const focusFirstInput = async () => {
    await nextTick();
    firstInputRefs.forEach((ref) => {
        if (ref.value) {
            ref.value.focus();
        }
    });
};

const fieldAttributes = (labelSuffix?: string) => {
    const labelParts = [
        `Popover input`
    ];
    if (labelSuffix) {
        labelParts.push(labelSuffix);
    }
    const label = labelParts.join(": ");

    return {
        label
    };
};


</script>
<style scoped lang="scss">
section {
    .example {
        .custom-trigger {
            @include word-clip;
            span {
                font-weight: bold;
                color: $color-text-lightest;
            }
        }
    }
}
.custom-popover-content {

    max-width: steps(25);
    p,
    .field {
        margin-bottom: steps(2);
    }

    .actions {
        display: flex;

        .button {
            flex: 1;
        }
    }
}
</style>
