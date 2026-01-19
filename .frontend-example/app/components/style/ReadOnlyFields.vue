<template lang="pug">
StyleSection(title="Read-only fields")
    template(v-for="layout in layouts" :key="layout")
        StyleExamples(v-for="size in sizes" :key="size")
            StyleExample
                FormReadOnlyField(v-bind="fieldAttributes(layout, size)" :value="value")
            StyleExample
                FormReadOnlyField(v-bind="fieldAttributes(layout, size, 'with a blank value')" :value="''")
            StyleExample
                FormReadOnlyField(v-bind="fieldAttributes(layout, size, 'with a long value')" :value="longValue")
            StyleExample(width="narrow")
                FormReadOnlyField(v-bind="fieldAttributes(layout, size, 'overflowing label')" :value="longValue")
            StyleExample
                FormInputField(v-bind="inputFieldAttributes(layout, size)" v-model="value")

    StyleLabelHidingDescription

    template(v-for="layout in hideableLabelLayouts" :key="layout")
        StyleExamples(v-for="size in sizes" :key="size")
            StyleExample
                FormReadOnlyField(v-bind="fieldAttributes(layout, size)" :value="value" :label-visible="false")
            StyleExample
                FormReadOnlyField(v-bind="fieldAttributes(layout, size, 'with a blank value')" :value="''" :label-visible="false")
            StyleExample
                FormReadOnlyField(v-bind="fieldAttributes(layout, size, 'with a long value')" :value="longValue" :label-visible="false")

</template>
<script setup lang="ts">

const layouts = ["loose", "compact"] as const;
const hideableLabelLayouts = ["loose"] as const;
const sizes = ["medium", "large"] as const;

const value = ref("Value ipsum dolor");
const longValue = ref("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus nec nunc");

const fieldAttributes = (layout: "loose" | "compact", size: "medium" | "large", labelSuffix?: string) => {
    const labelParts = [
        `${capitalizeFirstLetter(layout)} ${size} read-only field`
    ];
    if (labelSuffix) {
        labelParts.push(labelSuffix);
    }
    const label = labelParts.join(" ");

    return {
        label,
        layout,
        size
    };
};


const inputFieldAttributes = (layout: "loose" | "compact", size: "medium" | "large") => {
    const labelParts = [
        `Normal ${layout} ${size} input field for comparison`
    ];
    const label = labelParts.join(" ");

    return {
        label,
        layout,
        size
    };
};

</script>
<style scoped lang="scss"></style>
