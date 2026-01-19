<template lang="pug">
StyleSection(title="Custom fields")
    StyleDescription
        | These are for cases when only the label is needed and everything else inside the field is custom.

    StyleExamples(v-for="size in sizes" :key="size")
        StyleExample
            FormCustomField(v-bind="fieldAttributes(size)")
                p
                    | Completely custom
                    br
                    strong HTML
                    br
                    | content here

    StyleDescription
        | Labels can be hidden with `:label-visible="false"`.
        br
        | For custom fields this may be needed when having multiple rows of fields
        | where the first row needs to have a label and the others don't.

    StyleExamples(v-for="size in sizes" :key="size")
        StyleExample
            FormCustomField(v-bind="fieldAttributes(size)" :label-visible="false")
                p
                    | Completely custom
                    br
                    strong HTML
                    br
                    | content here


</template>
<script setup lang="ts">

const sizes = ["medium", "large"] as const;

const fieldAttributes = (size: "medium" | "large", labelSuffix?: string) => {
    const labelParts = [
        `${capitalizeFirstLetter(size)} custom field`
    ];
    if (labelSuffix) {
        labelParts.push(labelSuffix);
    }
    const label = labelParts.join(" ");

    return {
        label,
        size
    };
};



</script>
<style scoped lang="scss"></style>
