<template lang="pug">
.example(:data-width="width")
    slot
</template>
<script setup lang="ts">

withDefaults(defineProps<{
    width?: "normal" | "narrow",
}>(), {
    width: "normal"
});

</script>
<style scoped lang="scss">
.example {
    flex: 0 0 steps(32);
    width: steps(32);

    &[data-width="narrow"] {
        flex-basis: steps(12);
        width: steps(12);
    }
}
</style>
