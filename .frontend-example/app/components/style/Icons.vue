<template lang="pug">
StyleSection(name="icons" title="Icons")
    StyleDescription
        | Normal icons have no defined colors themselves and always inherit color from their container via CSS.
    StyleExamples
        StyleExample(v-for="name in normalIconNames" :key="name")
            .icon
                SvgImage(:name="name")
            .name {{ name }}
    StyleDescription
        | Colored icons are special icons that use multiple fixed colors in the SVG definition
        | and do not inherit their colors via CSS.
    StyleExamples
        StyleExample(v-for="name in coloredIconNames" :key="name")
            .icon
                SvgImage(:name="name")
            .name {{ name }}
</template>
<script setup lang="ts">

const imagesStore = useImagesStore();

const iconNames = computed(() => Object.keys(imagesStore.svg));

const normalIconNames = computed(() => {
    return iconNames.value.filter(name => !name.startsWith("colored/"));
});

const coloredIconNames = computed(() => {
    return iconNames.value.filter(name => name.startsWith("colored/"));
});


</script>
<style scoped lang="scss">
section {
    .examples {
        flex-wrap: wrap;
        row-gap: 0;

        .example {
            display: flex;

            .icon {
                width: steps(4);
                height: steps(4);

                :deep(.svg) {
                    width: steps(2);
                    height: steps(2);
                }
            }
        }
    }
}
</style>
