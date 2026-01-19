<template lang="pug">
StyleSection(title="Date and time range fields")
    template(v-for="layout in layouts" :key="layout")
        StyleExamples(v-for="size in sizes" :key="size")
            StyleExample
                FormDateField(v-bind="fieldAttributes(layout, size)")
            StyleExample
                FormDateField(v-bind="fieldAttributes(layout, size, 'value')" v-model="value")
            StyleExample
                FormDateField(v-bind="fieldAttributes(layout, size, 'changed')" v-model="value" :changed="true")
            StyleExample
                FormDateField(v-bind="fieldAttributes(layout, size, 'disabled')" v-model="value" :disabled="true")
            StyleExample(width="narrow")
                FormDateField(v-bind="fieldAttributes(layout, size, 'overflowing label')" v-model="value")

    StyleLabelHidingDescription

    template(v-for="layout in hideableLabelLayouts" :key="layout")
        StyleExamples(v-for="size in sizes" :key="size")
            StyleExample
                FormDateField(v-bind="fieldAttributes(layout, size)" :label-visible="false")
            StyleExample
                FormDateField(v-bind="fieldAttributes(layout, size, 'value')" v-model="value" :label-visible="false")
            StyleExample
                FormDateField(v-bind="fieldAttributes(layout, size, 'disabled')" v-model="value" :disabled="true" :label-visible="false")

</template>
<script setup lang="ts">

const layouts = ["loose", "compact"] as const;
const hideableLabelLayouts = ["loose"] as const;
const sizes = ["medium", "large"] as const;

const value = ref<[string, string] | null>([
    getUtcDatetimeString(new Date())!,
    getUtcDatetimeString(new Date())!
]);

const fieldAttributes = (layout: "loose" | "compact", size: "medium" | "large", labelSuffix?: string) => {
    const labelParts = [
        `${capitalizeFirstLetter(layout)} ${size} datetime range input`
    ];
    if (labelSuffix) {
        labelParts.push(labelSuffix);
    }
    const label = labelParts.join(": ");

    return {
        type: "datetimerange" as const,
        label,
        layout,
        size
    };
};



</script>
<style scoped lang="scss"></style>
