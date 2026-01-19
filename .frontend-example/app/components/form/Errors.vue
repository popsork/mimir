<template lang="pug">
.errors(v-if="errors && errors.length > 0")
    FormError(v-for="error in errors" :key="error.id || error.message" :message="error.message")
</template>
<script setup lang="ts">
defineProps<{
    errors: FormFieldError[] | undefined,
}>();

</script>
<style scoped lang="scss"></style>
