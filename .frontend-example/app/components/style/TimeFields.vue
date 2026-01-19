<template lang="pug">
StyleSection(title="Time fields")
    template(v-for="layout in layouts" :key="layout")
        StyleExamples(v-for="size in sizes" :key="size")
            StyleExample
                FormTimeField(v-bind="fieldAttributes(layout, size)")
            StyleExample
                FormTimeField(v-bind="fieldAttributes(layout, size, 'with a value')" v-model="value")
            StyleExample
                FormTimeField(v-bind="fieldAttributes(layout, size, 'changed')" v-model="value" :changed="true")
            StyleExample
                FormTimeField(v-bind="fieldAttributes(layout, size, 'with a placeholder')" placeholder="Placeholder text")
            StyleExample
                FormTimeField(v-bind="fieldAttributes(layout, size, 'disabled')" v-model="value" :disabled="true")
            StyleExample(width="narrow")
                FormTimeField(v-bind="fieldAttributes(layout, size, 'overflowing label')" v-model="value")

    StyleLabelHidingDescription

    template(v-for="layout in hideableLabelLayouts" :key="layout")
        StyleExamples(v-for="size in sizes" :key="size")
            StyleExample
                FormTimeField(v-bind="fieldAttributes(layout, size)" :label-visible="false")
            StyleExample
                FormTimeField(v-bind="fieldAttributes(layout, size, 'with a value')" v-model="value" :label-visible="false")
            StyleExample
                FormTimeField(v-bind="fieldAttributes(layout, size, 'disabled')" v-model="value" :disabled="true" :label-visible="false")

</template>
<script setup lang="ts">

const layouts = ["loose", "compact"] as const;
const hideableLabelLayouts = ["loose"] as const;
const sizes = ["medium", "large"] as const;

const value = ref("11:12:13");

const fieldAttributes = (layout: "loose" | "compact", size: "medium" | "large", labelSuffix?: string) => {
    const labelParts = [
        `${capitalizeFirstLetter(layout)} ${size} time input`
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


</script>
<style scoped lang="scss"></style>
