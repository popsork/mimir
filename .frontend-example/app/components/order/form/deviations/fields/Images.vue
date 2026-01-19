<template lang="pug">
FormFilesField(
    v-model="files"
    name="images"
    :label="$t('deviation_rows.fields.Images')"
    :label-visible="deviationRowIndex === 0"
    :gallery-dialog-title="$t('deviation_rows.fields.Images')"
)
</template>
<script setup lang="ts">
import type { FileModel } from "~/models/FileModel";

const props = defineProps<{
    deviationRowIndex: number,
}>();

const { getDeviationRow } = useOrderFormDeviationRowAccessor(() => props.deviationRowIndex);

const files = computed({
    get: () => {
        const record = getDeviationRow();
        if (!record || !record.files) {
            return [];
        }

        return record.files;
    },
    set: (value: FileModel[]) => {
        const record = getDeviationRow();
        if (!record) {
            return;
        }
        record.files = value;
    }
});

</script>
<style scoped lang="scss"></style>
