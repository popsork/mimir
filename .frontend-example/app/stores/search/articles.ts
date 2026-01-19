import defineSearchStore from "~/stores/search/defineSearchStore";
import { SEARCH_ARTICLE_ROW_DEFINITION, type SearchArticleRow } from "~/types/SearchArticleRow";

export const useSearchArticlesStore = defineSearchStore<SearchArticleRow>("search-articles", SearchScope.Articles, SEARCH_ARTICLE_ROW_DEFINITION);
