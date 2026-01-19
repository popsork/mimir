<template lang="pug">
StyleSection(title="Switch fields")
    template(v-for="layout in layouts" :key="layout")
        StyleDescription
            template(v-if="layout === 'aligned'")
                | Aligned layout is mostly used for lists of switches.
                | The label goes on the left and the field takes up all of the available space.
                | The control is on the far right of the container.
            template(v-if="layout === 'inline'")
                | Inline switch fields are mostly for single switches. The label goes before or after the switch and the field does not extend to full width.
        template(v-for="labelPosition in labelPositionsByLayout[layout]" :key="labelPosition")
            StyleDescription(v-if="labelPosition")
                | {{ `label-position="${labelPosition}"` }}

            StyleExamples
                StyleExample
                    FormSwitchField(v-model="onOrOff" v-bind="fieldAttributes(layout, labelPosition, 'single switch field')")
                    p.output On: {{ onOrOff }}
                StyleExample
                    FormSwitchField(
                        v-for="option in options"
                        :key="option.value"
                        v-model="selectedOptions"
                        :value="option.value"
                        v-bind="fieldAttributes(layout, labelPosition, option.label)"
                    )
                    p.output On: {{ selectedOptions }}
                StyleExample
                    FormSwitchField(v-model="onOrOff" v-bind="fieldAttributes(layout, labelPosition, 'switch field with a label that wraps to multiple lines')")
                    p.output On: {{ onOrOff }}
                StyleExample
                    FormSwitchField(v-model="alwaysOn" v-bind="fieldAttributes(layout, labelPosition, 'disabled switch field')" :disabled="true")
                StyleExample
                    FormSwitchField(v-model="alwaysOff" v-bind="fieldAttributes(layout, labelPosition, 'disabled switch field')" :disabled="true")
</template>
<script setup lang="ts">

const layouts = ["aligned", "inline"] as const;
const labelPositionsByLayout = {
    aligned: [undefined],
    inline: ["after", "before"] as const,
};

const alwaysOn = ref(true);
const alwaysOff = ref(false);

const onOrOff = ref(false);

const options = [
    { value: "1", label: "multiple choice option 1" },
    { value: "2", label: "shorter option 2" },
    { value: "3", label: "multiple choice option 3" }
];

const selectedOptions = ref(["1"]);

const fieldAttributes = (layout: "aligned" | "inline", labelPosition: "before" | "after" | undefined, labelSuffix: string) => {
    return {
        layout,
        labelPosition,
        label: `${capitalizeFirstLetter(layout)} ${labelSuffix} `,
    };
};

</script>
<style scoped lang="scss">
section {
    .examples {
        gap: steps(4);

        .field {
            margin-bottom: steps(1);
        }

        .output {
            margin-top: steps(1);
        }
    }
}
</style>
