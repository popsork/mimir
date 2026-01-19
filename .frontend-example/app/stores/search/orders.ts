import defineSearchStore from "~/stores/search/defineSearchStore";
import { SEARCH_ORDER_ROW_DEFINITION, type SearchOrderRow } from "~/types/SearchOrderRow";

export const useSearchOrdersStore = defineSearchStore<SearchOrderRow>("search-orders", SearchScope.Orders, SEARCH_ORDER_ROW_DEFINITION);
