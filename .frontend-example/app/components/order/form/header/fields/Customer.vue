<template lang="pug">
FormSelectField(
    v-model="customerId"
    :changed="order.customerIdIsManual"
    name="customer"
    :label="$t('order.fields.Customer')"
    :options="options"
    :filterable="true"
    :remote="true"
    :loading="waitingForSearch"
    :errors="errors"
    v-on:search="handleSearch"
    v-on:update:show="handleUpdateShow"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import { Customer } from "~/models/Customer";
import type { CustomerOrder } from "~/models/CustomerOrder";

const { order } = storeToRefs(useOrderFormStore());

const { recalculateOrder } = useOrderFormStore();

const customersStore = useOrderFormCustomersStore();

const { customers, waitingForSearch } = storeToRefs(customersStore);

customersStore.reset();

const customerId = computed({
    get: () => order.value.customerId,
    set: (id: string) => {
        order.value.customerId = id;
        order.value.customerIdIsManual = true;
        let customer: CustomerOrder["customer"] = null;
        if (id) {
            if (order.value.customer?.id === id) {
                customer = order.value.customer;
            } else {
                customer = useRepo(Customer).find(id);
            }
        }
        order.value.customer = customer;
    }
});

const getCustomerLabel = (customer: Customer) => {
    const parts = [] as string[];
    if (customer.number) {
        parts.push(customer.number);
    }
    if (customer.shortName) {
        parts.push(customer.shortName);
    }
    if (customer.name && customer.shortName !== customer.name) {
        parts.push(customer.name);
    }

    return parts.join(" | ");
};

const options = computed(() => {
    return buildSelectOptions({
        collection: customers.value,
        currentObject: order.value.customer,
        builder: (customer) => {
            return {
                value: customer.id,
                label: getCustomerLabel(customer as Customer),
                icon: (customer.isSubcustomer) ? { name: "caret-right" } : null,
            };
        }
    });
});

const searchCustomers = (query: string) => {
    if (query === "") {
        // do not search with empty query, as we never need to show all records
        clearSearchResults();
        return;
    }
    const maxNumberOfCustomers = 50;
    customersStore.performSearch({ query, maxNumberOfCustomers });
};

const handleUpdateShow = async (show: boolean) => {
    if (show) {
        // when opening the field, perform search with empty query to show all customers
        searchCustomers("");
        return;
    }

    // clear options when closing the field, because the search will be performed again when opening the field,
    // and the conditions for search will have changed - there will no longer be any text in the search field when opening.
    await nextTick(); // clear on next tick, otherwise the list gets cleared before the value gets set and field remains blank
    clearSearchResults();
};

const clearSearchResults = () => {
    customersStore.reset();
};

const handleSearch = (query: string) => {
    searchCustomers(query);
};

const { errors } = useOrderFormFieldErrors({
    recordAccessor: () => order.value,
    field: "customer",
});


</script>
<style scoped lang="scss"></style>
