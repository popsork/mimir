export function buildTableColumnDefinition<
    T extends Record<string, keyof ColumnTypeMap | TableColumnDefinition>
>(defs: T): NormalizedColumnDefs<T> {
    const result = {} as NormalizedColumnDefs<T>;
    for (const key in defs) {
        const def = defs[key];

        //
        // if the definition is a string, this is the shorthand
        // version (key: (type: string)) and thus gets converted to an object
        if (typeof def === "string") {
            result[key] = { type: def } as any;
        } else {
            result[key] = def as any;
        }
    }

    return result;
}

type ColumnTypeMap = {
    string: string | null,
    number: number | null,
    boolean: boolean | null,
    date: string | null,
};

export type TableColumnDefinition = ColumnDefinitionBase & ColumnDefinitionTypes;

type ColumnDefinitionTypes =
    ColumnDefinitionString
    | ColumnDefinitionDate
    | ColumnDefinitionNumber
    | ColumnDefinitionBoolean
    | ColumnDefinitionEnum<object>;


export type ColumnDefinitionBase = {
    filterOn?: string,
    sortOn?: string,
};

type ColumnDefinitionString = {
    type: "string",
};

// - "normal": Remove time if the time is 00:00
// - "delivery": Remove time if the time is 23:59
export type TimeFormatRule = "normal" | "delivery";
export type ColumnDefinitionDate = {
    type: "date",
    timeFormat?: TimeFormatRule,
    sortDateOn?: string,
    sortTimeOn?: string,
};

export type NumberFormatRule = "normal" | "currency";
type ColumnDefinitionNumber = {
    type: "number",
    filterType?: "range" | "input",
    min?: number,
    max?: number,
    numberFormat?: NumberFormatRule,
    decimals?: number,
};

type ColumnDefinitionBoolean = {
    type: "boolean",
};

type ColumnDefinitionEnum<E extends object> = {
    type: "enum",
    enum: E,
    translationScope: string,
};

// Converts a shorthand type key (e.g., "string") to a full ColumnDefinition,
// or passes through an existing ColumnDefinition. Used at the type level to
// reflect what happens at runtime in buildTableColumnDefinition.
type NormalizeColumnDef<T> =
    T extends keyof ColumnTypeMap
        ? { type: T } // shorthand: key -> { type: key }
        : T extends TableColumnDefinition
            ? T // already a full definition
            : never; // otherwise invalid


// Applies NormalizeColumnDef to each value in a column definition record.
// This ensures all columns are represented as full definitions at the type level.
type NormalizedColumnDefs<
    T extends Record<string, keyof ColumnTypeMap | TableColumnDefinition>
> = {
    [K in keyof T]: NormalizeColumnDef<T[K]>;
};


// Maps a column definition record to a row value type object,
// where each key corresponds to the resolved value type of its definition.
// Used to derive OrderRowDefinedColumns from orderRowColumnDefinition.
export type InferRowType<T extends Record<string, any>> = {
    [K in keyof T]: InferColumnType<T[K]>;
};

// Given a single column definition (enum, object or shorthand),
// resolves its corresponding value type:
//  - { type: "number" } → number | null
//  - enum → union of enum values
//  - "string" → string | null
type InferColumnType<T> =
    T extends { type: "enum", enum: infer E }
        ? E extends object
            ? E[keyof E] // enum definitions -> union of enum values
            : never
        : T extends { type: infer U }
            ? U extends keyof ColumnTypeMap
                ? ColumnTypeMap[U] // map named types to actual types
                : never
            : T extends keyof ColumnTypeMap
                ? ColumnTypeMap[T] // shorthand key definitions
                : never;
