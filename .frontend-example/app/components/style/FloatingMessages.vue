<template lang="pug">
StyleSection(title="Floating messages")
    StyleDescription
        | Click on these buttons to display floating messages.

    StyleExamples
        StyleExample(v-for="example in examples" :key="example.type")
            GenericButton(type="secondary" v-on:click="showExample(example.type, example.text)") {{ example.label }}

</template>
<script setup lang="ts">

const examples = [
    {
        label: "Show info message",
        type: FloatingMessageType.Info,
        text: "This is an informational message",
    },
    {
        label: "Show success message",
        type: FloatingMessageType.Success,
        text: "This is a success message",
    },
    {
        label: "Show warning message",
        type: FloatingMessageType.Warning,
        text: "This is a warning message that is" + " very long, very very long,".repeat(10) + " and should wrap",
    },
    {
        label: "Show error message",
        type: FloatingMessageType.Error,
        text: "This is an error message",
    },
];


const { showMessage } = useFloatingMessage();
const showExample = (type: FloatingMessageType, text: string) => {
    showMessage({
        type,
        text
    });
};
</script>
<style scoped lang="scss"></style>
