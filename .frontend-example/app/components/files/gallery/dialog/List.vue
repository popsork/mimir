<template lang="pug">
ul.gallery(ref="list")
    li(v-for="(file, index) in files" :key="file.id" :class="{ selected: index === selectedFileIndex }")
        label
            input(v-model="selectedFileIndex" type="radio" name="selectedFile" :value="index")
            span {{ file.name }}
        .actions
            GenericButton(
                type="ghost"
                size="small"
                icon="trash-can"
                :title="$t('files.actions.Remove file')"
                v-on:click="remove(index)"
            )
    li.add
        button(
            type="button"
            v-on:click="add"
        )
            SvgImage(class="icon" name="plus")
            span.text {{ $t("files.actions.Add files") }}
</template>
<script setup lang="ts">
import type { FileModel } from "~/models/FileModel";

defineProps<{
    files: FileModel[],
}>();

const selectedFileIndex = defineModel<number | null>();

const list = useTemplateRef("list");

const ensureSelectedFileVisibility = async () => {
    await nextTick();
    // scroll the container so that the selected item is visible
    if (!list.value || typeof selectedFileIndex.value !== "number") {
        return;
    }
    const selectedItemNode = list.value.children[selectedFileIndex.value];
    if (!selectedItemNode) {
        return;
    }
    selectedItemNode.scrollIntoView({ behavior: "smooth", inline: "center" });
};

onMounted(() => {
    ensureSelectedFileVisibility();
});
watch(selectedFileIndex, () => {
    ensureSelectedFileVisibility();
});



const emit = defineEmits<{
    (e: "remove", index: number): void,
    (e: "add"): void,
}>();

const add = () => {
    emit("add");
};

const remove = (index: number) => {
    emit("remove", index);
};

</script>
<style scoped lang="scss">
.gallery {
    @include flex-list;
    gap: steps(2);
    padding: steps(1);
    margin: steps(1) steps(-1);
    overflow-x: auto;

    $item-padding: steps(1);

    li {
        flex: 0 0 steps(15);
        width: steps(15);
        height: steps(15);

        overflow: hidden;
        position: relative;
        background: $color-background-light;
        border-radius: $element-border-radius;

        &.selected {
            outline: 2px solid $color-border-active;
        }

        label {
            flex: 0 0 100%;

            display: flex;
            align-items: flex-start;
            justify-content: flex-start;

            max-width: 100%;
            height: 100%;
            padding: $item-padding;
            overflow: hidden;

            @include clickable-button;
            @include word-break;

            input {
                @include visually-hidden;
            }

        }

        .actions {
            position: absolute;
            bottom: $item-padding;
            right: $item-padding;
        }

        &.add {
            button {
                position: absolute;
                inset: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                @include clickable-button;
                @include large-medium-text;

                &:deep(.icon) {
                    &,
                    svg {
                        width: steps(4);
                        height: steps(4);
                    }
                }
            }
        }
    }
}
</style>
