<template lang="pug">
.actions
    GenericButton(
        icon="cross"
        size="small"
        :title="$t('filter.Remove filter')"
        type="alternative-ghost"
        v-on:click="$emit('remove')"
    )
</template>
<script setup lang="ts">
defineEmits<{
    (e: "remove"): void,
}>();
</script>
<style scoped lang="scss"></style>
