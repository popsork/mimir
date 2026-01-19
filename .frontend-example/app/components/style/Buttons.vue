<template lang="pug">
StyleSection(name="buttons" title="Buttons")
    .examples
        .size(v-for="size in buttonSizes" :key="size")
            StyleExamples(v-for="type in buttonTypes" :key="type")
                template(v-for="state in buttonStates" :key="state")
                    StyleExample(data-name="no-icon")
                        GenericButton(
                            v-bind="buttonAttributes(size, type, state)"
                            v-on:click="buttonClick"
                        ) {{ buttonText(size, type) }}
                    StyleExample(data-name="icon-before")
                        GenericButton(
                            v-bind="buttonAttributes(size, type, state)"
                            :icon="icon"
                            icon-placement="before"
                            v-on:click="buttonClick"
                        ) {{ buttonText(size, type) }}
                    StyleExample(data-name="icon-after")
                        GenericButton(
                            v-bind="buttonAttributes(size, type, state)"
                            :icon="icon"
                            v-on:click="buttonClick"
                        ) {{ buttonText(size, type) }}
                    StyleExample(data-name="icon-only")
                        GenericButton(
                            v-bind="buttonAttributes(size, type, state)"
                            :icon="icon"
                            :title="buttonText(size, type)"
                            v-on:click="buttonClick"
                        )
</template>
<script setup lang="ts">
import type { GenericButtonSize, GenericButtonType } from "~/components/GenericButton.vue";

const icon = computed(() => {
    return "plus";
});

const buttonSizes: GenericButtonSize[] = ["large", "medium", "small"];
const buttonTypes: GenericButtonType[] = [
    "primary", "secondary", "tertiary", "quaternary",
    "ghost", "alternative-ghost", "alternative",
    "dangerous", "dangerous-ghost"
];
const buttonStates = ["normal", "disabled"] as const;

const buttonText = (size: string, type: string) => {
    return capitalizeFirstLetter(`${size} ${type} button`);
};

const buttonsWaiting = ref(false);

const buttonAttributes = (size: GenericButtonSize, type: GenericButtonType, state: "normal" | "disabled") => {
    return {
        size,
        type,
        disabled: state === "disabled",
        waiting: buttonsWaiting.value,
    };
};

const buttonClick = () => {
    buttonsWaiting.value = true;
    setTimeout(() => {
        buttonsWaiting.value = false;
    }, 2000);
};
</script>
<style scoped lang="scss">
section {

    .example {

        &[data-name="icon-only"] {
            flex-basis: steps(12);
            width: steps(12);
        }
    }

}
</style>
