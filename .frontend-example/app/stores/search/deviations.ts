import defineSearchStore from "~/stores/search/defineSearchStore";

export const useSearchDeviationsStore = defineSearchStore<SearchDeviationRow>("search-deviations", SearchScope.Deviations, SEARCH_DEVIATION_ROW_DEFINITION);
