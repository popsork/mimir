
export type TableColumn = {
    key: string,
    width: number,
    sortable: boolean,
    sorted: boolean,
    sortOrder: "ascend" | "descend" | null,
};
