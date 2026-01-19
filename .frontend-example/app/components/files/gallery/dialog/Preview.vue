<template lang="pug">
.preview
    template(v-if="file")
        template(v-if="file.isImage() && file.url")
            img(:src="file.url" alt="")
        template(v-else)
            span {{ $t('files.messages.Preview not available') }}
</template>
<script setup lang="ts">
import type { FileModel } from "~/models/FileModel";

defineProps<{
    file: FileModel | null,
}>();

</script>
<style scoped lang="scss">
.preview {
    height: steps(85);
    max-height: 50vh;
    overflow: hidden;
    border: 1px solid $color-border-normal;
    border-radius: $element-border-radius;

    display: flex;
    align-items: center;
    justify-content: center;

    @include normal-heading;
    color: $color-text-lightest;

    img {
        max-width: 100%;
        max-height: 100%;
    }
}
</style>
