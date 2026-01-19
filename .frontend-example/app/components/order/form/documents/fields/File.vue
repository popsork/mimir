<template lang="pug">
FormCustomField(
    name="file"
    :label="$t('documents.fields.File')"
    :label-visible="documentIndex === 0"
)
    .content
        .existing-file(v-if="file")
            .info
                a(
                    v-if="file.url && file.name"
                    :href="file.url"
                    target="_blank"
                    rel="noopener"
                    :title="file.name"
                ) {{ file.name }}
            .actions
                GenericButton(
                    data-name="upload-trigger"
                    type="alternative-ghost"
                    icon="cross"
                    size="small"
                    :title="$t('files.actions.Remove file')"
                    v-on:click="removeFile"
                )
        template(v-else)
            GenericButton(
                data-name="upload-trigger"
                type="alternative-ghost"
                icon="plus-circled"
                size="small"
                v-on:click="openUploadDialog"
            ) {{ $t('files.actions.Upload') }}
    FilesUploadDialog(
        v-if="shouldShowUploadDialog"
        ref="uploadDialog"
        :multiple-files="false"
        v-on:close="handleUploadDialogClosing"
    )
</template>
<script setup lang="ts">
import type { FileModel } from "~/models/FileModel";

const props = defineProps<{
    documentIndex: number,
}>();

const { getDocument } = useOrderFormDocumentAccessor(() => props.documentIndex);

const { recalculateOrder } = useOrderFormStore();

const file = computed(() => getDocument()?.file ?? null);

const shouldShowUploadDialog = ref(false);

const uploadDialog = useTemplateRef("uploadDialog");

const openUploadDialog = async () => {
    shouldShowUploadDialog.value = true;

    await nextTick();
    if (uploadDialog.value) {
        uploadDialog.value.open();
    }
};


const handleUploadDialogClosing = ({ confirmed, files }: { confirmed: boolean, files: FileModel[] }) => {
    const document = getDocument();
    if (!document) {
        return;
    }

    const documentNameIsBlank = document.name === null || document.name.trim() === "";
    const documentNameMatchesPreviousFileName = document.file && document.name === document.file.name;

    const shouldSetDocumentName = documentNameIsBlank || documentNameMatchesPreviousFileName;

    if (confirmed && files[0]) {
        document.fileId = files[0].id;
        document.file = files[0];
        if (shouldSetDocumentName) {
            document.name = files[0].name;
        }
        recalculateOrder();
    }
};

const removeFile = () => {
    const document = getDocument();
    if (!document) {
        return;
    }

    const shouldClearDocumentName = document.name === document.file?.name;

    document.fileId = null;
    document.file = null;
    if (shouldClearDocumentName) {
        document.name = null;
    }

    recalculateOrder();
};

</script>
<style scoped lang="scss">
.field {

    .existing-file {
        display: flex;
        align-items: center;
        gap: steps(1);

        .info {
            @include word-clip;
            max-width: steps(50);
        }

    }
}
</style>
