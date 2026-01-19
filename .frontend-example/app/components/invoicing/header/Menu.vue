<template lang="pug">
MainSecondaryHeaderMenu(:links="links")
</template>
<script setup lang="ts">
const { t } = useI18n();

const links = computed(() => {
    return [
        {
            to: { name: "invoicing-orders" },
            icon: null,
            text: t("navigation.pages.invoicing.Invoiceable orders")
        },
        {
            to: { name: "invoicing-active-processes" },
            icon: null,
            text: t("navigation.pages.invoicing.Active processes")
        },
        {
            to: { name: "invoicing-finished-processes" },
            icon: null,
            text: t("navigation.pages.invoicing.Finished processes")
        }
    ];
});

</script>
<style scoped lang="scss"></style>
