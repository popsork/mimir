<template lang="pug">
.tab-selector(ref="selector")
    InvoicingProcessTab(v-for="tab in tabs" :key="tab.name" :name="tab.name")
        template(v-slot:title) {{ tab.title }}
</template>
<script setup lang="ts">

useElementHeightTracking("invoicingProcessTabSelector", useTemplateRef("selector"));

const { t } = useI18n();

const tabs = computed(() => {
    return Object.values(InvoicingProcessTabName).map((tabName) => {
        const humanReadableName = capitalizeFirstLetter(humanize(tabName));

        return {
            name: tabName,
            title: t(`invoicing.process.sections.${humanReadableName}`)
        };
    });
});

</script>
<style scoped lang="scss">
.tab-selector {
    position: relative;
    display: flex;
    gap: steps(0.5);

    margin: 0 $gutter;
    padding-top: steps(2);

    border-bottom: 2px solid $color-border-light;

    .tab {
        margin-bottom: -2px; // make the tabs overlap the bottom border line
        flex: 0 0 steps(25);

        white-space: nowrap;
    }
}
</style>
