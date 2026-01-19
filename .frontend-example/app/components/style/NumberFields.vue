<template lang="pug">
StyleSection(title="Number fields")
    template(v-for="layout in layouts" :key="layout")
        StyleExamples(v-for="size in sizes" :key="size")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'integer')")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'decimal', '2 decimal places')" :decimal-places="2")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'integer', 'value + button')" v-model="value")
                    template(v-slot:suffix)
                        button(type="button" title="Click me!" v-on:click="handleClick")
                            SvgImage(name="arrows-cycle")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'integer', 'placeholder')" placeholder="Placeholder text")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'decimal', 'changed + icon')" v-model="value" :changed="true" :decimal-places="3")
                    template(v-slot:suffix)
                        SvgImage(name="arrows-cycle")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'decimal', 'disabled')" v-model="value" :disabled="true" :decimal-places="3")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'integer', 'error')" v-model="value" :errors="singleError")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'integer', 'multiple errors')" v-model="value" :errors="multipleErrors")
            StyleExample(width="narrow")
                FormInputField(v-bind="fieldAttributes(layout, size, 'integer', 'overflowing label')" v-model="value")
            StyleExample(width="narrow")
                FormInputField(v-bind="fieldAttributes(layout, size, 'integer', 'long error message')" v-model="value" :errors="singleError")
    StyleLabelHidingDescription

    template(v-for="layout in hideableLabelLayouts" :key="layout")
        StyleExamples(v-for="size in sizes" :key="size")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'integer')" :label-visible="false")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'decimal', '2 decimal places')" :label-visible="false" :decimal-places="2")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'integer', 'value + button')" v-model="value" :label-visible="false")
                    template(v-slot:suffix)
                        button(type="button" title="Click me!" v-on:click="handleClick")
                            SvgImage(name="arrows-cycle")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'decimal', 'disabled')" v-model="value" :disabled="true" :decimal-places="3" :label-visible="false")

</template>
<script setup lang="ts">
import { JsonApiError } from "~/models/JsonApiError";
import { JsonApiErrorCollection } from "~/models/JsonApiErrorCollection";



const layouts = ["loose", "compact"] as const;
const hideableLabelLayouts = ["loose"] as const;
const sizes = ["medium", "large"] as const;

const value = ref(123);

const fieldAttributes = (layout: "loose" | "compact", size: "medium" | "large", type: "integer" | "decimal", labelSuffix?: string) => {
    const labelParts = [
        `${capitalizeFirstLetter(layout)} ${size} ${type} input`
    ];
    if (labelSuffix) {
        labelParts.push(labelSuffix);
    }
    const label = labelParts.join(": ");

    return {
        type,
        label,
        layout,
        size,
        waiting: isWaiting.value
    };
};

const buildDummyError = (number?: number) => {
    return new JsonApiError({ detail: `Error message ${number ?? ""} text lorem ipsum` });
};

const singleError = JsonApiErrorCollection.fromArray([buildDummyError()]);
const multipleErrors = JsonApiErrorCollection.fromArray([
    buildDummyError(1),
    buildDummyError(2),
    buildDummyError(3)
]);

const isWaiting = ref(false);

const handleClick = () => {
    isWaiting.value = true;
    setTimeout(() => {
        value.value = (value.value === 123) ? 456 : 123;
        isWaiting.value = false;
    }, 2000);
};

</script>
<style scoped lang="scss"></style>
