<template lang="pug">
MainSecondaryHeaderMenu(:links="links")
</template>
<script setup lang="ts">
const { t } = useI18n();

const links = computed(() => {
    return [
        {
            to: { name: "self-billing-orders" },
            icon: null,
            text: t("navigation.pages.self_billing.Self billing orders")
        },
    ];
});

</script>
<style scoped lang="scss"></style>
