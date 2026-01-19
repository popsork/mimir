<template lang="pug">
StyleSection(title="Text fields")
    template(v-for="layout in layouts" :key="layout")
        StyleExamples(v-for="size in sizes" :key="size")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size)")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'value + button')" v-model="value")
                    template(v-slot:suffix)
                        button(type="button" title="Click me!" v-on:click="handleClick")
                            SvgImage(name="arrows-cycle")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'placeholder')" placeholder="Placeholder text")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'changed + icon')" v-model="value" :changed="true")
                    template(v-slot:suffix)
                        SvgImage(name="arrows-cycle")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'disabled')" v-model="value" :disabled="true")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'error')" v-model="value" :errors="singleError")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'multiple errors')" v-model="value" :errors="multipleErrors")
            StyleExample(width="narrow")
                FormInputField(v-bind="fieldAttributes(layout, size, 'overflowing label')" v-model="value" )
            StyleExample(width="narrow")
                FormInputField(v-bind="fieldAttributes(layout, size, 'long error message')" v-model="value" :errors="singleError")

    StyleExamples
        StyleExample
            FormInputField(type="search" placeholder="Custom search input" :waiting="isWaiting")
                template(v-slot:suffix)
                    button(type="button" title="Search")
                        SvgImage(name="search")

    StyleLabelHidingDescription

    template(v-for="layout in hideableLabelLayouts" :key="layout")
        StyleExamples(v-for="size in sizes" :key="size")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size)" :label-visible="false")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'value + button')" v-model="value" :label-visible="false")
                    template(v-slot:suffix)
                        button(type="button" title="Click me!" v-on:click="handleClick")
                            SvgImage(name="arrows-cycle")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'disabled')" v-model="value" :disabled="true" :label-visible="false")

</template>
<script setup lang="ts">
import { JsonApiError } from "~/models/JsonApiError";
import { JsonApiErrorCollection } from "~/models/JsonApiErrorCollection";

const layouts = ["loose", "compact"] as const;
const hideableLabelLayouts = ["loose"] as const;
const sizes = ["medium", "large"] as const;

const value = ref("Value ipsum dolor");

const fieldAttributes = (layout: "loose" | "compact", size: "medium" | "large", labelSuffix?: string) => {
    const labelParts = [
        `${capitalizeFirstLetter(layout)} ${size} text input`
    ];
    if (labelSuffix) {
        labelParts.push(labelSuffix);
    }
    const label = labelParts.join(": ");

    return {
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
        value.value = (value.value === "Clicked") ? "Clicked again" : "Clicked";
        isWaiting.value = false;
    }, 2000);
};



</script>
<style scoped lang="scss"></style>
