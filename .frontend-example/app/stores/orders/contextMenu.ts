import type { DataTableColumn } from "naive-ui";

export const useOrdersContextMenuStore = defineStore("orders-context-menu", () => {

    type Position = {
        x: number,
        y: number,
    };

    type Context = {
        row: TableRow | null,
        column: DataTableColumn | null,
    };

    const getDefaultValues = () => {
        return {
            visible: false as boolean,
            position: { x: 0, y: 0 } as Position,
            context: {
                row: null,
                column: null,
            } as Context,
        };
    };

    const state = ref(getDefaultValues());

    const open = ({ position, context }: { position: Position, context: Context }) => {
        state.value.visible = true;
        state.value.position = position;
        state.value.context = context;
    };

    const close = () => {
        state.value = getDefaultValues();
    };

    return {
        state,
        open,
        close
    };

});



