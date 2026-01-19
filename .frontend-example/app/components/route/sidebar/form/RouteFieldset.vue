<template lang="pug">
fieldset(data-name="route")
    .row
        FormInputField(
            v-model="routeRecord.name"
            name="name"
            :label="$t('route.fields.Name')"
            :errors="nameErrors"
        )
        FormDateField(
            v-model="routeRecord.startAt"
            name="date"
            type="datetime"
            :label="$t('route.fields.Date')"
            :errors="startAtErrors"
        )
    .row
        FormCheckboxField(
            v-model="routeRecord.lineOverride"
            :label="$t('route.fields.Line override')"
            name="line-override"
        )
        FormCheckboxField(
            v-model="routeRecord.operationOverride"
            :label="$t('route.fields.Operation override')"
            name="operation-override"
        )
</template>
<script setup lang="ts">

const store = useRouteFormStore();

const { form, routeRecord } = storeToRefs(store);

const nameErrors = computed(() => {
    return form.value.errors.forRecord(routeRecord.value).forFields(["name"]);
});

const startAtErrors = computed(() => {
    return form.value.errors.forRecord(routeRecord.value).forFields(["startAt"]);
});

</script>
<style scoped lang="scss">
fieldset {
    display: flex;
    flex-direction: column;
    gap: steps(1);

    .row {
        display: flex;
        flex-direction: row;
        gap: steps(1);

        div[data-name="name"] {
            flex-basis: 65%;
        }
        div[data-name="date"] {
            flex-basis: 35%;
        }
    }
}
</style>
