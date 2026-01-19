export const SEARCH_ARTICLE_ROW_DEFINITION = buildTableColumnDefinition({
    article_group_name: "string",
    code: "string",
    name: "string",
    number: "string",
});

type SearchArticleRowBaseColumns = {
    id: string,
};

type SearchArticleRowDefinedColumns = InferRowType<typeof SEARCH_ARTICLE_ROW_DEFINITION>;

export type SearchArticleRow = SearchArticleRowBaseColumns & SearchArticleRowDefinedColumns;
export type SearchArticleRowKey = keyof SearchArticleRow;
export type DefinedSearchArticleRowKey = keyof SearchArticleRowDefinedColumns;
