<template lang="pug">
ModalDialog(v-if="shouldShowGalleryDialog" :title="title" v-on:cancel="close")
    GenericForm(id="gallery" v-on:submit.prevent="apply")
        FilesGalleryDialogPreview(:file="selectedGalleryFile")
        FilesGalleryDialogList(
            v-model="selectedGalleryFileIndex"
            :files="galleryFiles"
            v-on:add="openUploadDialog({ returnToGalleryOnCancel: true })"
            v-on:remove="removeGalleryFileByIndex($event)"
        )
    template(v-slot:actions)
        GenericButton(
            type="ghost"
            v-on:click="close"
        ) {{ t("general.Cancel") }}
        GenericButton(
            type="primary"
            button-type="submit"
            form="gallery"
        ) {{ $t("general.Apply") }}
FilesUploadDialog(
    v-if="shouldShowUploadDialog"
    ref="uploadDialog"
    :multiple-files="true"
    v-on:close="handleUploadDialogClosing"
)
</template>
<script setup lang="ts">
import type { FileModel } from "~/models/FileModel";

defineProps<{
    title: string,
}>();

const { t } = useI18n();

const displayableDialogType = ref(null as "gallery" | "upload" | null);

const shouldShowGalleryDialog = computed(() => {
    return displayableDialogType.value === "gallery";
});

const shouldShowUploadDialog = computed(() => {
    return displayableDialogType.value === "upload";
});

const files = defineModel<FileModel[]>();

// use a separate array internally so that the v-model binding is not affected until user clicks "Apply"
const galleryFiles = ref([]) as Ref<FileModel[]>;


const selectedGalleryFileIndex = ref<number | null>(null);

const selectedGalleryFile = computed(() => {
    if (selectedGalleryFileIndex.value === null) {
        return null;
    }
    return galleryFiles.value[selectedGalleryFileIndex.value] as FileModel || null;
});

const open = async () => {
    displayableDialogType.value = "gallery";
    if (files.value) {
        galleryFiles.value = [...files.value];
    }
    fixSelectedGalleryFileIndex();
};

const fixSelectedGalleryFileIndex = () => {
    if (galleryFiles.value.length < 1) {
        selectedGalleryFileIndex.value = null;
        return;
    }

    if (selectedGalleryFileIndex.value === null) {
        // if nothing is selected, select first item
        selectedGalleryFileIndex.value = 0;
    }

    if (selectedGalleryFileIndex.value >= galleryFiles.value.length) {
        // if selected index is out of bounds, select last item
        selectedGalleryFileIndex.value = galleryFiles.value.length - 1;
    }
};

const removeGalleryFileByIndex = (index: number) => {
    galleryFiles.value.splice(index, 1);
    fixSelectedGalleryFileIndex();
};


const close = () => {
    displayableDialogType.value = null;
};

const apply = () => {
    files.value = galleryFiles.value as FileModel[];
    close();
};



const uploadDialog = useTemplateRef("uploadDialog");

const shouldReturnToGalleryOnUploadDialogCancel = ref(true);

const openUploadDialog = async ({ returnToGalleryOnCancel }: { returnToGalleryOnCancel: boolean }) => {
    shouldReturnToGalleryOnUploadDialogCancel.value = returnToGalleryOnCancel;
    displayableDialogType.value = "upload";
    await nextTick();
    if (uploadDialog.value) {
        uploadDialog.value.open();
    }
};

const handleUploadDialogClosing = ({ confirmed, files }: { confirmed: boolean, files: FileModel[] }) => {
    if (confirmed) {
        galleryFiles.value.push(...files);
        if (files.length > 0) {
            // select last added file
            selectedGalleryFileIndex.value = galleryFiles.value.length - 1;
        }
    }

    if (confirmed || shouldReturnToGalleryOnUploadDialogCancel.value) {
        displayableDialogType.value = "gallery";
        return;
    }
    close();
};

defineExpose({
    open,
    openUploadDialog
});

</script>
<style scoped lang="scss">
form {
    width: steps(120);
}
</style>
