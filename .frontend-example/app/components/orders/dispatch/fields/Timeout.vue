<template lang="pug">
FormInputField(
    v-model="form.timeoutInMinutes"
    name="timeout"
    size="large"
    type="integer"
    :errors="errors"
    :label="$t('orders.dispatch.fields.Timeout (minutes)')"
)
</template>
<script setup lang="ts">

const dispatchStore = useOrdersDispatchStore();
const { form } = storeToRefs(dispatchStore);

const errors = computed(() => form.value.errors.forField("rollback_interval"));

</script>
<style scoped lang="scss"></style>
