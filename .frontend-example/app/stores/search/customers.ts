import defineSearchStore from "~/stores/search/defineSearchStore";
import { SEARCH_CUSTOMER_ROW_DEFINITION, type SearchCustomerRow } from "~/types/SearchCustomerRow";


export const useSearchCustomersStore = defineSearchStore<SearchCustomerRow>("search-customers", SearchScope.Customers, SEARCH_CUSTOMER_ROW_DEFINITION);
