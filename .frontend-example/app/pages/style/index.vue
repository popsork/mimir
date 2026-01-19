<template lang="pug">
.style.page(:style="{ height: `${availableHeight}px` }")
    StyleIcons
    StyleButtons
    StyleButtonGroups
    StyleSelectFields
    StyleMultiSelectFields
    StyleTextFields
    StyleNumberFields
    StyleDateFields
    StyleDateTimeRangeFields
    StyleTimeFields
    StyleTextareaFields
    StyleReadOnlyFields
    StyleCheckboxFields
    StyleSwitchFields
    StyleRadioFields
    StyleFilesFields
    StylePopoverFields
    StyleCustomFields
    StyleBadges
    StyleTags
    StyleFloatingMessages
    StyleDrawers
</template>
<script setup lang="ts">
definePageMeta({
    anonymousAccess: true,
    authenticatedAccess: true
});


const { height: windowHeight } = useWindowSize({ includeScrollbar: true, type: "inner" });

const { heights } = storeToRefs(useDimensionsStore());

const availableHeight = computed(() => windowHeight.value - heights.value.pageHeader);

usePageTitle({ translation: "pages.titles.Style page" });

</script>
<style scoped lang="scss">
.style.page {
    padding: steps(2);
    background: $color-background-lighter;
    overflow-y: auto;

    padding-bottom: steps(10);

    :deep(section) {
        margin-bottom: steps(7);

        h2.title {
            margin-bottom: steps(2);
        }
    }


}
</style>
