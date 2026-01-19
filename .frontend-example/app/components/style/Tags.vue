<template lang="pug">
StyleSection(title="Tags")
    StyleExamples(v-for="size in sizes" :key="size")
        StyleExample
            GenericTag(v-bind="fieldAttributes(size, 'generic')")
        StyleExample
            //- $color-background-inverted + $color-text-inverted
            GenericTag(v-bind="fieldAttributes(size, 'custom colors')" color="#4C505D" text-color="#EEEEF0")
        StyleExample
            GenericTag(v-bind="fieldAttributes(size, 'removable')" :removable="true" v-on:remove="handleRemove")

</template>
<script setup lang="ts">

const sizes = ["small", "medium", "large"] as const;

const fieldAttributes = (size: "small" | "medium" | "large", textSuffix?: string) => {
    const textParts = [
        `${capitalizeFirstLetter(size)}`
    ];
    if (textSuffix) {
        textParts.push(textSuffix);
    }
    textParts.push("tag");

    const text = textParts.join(" ");

    return {
        text,
        size
    };
};

const handleRemove = () => {
    alert("Remove!");
};


</script>
<style scoped lang="scss"></style>
