<template lang="pug">
StyleSection(title="Files fields")
    StyleDescription
        | These fields allow uploading multiple files and consist of a button to open the upload dialog
        | and, if there are files already uploaded, a button showing the number of existing files
        | that opens the gallery dialog for managing the files.

    StyleExamples
        StyleExample
            FormFilesField(
                v-model="files"
                name="images"
                label="Files"
                gallery-dialog-title="Gallery dialog title"
            )

    StyleDescription
        | Labels can be hidden with `:label-visible="false"`.

    StyleExamples
        StyleExample
            FormFilesField(
                v-model="files"
                name="images"
                label="Files"
                :label-visible="false"
                gallery-dialog-title="Gallery dialog title"
            )


</template>
<script setup lang="ts">
import type { FileModel } from "~/models/FileModel";


const files = ref([]) as Ref<FileModel[]>;

</script>
<style scoped lang="scss"></style>
