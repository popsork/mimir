<template lang="pug">
.tools
    GenericButton(
        type="tertiary"
        size="small"
        :disabled="!canSave"
        :waiting-for="WaitingFor.ViewSave"
        v-on:click="saveCurrentView"
    ) {{ $t("views.actions.Save view") }}
    GenericButton(
        type="tertiary"
        size="small"
        :disabled="!hasActiveView || !currentViewIsDirty"
        :waiting-for="WaitingFor.ViewRevert"
        v-on:click="revertCurrentView"
    ) {{ $t("views.actions.Revert changes") }}
    ViewsHeaderSaveAsNewControl(v-if="props.currentView" :view="props.currentView" v-on:saved="redirectToSavedView")
    GenericButton(
        v-for="tool in visibleTools"
        :key="tool.icon"
        :type="tool.selected ? 'primary' : 'ghost'"
        size="small"
        :icon="tool.icon"
        :title="tool.title"
        :disabled="tool.disabled"
        v-on:click="tool.onClick"
    )
</template>
<script setup lang="ts">
import type { View, ViewConfig } from "~/models/View";
import { ViewTool } from "~/enums/ViewTool";

const { t } = useI18n();
const viewsStore = useViewsStore();

const emit = defineEmits<{
    (e: "saved", view: View<ViewConfig>, created: boolean): void,
    (e: "reverted", view: View<ViewConfig>): void,
    (e: "save-failed", view: View<ViewConfig>): void,
}>();

const props = defineProps<{
    currentView: View<ViewConfig> | null,
    tools: ViewTool[],
}>();

const activeTool = defineModel<ViewTool | null>("activeTool");

const detailsSidebarStore = useOrdersDetailsSidebarStore();
const { selectedOrderRowId } = storeToRefs(detailsSidebarStore);

const hasActiveView = computed(() => !!props.currentView);
const canSave = computed(() => hasActiveView.value && !props.currentView?.isReadonly);
const currentViewIsDirty = computed(() => props.currentView?.isDirty);

//
// If the current active view is a temporary view, there is
// no reason to allow the user to open the settings for this view
// if the user wants to do that, they can save the view as a new view
// and edit that.
const canOpenSettings = computed(() => hasActiveView.value && props.currentView?.type !== ViewType.Temporary);

const setActiveTool = (tool: ViewTool) => {
    if (activeTool.value === tool) {
        activeTool.value = null;
        return;
    }

    activeTool.value = tool;
};

const visibleTools = computed(() => {
    return [
        {
            icon: "cog",
            title: t("views.tools.Settings"),
            disabled: !canOpenSettings.value,
            tool: ViewTool.ViewSettings,
            selected: activeTool.value === ViewTool.ViewSettings,
            onClick() {
                setActiveTool(ViewTool.ViewSettings);
            },
        },
        {
            icon: "funnel",
            title: t("views.tools.Filter"),
            tool: ViewTool.Filters,
            selected: activeTool.value === ViewTool.Filters,
            disabled: !hasActiveView.value,
            onClick() {
                setActiveTool(ViewTool.Filters);
            },
        },
        {
            icon: "columns",
            title: t("views.tools.Columns"),
            tool: ViewTool.Columns,
            selected: activeTool.value === ViewTool.Columns,
            disabled: !hasActiveView.value,
            onClick() {
                setActiveTool(ViewTool.Columns);
            }
        },
        {
            icon: "dock",
            title: t("views.tools.Details"),
            tool: ViewTool.Details,
            selected: activeTool.value === ViewTool.Details,
            disabled: selectedOrderRowId.value === null,
            onClick() {
                setActiveTool(ViewTool.Details);
            }
        }
    ].filter(t => props.tools.includes(t.tool));
});

const saveCurrentView = async () => {
    if (!props.currentView) {
        return;
    }

    if (!await viewsStore.saveView(props.currentView)) {
        emit("save-failed", props.currentView);
        return;
    }

    emit("saved", props.currentView, false);
};

const revertCurrentView = async () => {
    if (!props.currentView) {
        return;
    }

    await viewsStore.revertView(props.currentView.id);
    emit("reverted", props.currentView);
};

const redirectToSavedView = (view: View<ViewConfig>) => {
    emit("saved", view, true);
};

</script>
<style scoped lang="scss">
.tools {
    display: flex;
    align-items: center;
    gap: steps(0.5);
}
</style>
