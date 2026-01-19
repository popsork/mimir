<template lang="pug">
StyleSection(title="Textarea fields")
    template(v-for="layout in layouts" :key="layout")
        StyleExamples(v-for="size in sizes" :key="size")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size)")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'value + button')" v-model="value")
                    template(v-slot:suffix)
                        button(type="button" title="Click me!" v-on:click="handleClick")
                            SvgImage(name="arrows-cycle")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'placeholder')" placeholder="Placeholder text")
            StyleExample
                FormInputField(
                    v-bind="fieldAttributes(layout, size, 'changed + bottom icon')"
                    v-model="value"
                    :changed="true"
                    suffix-position="bottom"
                    :resizable="false"
                )
                    template(v-slot:suffix)
                        SvgImage(name="arrows-cycle")
            StyleExample
                FormInputField(v-bind="fieldAttributes(layout, size, 'disabled')" v-model="value" :disabled="true")
            StyleExample(width="narrow")
                FormInputField(v-bind="fieldAttributes(layout, size, 'overflowing label')" v-model="value")

</template>
<script setup lang="ts">


const layouts = ["loose", "compact"] as const;
const sizes = ["medium", "large"] as const;

const value = ref(`Value ipsum dolor Cras rhoncus nibh eget nulla suscipit, ut luctus felis venenatis.
                Integer quis luctus nisl. Etiam at lorem sit amet lectus sagittis iaculis.
                Etiam sem mauris, ullamcorper feugiat aliquet ut, tincidunt et leo.
                Mauris mollis nec orci a gravida. Aenean ut ornare eros.
                Sed a dolor eu nibh luctus mattis.`.replace(/\s+/g, " ")
);

const fieldAttributes = (layout: "loose" | "compact", size: "medium" | "large", labelSuffix?: string) => {
    const labelParts = [
        `${capitalizeFirstLetter(layout)} ${size} textarea`
    ];
    if (labelSuffix) {
        labelParts.push(labelSuffix);
    }
    const label = labelParts.join(": ");

    return {
        type: "textarea" as const,
        label,
        layout,
        size,
        waiting: isWaiting.value
    };
};

const isWaiting = ref(false);

const handleClick = () => {
    isWaiting.value = true;
    setTimeout(() => {
        value.value = (value.value === "Clicked") ? "Clicked again" : "Clicked";
        isWaiting.value = false;
    }, 2000);
};

</script>
<style scoped lang="scss"></style>
