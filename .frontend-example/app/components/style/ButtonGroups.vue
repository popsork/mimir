<template lang="pug">
StyleSection(title="Button groups")
    StyleExamples
        .example
            ButtonGroup()
                GroupButton(
                    v-for="option in options"
                    :key="option.value"
                    :selected="option.selected"
                    v-on:click="setSelectedOption(option.value)"
                ) {{ option.label }}

        .example
            ButtonGroup()
                GroupButton(
                    icon="chevron-left"
                    title="Icon only"
                )
                GroupButton(
                    icon="chevron-right"
                    title="Icon only"
                )

</template>
<script setup lang="ts">

const selectedOption = ref(1);

const setSelectedOption = (value: number) => {
    selectedOption.value = value;
};

const options = computed(() => {
    return [
        {
            value: 1,
            label: "Option one",
            selected: selectedOption.value === 1
        },
        {
            value: 2,
            label: "Option two",
            selected: selectedOption.value === 2
        },
        {
            value: 3,
            label: "Option three",
            selected: selectedOption.value === 3
        }
    ];
});

</script>
<style scoped lang="scss"></style>
