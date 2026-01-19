<template lang="pug">
ModalDialog(v-if="shouldShowDialog" :title="headingText" v-on:cancel="close({ confirmed: false })")
    GenericForm(id="file-upload" v-on:submit.prevent="confirm")
        NUpload(
            :multiple="multipleFiles"
            :custom-request="uploadFile"
            :on-remove="handleFileRemoval"
            :disabled="!isUploadingAllowed"
        )
            NUploadDragger(v-if="isUploadingAllowed")
                p.dragger-message {{ draggerMessageText }}
    template(v-slot:actions)
        GenericButton(
            type="ghost"
            v-on:click="close"
        ) {{ t("general.Cancel") }}
        GenericButton(
            type="primary"
            button-type="submit"
            form="file-upload"
            :waiting="waitingForAnyUpload"
            :disabled="!isConfirmationAllowed"
        ) {{ $t("general.Confirm") }}
</template>
<script setup lang="ts">
import type { UploadCustomRequestOptions, UploadOnRemove } from "naive-ui";
import type { FileModel } from "~/models/FileModel";

const props = defineProps<{
    multipleFiles: boolean,
}>();

const { t } = useI18n();

const headingText = computed(() => {
    return props.multipleFiles ? t("files.headings.Add files") : t("files.headings.Add file");
});

const draggerMessageText = computed(() => {
    return props.multipleFiles
        ? t("files.messages.Click or drag files to this area to upload")
        : t("files.messages.Click or drag a file to this area to upload");
});

const shouldShowDialog = ref(false);

const uploadStore = useFilesUploadStore();
const { waitingForAnyUpload, fileRecordsByUploadIdentifier } = storeToRefs(uploadStore);

const numberOfUploadedFiles = computed(() => {
    return fileRecordsByUploadIdentifier.value.size;
});

const numberOfFilesInProgress = ref(0);

const numberOfFiles = computed(() => {
    return numberOfUploadedFiles.value + numberOfFilesInProgress.value;
});

const isUploadingAllowed = computed(() => {
    if (props.multipleFiles) {
        return true;
    }

    return numberOfFiles.value === 0;
});

const isConfirmationAllowed = computed(() => {
    if (numberOfUploadedFiles.value === 0) {
        return false;
    }

    if (waitingForAnyUpload.value) {
        return false;
    }
    return true;
});

const open = () => {
    uploadStore.reset();
    shouldShowDialog.value = true;
};

const emit = defineEmits<{
    (e: "close", { confirmed, files }: { confirmed: boolean, files: FileModel[] }): void,
}>();

const close = ({ confirmed, files }: { confirmed?: boolean, files?: FileModel[] } = {}) => {
    shouldShowDialog.value = false;
    uploadStore.reset();
    if (confirmed === undefined) {
        confirmed = false;
    }
    if (files === undefined) {
        files = [];
    }
    emit("close", { confirmed, files });
};

const confirm = () => {
    const fileRecords = [...fileRecordsByUploadIdentifier.value.values()] as FileModel[];
    close({ confirmed: true, files: fileRecords });
};

const uploadFile = async (options: UploadCustomRequestOptions) => {
    const file = options.file.file;
    if (!file) {
        return;
    }

    try {
        numberOfFilesInProgress.value += 1;
        const uploadIdentifier = options.file.id;
        let uploadOk = false;
        try {
            uploadOk = await uploadStore.performUpload({
                uploadIdentifier,
                file,
                progressCallback: options.onProgress
            });
        } catch (error) {
            options.onError();
            throw error;
        }

        if (uploadOk) {
            options.onFinish();
        } else {
            // if this gets called because an upload was cancelled mid-way,
            // this error callback will call console.error from naive-ui, but that cannot be helped currently
            options.onError();
        }
    } finally {
        numberOfFilesInProgress.value -= 1;
    }
};

const handleFileRemoval: UploadOnRemove = ({ file }) => {
    const uploadIdentifier = file.id;
    uploadStore.cancelUploadIfInProgress(uploadIdentifier);
    if (fileRecordsByUploadIdentifier.value.has(uploadIdentifier)) {
        fileRecordsByUploadIdentifier.value.delete(uploadIdentifier);
    }
};

defineExpose({
    open,
    close
});

</script>
<style scoped lang="scss">
form {
    width: steps(60);

    .dragger-message {
        @include large-medium-text;
        color: $color-text-lightest;
    }

    &:deep(.n-upload) {

        .n-upload-dragger {
            height: steps(20);
            display: flex;
            justify-content: center;
            align-items: center;
            padding: steps(1) steps(3);
        }

        .n-upload-file-list {
            $item-height: steps(6);
            $item-gap: steps(0.5);

            $max-items-visible-in-list: 3;

            display: grid;
            gap: $item-gap;
            max-height: ($item-height * $max-items-visible-in-list) + ($item-gap * ($max-items-visible-in-list - 1));
            overflow-y: auto;

            .n-upload-file {
                height: $item-height;

                /* stylelint-disable selector-class-pattern */
                &.n-upload-file--success-status {
                    background: $color-background-success;
                }
                &.n-upload-file--error-status {
                    background: $color-background-error;
                }
                /* stylelint-enable selector-class-pattern */

                .n-upload-file-info {
                    padding-top: 0;
                    padding-bottom: 0;
                }
            }
        }
    }
}
</style>
