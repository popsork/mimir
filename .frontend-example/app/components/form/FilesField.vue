<template lang="pug">
FormCustomField(
    :name="name"
    :label="label"
    :label-visible="labelVisible"
)
    .content
        button(
            v-if="files && files.length > 0"
            type="button"
            data-name="gallery-trigger"
            v-on:click="openGalleryDialog"
        )
            SvgImage(class="icon" name="images")
            span.number {{ files.length }}
        GenericButton(
            data-name="upload-trigger"
            type="alternative-ghost"
            icon="plus-circled"
            size="small"
            v-on:click="openUploadDialog"
        ) {{ $t('general.Add') }}
    FilesGalleryDialog(
        ref="galleryDialog"
        v-model="files"
        :title="galleryDialogTitle"
    )
</template>
<script setup lang="ts">
import type { FileModel } from "~/models/FileModel";

withDefaults(defineProps<{
    name?: string,
    label?: string,
    labelVisible?: boolean,
    galleryDialogTitle: string,
}>(), {
    labelVisible: true,
});

const files = defineModel<FileModel[]>();


const galleryDialog = useTemplateRef("galleryDialog");

const openGalleryDialog = () => {
    if (!galleryDialog.value) {
        return;
    }
    galleryDialog.value.open();
};

const openUploadDialog = () => {
    if (!galleryDialog.value) {
        return;
    }
    galleryDialog.value.openUploadDialog({ returnToGalleryOnCancel: false });
};

</script>
<style scoped lang="scss">
.field {
    .content {
        display: flex;

        [data-name="gallery-trigger"] {
            display: flex;
            height: steps(3);
            gap: steps(0.5);
            align-items: center;
            justify-content: flex-start;
            padding: 0 steps(0.5);

            background: $color-background-lightest;
            color: $color-text-lighter;
            border-radius: $element-border-radius-smallest;

            @include clickable-button;

            &:deep(.icon) {
                flex: 0 0 steps(2.5);
                width: steps(2.5);
                height: steps(2.5);
            }

            .number {
                height: steps(2);
                min-width: steps(3.5);
                padding: 0 steps(0.5);

                border-radius: $element-border-radius-smallest;

                background: $color-background-light;

                @include normal-text;
            }
        }
    }

}
</style>
