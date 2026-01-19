<template lang="pug">
FormDateField(
    v-model="form.dispatchDateTime"
    type="datetime"
    size="large"
    :label="$t('orders.dispatch.fields.Schedule dispatch at earliest')"
    name="dispatch_at"
    container-mode="modal-dialog"
    :errors="errors"
    :min-date="minDate"
)
    template(v-slot:description)
        span.text {{ $t("orders.dispatch.fields.Dispatch is done when unit is active") }}
</template>
<script setup lang="ts">
const dispatchStore = useOrdersDispatchStore();
const { form } = storeToRefs(dispatchStore);

const errors = computed(() => form.value.errors.forField("execute_at"));

const minDate = getUtcDatetimeString(new Date());
</script>
<style scoped lang="scss"></style>
