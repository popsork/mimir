<template lang="pug">
StyleSection(title="Date and time fields")
    template(v-for="layout in layouts" :key="layout")
        StyleExamples(v-for="size in sizes" :key="size")
            StyleExample
                FormDateField(v-bind="fieldAttributes(layout, size, 'date')")
            StyleExample
                FormDateField(v-bind="fieldAttributes(layout, size, 'datetime')")
            StyleExample
                FormDateField(v-bind="fieldAttributes(layout, size, 'date', 'with a value')" v-model="dateValue")
            StyleExample
                FormDateField(v-bind="fieldAttributes(layout, size, 'datetime', 'with a value')" v-model="dateTimeValue")
            StyleExample
                FormDateField(v-bind="fieldAttributes(layout, size, 'datetime', 'changed')" v-model="dateTimeValue" :changed="true")
            StyleExample
                FormDateField(v-bind="fieldAttributes(layout, size, 'date', 'with a placeholder')" placeholder="Placeholder text")
            StyleExample
                FormDateField(v-bind="fieldAttributes(layout, size, 'date', 'disabled')" v-model="dateValue" :disabled="true")
            StyleExample
                FormDateField(v-bind="fieldAttributes(layout, size, 'datetime', 'disabled')" v-model="dateTimeValue" :disabled="true")
            StyleExample(width="narrow")
                FormDateField(v-bind="fieldAttributes(layout, size, 'datetime', 'overflowing label')" v-model="dateTimeValue")

    StyleLabelHidingDescription

    template(v-for="layout in hideableLabelLayouts" :key="layout")
        StyleExamples(v-for="size in sizes" :key="size")
            StyleExample
                FormDateField(v-bind="fieldAttributes(layout, size, 'datetime')" :label-visible="false")
            StyleExample
                FormDateField(v-bind="fieldAttributes(layout, size, 'datetime', 'with a value')" v-model="dateTimeValue" :label-visible="false")
            StyleExample
                FormDateField(v-bind="fieldAttributes(layout, size, 'datetime', 'disabled')" v-model="dateTimeValue" :disabled="true" :label-visible="false")

</template>
<script setup lang="ts">
import { format } from "date-fns";

const layouts = ["loose", "compact"] as const;
const hideableLabelLayouts = ["loose"] as const;
const sizes = ["medium", "large"] as const;

const dateValue = ref(format(new Date(), "yyyy-MM-dd"));
const dateTimeValue = ref(getUtcDatetimeString(new Date()));

const fieldAttributes = (layout: "loose" | "compact", size: "medium" | "large", type: "date" | "datetime", labelSuffix?: string) => {
    const labelParts = [
        `${capitalizeFirstLetter(layout)} ${size} ${type} input`
    ];
    if (labelSuffix) {
        labelParts.push(labelSuffix);
    }
    const label = labelParts.join(" ");

    return {
        type,
        label,
        layout,
        size
    };
};


</script>
<style scoped lang="scss"></style>
