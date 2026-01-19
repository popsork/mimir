<template lang="pug">
StyleSection(title="Checkbox fields")
    StyleExamples(v-for="size in sizes" :key="size")
        StyleExample
            FormCheckboxField(v-model="checked" v-bind="fieldAttributes(size, 'single checkbox field')")
            p.output Checked: {{ checked }}
        StyleExample
            FormCheckboxField(
                v-for="option in options"
                :key="option.value"
                v-model="selectedOptions"
                :value="option.value"
                v-bind="fieldAttributes(size, option.label)"
            )
            p.output Checked: {{ selectedOptions }}
        StyleExample
            FormCheckboxField(v-model="checked" v-bind="fieldAttributes(size, 'checkbox field with a label that wraps to multiple lines')")
            p.output Checked: {{ checked }}
        StyleExample
            FormCheckboxField(v-model="checked" v-bind="fieldAttributes(size, 'changed checkbox field')" :changed="true")
        StyleExample
            FormCheckboxField(v-model="alwaysChecked" v-bind="fieldAttributes(size, 'disabled checkbox field')" :disabled="true")
        StyleExample
            FormCheckboxField(v-model="alwaysUnchecked" v-bind="fieldAttributes(size, 'disabled checkbox field')" :disabled="true")
</template>
<script setup lang="ts">

const sizes = ["medium", "small"] as const;

const alwaysChecked = ref(true);
const alwaysUnchecked = ref(false);

const checked = ref(false);

const options = [
    { value: "1", label: "multiple choice option 1" },
    { value: "2", label: "multiple choice option 2" },
    { value: "3", label: "multiple choice option 3" }
];

const selectedOptions = ref(["1"]);

const fieldAttributes = (size: "medium" | "small", labelEnd: string) => {
    return {
        label: `${capitalizeFirstLetter(size)} ${labelEnd} `,
        size
    };
};

</script>
<style scoped lang="scss">
section {
    .examples {

        .field {
            margin-bottom: steps(1);
        }

        .output {
            margin-top: steps(1);
        }
    }
}
</style>
