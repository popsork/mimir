<template lang="pug">
FormFilesField(
    v-model="files"
    name="images"
    :label="$t('specification_rows.fields.Images')"
    :label-visible="specificationRowIndex === 0"
    :gallery-dialog-title="$t('specification_rows.fields.Images')"
)
</template>
<script setup lang="ts">
import type { FileModel } from "~/models/FileModel";

const props = defineProps<{
    specificationRowIndex: number,
}>();

const { getSpecificationRow } = useOrderFormSpecificationRowAccessor(() => props.specificationRowIndex);

const files = computed({
    get: () => {
        const record = getSpecificationRow();
        if (!record || !record.files) {
            return [];
        }

        return record.files;
    },
    set: (value: FileModel[]) => {
        const record = getSpecificationRow();
        if (!record) {
            return;
        }
        record.files = value;
    }
});

</script>
<style scoped lang="scss"></style>
