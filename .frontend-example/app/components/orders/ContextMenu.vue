<template lang="pug">
PopoverMenu(
    placement="bottom-start"
    trigger="manual"
    :x="state.position.x"
    :y="state.position.y"
    :show="state.visible"
    :on-clickoutside="handleClickOutside"
)
    PopoverMenuButton(
        v-if="canUngroup"
        :text="$t('orders.context_menu.Ungroup')"
        v-on:click="handleUngroup"
    )
    PopoverMenuButton(
        v-if="canFilter && !hasFilterOnCurrentValue"
        :text="$t('orders.context_menu.Filter on', { text: clampedCellText })"
        v-on:click="handleFilter"
    )
    PopoverMenuButton(
        v-if="canFilter && !hasFilterOnCurrentValue"
        :text="$t('orders.context_menu.Filter out', { text: clampedCellText })"
        v-on:click="handleFilterOut"
    )
    PopoverMenuButton(
        v-if="canFilter && hasFilterOnCurrentValue"
        :text="$t('orders.context_menu.Remove filter', { text: clampedCellText })"
        v-on:click="handleRemoveFilter"
    )
    PopoverMenuButton(
        v-if="canFilter"
        :text="$t('orders.context_menu.Reset filters')"
        v-on:click="handleResetFilters"
    )
    PopoverMenuButton(
        v-if="canGroup"
        :text="$t('orders.context_menu.Group on', { text: headerText })"
        v-on:click="handleGroup"
    )
    PopoverMenuButton(
        v-if="orderId"
        :text="$t('orders.context_menu.Edit order')"
        :to="getOrderEditingRoute(orderId)"
        v-on:click="close"
    )
    PopoverMenuButton(
        v-if="selectedRowIds.length"
        :text="$t('orders.context_menu.Show on the map')"
        v-on:click="buildAndOpenNewRoute"
    )
    PopoverMenuButton(
        v-if="selectedRowIds.length"
        :text="$t('orders.context_menu.Add to a route')"
        v-on:click="handleAddToRoute"
    )
</template>
<script setup lang="ts">
import type { DataTableBaseColumn } from "naive-ui";
import type { RowKey } from "naive-ui/lib/data-table/src/interface";

const MAX_CELL_TEXT_LENGTH = 30;

const store = useOrdersContextMenuStore();
const { state } = storeToRefs(store);
const addToRouteStore = useOrdersAddToRouteStore();

type TableViewsStore = ReturnType<ReturnType<typeof defineTableViewsStore>>;
type TableStore = ReturnType<ReturnType<typeof defineTableStore<any, any>>>;

const props = withDefaults(defineProps<{
    tableViewsStore: TableViewsStore,
    tableStore: TableStore,
    rowOrderIdAttribute: string,
    selectedRowIds?: RowKey[],
    editOrderDefaultTabName: OrderFormTabName,
}>(), {
    selectedRowIds: () => [] as RowKey[]
});

const orderId = computed(() => {
    const row = state.value.context.row;
    if (!row) {
        return null;
    }
    return row[props.rowOrderIdAttribute];
});

const getOrderEditingRoute = (orderId: string) => {
    return getOrderRoute({ id: orderId, tab: props.editOrderDefaultTabName });
};

const { groupBy } = storeToRefs(props.tableStore);
const { selectedView } = storeToRefs(props.tableViewsStore);

const columnKey = computed(() => (state.value.context.column as DataTableBaseColumn)?.key as string || "");
const columnDefinition = computed(() => props.tableStore.rowDefinition[columnKey.value]);
const columnValue = computed(() => {
    if (!state.value.context.row) {
        return "";
    }

    return state.value.context.row[columnKey.value] || "";
});

const filterValue = computed(() => {
    if (!columnDefinition.value) {
        return columnValue.value;
    }

    return formatTableColumnFilterValue(columnValue.value, columnDefinition.value);
});

const canUngroup = computed(() => !!groupBy.value);
const canFilter = computed(() => columnKey.value);
const canGroup = computed(() => canFilter.value && (groupBy.value !== columnKey.value));

const cellText = computed(() => {
    if (!state.value.context.row) {
        return "";
    }

    const column = (state.value.context.column as DataTableBaseColumn);

    //
    // Special case for date, here we only show the actual filter value
    // (which should be yyyy-MM-dd) instead of letting it be rendered
    // by the table column renderer. This is because the filter only
    // works on date strings (and not times), and it would be confusing
    // for the user if the displayed value contained times when it cannot
    // filter on it.
    if (columnDefinition.value && columnDefinition.value.type === "date") {
        return filterValue.value;
    }

    if (column.render) {
        //
        // The second argument in the render call is "rowId" and is required
        // by the naive-ui definition for the render function. Using -1 just as
        // a placeholder as it is not used anywhere in the render functions
        // we currently have (and we don't have the rowIndex anyway)
        const renderedCellText = column.render(state.value.context.row, -1);
        if (typeof renderedCellText === "string") {
            return renderedCellText;
        }
    }

    return columnValue.value;
});

const headerText = computed(() => (state.value.context.column as DataTableBaseColumn)?.title || "");
const clampedCellText = computed(() => {
    if (cellText.value.length < MAX_CELL_TEXT_LENGTH) {
        return cellText.value;
    }

    return cellText.value.substring(0, MAX_CELL_TEXT_LENGTH - 3) + "...";
});

const routeSettingsStore = useRouteSettingsStore();
const routeFormStore = useRouteFormStore();
const routeFormRouteStopsStore = useRouteFormRouteStopsStore();

const selectedRowIds = computed(() => (props.selectedRowIds || []) as OrderRow["id"][]);

const buildAndOpenNewRoute = async () => {
    if (!selectedRowIds.value.length) {
        return;
    }

    await routeSettingsStore.loadRouteSettingsIfNeeded();
    routeFormStore.reset();

    selectedRowIds.value.forEach((rowId) => {
        routeFormRouteStopsStore.addRouteStopsFromOrderRowId(rowId);
    });

    goToRoute({ name: "routes-new" });
};

const hasFilterOnCurrentValue = computed(() => {
    if (!selectedView.value) {
        return false;
    }

    return selectedView.value.config.filters.groups.some(group => group.conditions.some(condition => condition.key === columnKey.value && condition.value === cellText.value));
});

const handleClickOutside = (e: MouseEvent) => {
    if (e.button !== 0) {
        return;
    }

    close();
};

const close = () => {
    store.close();
};

const handleUngroup = () => {
    groupBy.value = null;
    close();
};

const handleAddToRoute = () => {
    addToRouteStore.initializeDialog(selectedRowIds.value);
    close();
};

const addViewColumnFilterCondition = (operator: FilterComparisonOperator) => {
    if (!selectedView.value) {
        return;
    }

    props.tableViewsStore.updateViewFilters([
        ...selectedView.value.config.filters.groups,
        {
            conditions: [
                {
                    key: columnKey.value,
                    value: filterValue.value,
                    operator: operator,
                },
            ],
            operator: null
        },
    ]);
};

const isConsideredEmpty = (value:string | null) => value === null || value.trim() === "";

const handleFilterOut = () => {
    const operator = isConsideredEmpty(filterValue.value) ? FilterComparisonOperator.NotBlank : FilterComparisonOperator.NotEquals;
    addViewColumnFilterCondition(operator);
    close();
};

const handleFilter = () => {
    const operator = isConsideredEmpty(filterValue.value) ? FilterComparisonOperator.Blank : FilterComparisonOperator.Equals;
    addViewColumnFilterCondition(operator);
    close();
};

const handleRemoveFilter = () => {
    if (!selectedView.value) {
        return;
    }

    props.tableViewsStore.updateViewFilters(
        selectedView.value.config.filters.groups.map(group => ({
            ...group,
            conditions: group.conditions.filter(condition => condition.key !== columnKey.value)
        }))
    );

    close();
};

const handleResetFilters = () => {
    if (!selectedView.value) {
        return;
    }

    props.tableViewsStore.resetViewFilters();
    close();
};

const handleGroup = () => {
    groupBy.value = columnKey.value;
    close();
};
</script>
<style scoped lang="scss"></style>
