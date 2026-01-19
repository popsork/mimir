import defineSearchStore from "~/stores/search/defineSearchStore";
import { SEARCH_SPECIFICATION_ROW_DEFINITION, type SearchSpecificationRow } from "~/types/SearchSpecificationRow";


export const useSearchSpecificationsStore = defineSearchStore<SearchSpecificationRow>("search-specifications", SearchScope.Specifications, SEARCH_SPECIFICATION_ROW_DEFINITION);
