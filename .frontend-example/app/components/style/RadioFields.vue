<template lang="pug">
StyleSection(title="Radio fields")
    StyleExamples
        StyleExample
            FormRadioField(
                v-for="option in options"
                :key="option.value"
                v-model="value"
                :value="option.value"
                name="radio-one"
                v-bind="fieldAttributes(option.label)"
            )
            p.output Value: {{ value }}

        StyleExample
            FormRadioField(
                v-for="option in options"
                :key="option.value"
                v-model="value"
                :value="option.value"
                name="radio-two"
                :disabled="true"
                v-bind="fieldAttributes(`${option.label}: disabled`)"
            )

        StyleExample
            FormRadioField(
                v-for="option in options"
                :key="option.value"
                v-model="value"
                :value="option.value"
                name="radio-three"
                v-bind="fieldAttributes(`${option.label} with a longer label that wraps to multiple lines`)"
            )
            p.output Value: {{ value }}

    StyleDescription
        span Radio fields can have complex labels passed in via slot insted of the label prop.
        br
        span In that case the field is rendered with a border and the whole box is clickable.

    StyleExamples
        StyleExample
            FormRadioField(
                v-for="option in options"
                :key="option.value"
                v-model="value"
                :value="option.value"
                name="radio-four"
            )
                p.line-one Example
                p.line-two {{ option.label }}
                p.line-three with custom slotted label content
            p.output Value: {{ value }}

        StyleExample
            FormRadioField(
                v-for="option in options"
                :key="option.value"
                v-model="value"
                :disabled="true"
                :value="option.value"
                name="radio-five"
            )
                p.line-one Disabled
                p.line-two {{ option.label }}
                p.line-three with custom slotted label content


</template>
<script setup lang="ts">


const value = ref("1");

const options = [
    { value: "1", label: "Single choice option 1" },
    { value: "2", label: "Single choice option 2" },
    { value: "3", label: "Single choice option 3" }
];

const fieldAttributes = (label: string) => {
    return {
        label
    };
};

</script>
<style scoped lang="scss">
section {
    .example {

        .field {
            margin-bottom: steps(1);
        }

        .output {
            margin-top: steps(1);
        }

        .line-one {
            @include small-medium-text;
        }
        .line-two {
            @include normal-strong-text;
        }
        .line-three {
            @include normal-text;
        }
    }
}
</style>
