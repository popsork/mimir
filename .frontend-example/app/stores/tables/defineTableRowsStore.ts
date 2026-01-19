import Sylvie from "sylviejs";
import { isAfter } from "date-fns";
import type { CollectionDocumentBase } from "sylviejs/database/collection/collection-document-base";
import type { Collection } from "sylviejs/database/collection/collection";

type RequiredRowProps = {
    id: string,
    updated_at: string | null,
};

export function defineTableRowsStore<RowType extends RequiredRowProps>(
    {
        name, // used for store, sylvie database and collection names,
        waiterName,
        indices,
        fetchRows,
        prepareRowForStorage,
        liveChannelName,
        liveEventNames,
        collectionUpdateThrottleMs,
    }:
    {
        name: string,
        waiterName: WaitingFor,
        indices: (keyof RowType)[],
        fetchRows: () => Promise<Response & { body: NonNullable<Response["body"]> }>,
        prepareRowForStorage: (row: RowType) => RowType,
        liveChannelName: string,
        liveEventNames: {
            updated: string,
            created: string,
            deleted: string,
        },
        collectionUpdateThrottleMs: number,
    }
) {

    type TableRowDocument = RowType & CollectionDocumentBase;
    type PendingChange = [(obj: RowType) => TableRowDocument | boolean, RowType];

    return defineStore(name, () => {
        const waitStore = useWaitStore();
        const { echo } = useEcho();
        const db = new Sylvie(name);
        const rowsLoaded = ref(false);
        const someRowsLoaded = ref(false);
        const collection = shallowRef(
            db.addCollection(
                name,
                {
                    unique: ["id"],
                    indices,
                }
            ) as Collection<TableRowDocument>
        );

        const pendingChanges = [] as PendingChange[];

        const triggerCollectionRefThrottled = useThrottleFn(() => {
            triggerRef(collection);
        }, collectionUpdateThrottleMs, true);

        const applyPendingChanges = () => {
            while (pendingChanges.length > 0) {
                const [applyFn, obj] = pendingChanges.shift()!;
                applyFn(obj);
            }

            triggerCollectionRefThrottled();
        };

        const loadRows = async () => {
            waitStore.start(waiterName);

            try {
                console.time(`[${name}] Load rows`);
                console.time(`[${name}] Initial fetch duration`);
                const response = await fetchRows();

                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");
                console.timeEnd(`[${name}] Initial fetch duration`);
                let buffer = "";
                let itemCount = 0;

                console.log(`[${name}] Starting to import data...`);
                console.time(`[${name}] Total import duration`);

                let isHeaderRow = true;
                let buildRowObject = null as null | ((cells:string[]) => RowType);
                const buildRowObjectGenerator = (headerRow: string[]) => {
                    const cellCount = headerRow.length;
                    return (cells:string[]) => {
                        const obj = {} as RowType;
                        for (let i = 0; i < cellCount; i++) {
                            const key = headerRow[i] as keyof RowType;
                            (obj as any)[key] = cells[i] ?? null;
                        }

                        return obj;
                    };
                };

                const processBufferLine = (line:string) => {
                    if (line.length === 0) {
                        return;
                    }

                    const cells = JSON.parse(line) as string[];
                    if (isHeaderRow) {
                        buildRowObject = buildRowObjectGenerator(cells);
                        isHeaderRow = false;
                        return;
                    }

                    const row = prepareRowForStorage(buildRowObject!(cells));
                    collection.value.insert(row);
                    itemCount++;

                    triggerCollectionRefThrottled();
                };

                someRowsLoaded.value = true;
                while (true) {
                    const { done, value } = await reader.read();

                    if (done) {
                        processBufferLine(buffer.trim());

                        console.timeEnd(`[${name}] Total import duration`);
                        console.timeEnd(`[${name}] Load rows`);
                        console.log(`[${name}] Number of imported documents: ${itemCount}`);

                        applyPendingChanges();
                        rowsLoaded.value = true;

                        break;
                    }

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        processBufferLine(line.trim());
                    }
                }
            } finally {
                waitStore.end(waiterName);
            }
        };

        const updateOrCreateRow = (row: TableRowDocument): TableRowDocument => {
            const existing = collection.value.by("id", row.id) as TableRowDocument | null;
            if (existing) {
                if (existing.updated_at && row.updated_at && isAfter(existing.updated_at, row.updated_at)) {
                    console.warn("Got older object than existing, skipping update...", row);
                    return existing;
                }

                row.$loki = existing.$loki;
                row.meta = existing.meta;
                return collection.value.update(prepareRowForStorage(row));
            } else {
                return collection.value.insert(prepareRowForStorage(row));
            }
        };

        const deleteRow = (row: RowType) => {
            const existing = collection.value.by("id", row.id) as TableRowDocument | null;
            if (existing) {
                collection.value.remove(existing);
                return true;
            }

            return false;
        };

        const setupLiveRowUpdates = () => {
            echo.value.channel(liveChannelName)
                .listen(liveEventNames.updated, (row: RowType) => {
                    if (!row.id) {
                        return;
                    }

                    if (!rowsLoaded.value) {
                        pendingChanges.push([updateOrCreateRow, row]);
                        return;
                    }

                    updateOrCreateRow(row);
                    triggerCollectionRefThrottled();
                })
                .listen(liveEventNames.created, (row: RowType) => {
                    if (!row.id) {
                        return;
                    }

                    if (!rowsLoaded.value) {
                        pendingChanges.push([updateOrCreateRow, row]);
                        return;
                    }

                    updateOrCreateRow(row);
                    triggerCollectionRefThrottled();
                })
                .listen(liveEventNames.deleted, (row: RowType) => {
                    if (!row.id) {
                        return;
                    }

                    if (!rowsLoaded.value) {
                        pendingChanges.push([deleteRow, row]);
                        return;
                    }

                    deleteRow(row);
                    triggerCollectionRefThrottled();
                });
        };

        const getRowById = (id: string) : RowType | null => {
            return collection.value.findOne({ id });
        };

        const loadRowsIfNeeded = () => {
            if (rowsLoaded.value || waitStore.is(waiterName)) {
                return;
            }

            setupLiveRowUpdates();
            loadRows();
        };

        const getUniqueStringValues = (column: keyof RowType) => {
            const values: string = collection.value
                .chain()
                .data()
                .map((row: RowType) => row[column])
                .filter((value: string | number | boolean | undefined) => typeof value === "string" && value !== "");
            const uniqueValues = new Set(values);
            return [...uniqueValues];
        };

        return {
            rowsLoaded,
            collection,
            loadRowsIfNeeded,
            getRowById,
            someRowsLoaded,

            getUniqueStringValues
        };
    });

}



