<template lang="pug">
.prime-vue-style-fix
    PrimeDatePicker(inline)
</template>
<script setup lang="ts">
</script>
<style scoped lang="scss">
.prime-vue-style-fix {
    // there is a problem somewhere related to nuxt + primevue
    // that causes primevue styles to not be completely loaded in certain cases.

    // specifically, when the date picker is used, primevue normally adds this to <head>:
    // <style type="text/css" data-primevue-style-id="datepicker-style">
    // but, apparently, sometimes it does not detect that the date picker is being used.

    // adding the PrimeDatePicker component to the main app.vue
    // so that it is always invisibly present in each page (outside of NuxtLayout) seems to help

    // this workaround file should be removed once the issue gets resolved.

    // steps to reproduce for checking whether the issue is still present:

    // 1. remove the PrimeDatePicker component in the template above
    // 2. open a blank browser tab
    // 3. paste an URL to order form of an existing order and a specific tab, e.g.:
    //   /orders/84ed2842-efb8-357c-9a1f-65fe5129eae6/transport
    // 4. click on a date field in the form, e.g. "Planned pickup"
    // 5. the date picker opens but its styles are broken / missing

    // but if the same page gets opened without the tab part
    // /orders/84ed2842-efb8-357c-9a1f-65fe5129eae6
    // and the middleware redirects to the same transport tab,
    // then the date picker styles are loaded correctly.

    display: none;
}
</style>
