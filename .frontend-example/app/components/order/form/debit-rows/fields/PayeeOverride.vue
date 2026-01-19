<template lang="pug">
FormReadOnlyField(
    v-if="debitRowType === DebitRowType.Addon"
    :value="payeeName"
    v-bind="commonFieldProps"
    :blank-value-visible="false"
)
FormSelectField(
    v-else
    v-model="payeeIdAndType"
    :changed="getDebitRow()?.payeeIdIsManual"
    v-bind="commonFieldProps"
    :options="options"
    :filterable="true"
    :remote="true"
    :loading="waitingForSearch"
    v-on:search="handleSearch"
    v-on:update:show="handleUpdateShow"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">
import type { DebitRow } from "~/models/DebitRow";

const props = defineProps<{
    debitRowIndex: number,
    transportOrderId: string | null,
    debitRowType: DebitRowType | null,
}>();

const { t } = useI18n();
const commonFieldProps = computed(() => {
    return {
        name: "payee-override",
        label: t("debit_rows.fields.Payee override"),
        labelVisible: props.debitRowIndex === 0,
        errors: errors.value
    };
});

const { getDebitRow } = useOrderFormDebitRowAccessor(() => {
    return { transportOrderId: props.transportOrderId, index: props.debitRowIndex };
});

const { recalculateOrder } = useOrderFormStore();

const payeeIdAndType = computed({
    get: () => {
        const debitRow = getDebitRow();
        if (!debitRow) {
            return null;
        }
        if (!debitRow.payeeId || !debitRow.payeeResourceType) {
            return null;
        }
        return `${debitRow.payeeResourceType}::${debitRow.payeeId}`;
    },
    set: (idAndType: string | null) => {
        const debitRow = getDebitRow();

        if (!debitRow) {
            return;
        }

        let payeeId: DebitRow["payeeId"] = null;
        let payeeResourceType: DebitRow["payeeResourceType"] = null;
        let payee: DebitRow["payee"] = null;

        const parts = idAndType ? idAndType.split("::") : [];
        if (parts.length === 2) {
            const [type, id] = parts;
            if (type && id) {
                const currentIdentifier = debitRow.payee?.getApiResourceIdentifier();
                if (currentIdentifier && currentIdentifier.type === type && currentIdentifier.id === id) {
                    payee = debitRow.payee;
                } else {
                    payee = (payees.value.find((record) => {
                        const identifier = record.getApiResourceIdentifier();
                        return identifier.type === type && identifier.id === id;
                    }) ?? null) as DebitRow["payee"]; // type re-assertion needed because pinia-orm loses the type here
                }
            }

            if (payee) {
                const identifier = payee.getApiResourceIdentifier();
                payeeId = identifier.id;
                payeeResourceType = identifier.type;
            }
        }

        debitRow.payeeId = payeeId;
        debitRow.payeeResourceType = payeeResourceType;
        debitRow.payeeIdIsManual = true;
        debitRow.payee = payee;
    }
});

const payeeName = computed(() => {
    const record = getDebitRow();
    if (!record || !record.payee) {
        return "";
    }

    return record.payee.name;
});


const store = useOrderFormPayeesStore();
store.reset();

const { payees, searchQuery } = storeToRefs(store);

const waitingForSearch = computed(() => {
    const record = getDebitRow();
    if (!record) {
        return false;
    }
    return store.waitingForSearch(searchQuery.value, record.id);
});

const options = computed(() => {
    const record = getDebitRow();
    if (!record) {
        return [];
    }

    return buildSelectOptions({
        collection: payees.value,
        currentObject: record.payee,
        builder: (payee) => {
            const identifier = payee.getApiResourceIdentifier();
            return {
                value: `${identifier.type}::${identifier.id}`,
                label: payee.name
            };
        }
    });
});

const searchPayees = (query: string) => {
    const record = getDebitRow();
    if (!record) {
        return;
    }

    if (query === "") {
        // do not search with empty query, as we never need to show all records
        // but clear any previous search results if they are left over
        clearSearchResults();
        return;
    }


    const debitRowId = record.id;
    const maxNumberOfPayees = 50;

    store.performSearch({ query, maxNumberOfPayees, fieldIdentifier: debitRowId });
};

const handleUpdateShow = async (show: boolean) => {
    if (show) {
        // when opening the field, clear any previous search results
        clearSearchResults();
        return;
    }

    // since the search results are currently stored in a single store,
    // they need to be cleared so that results from search in one debit row do not show up in another.

    await nextTick(); // clear on next tick, otherwise the list gets cleared before the value gets set and field remains blank
    clearSearchResults();
};

const handleSearch = (query: string) => {
    searchPayees(query);
};

const clearSearchResults = () => {
    store.reset();
};

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getDebitRow,
    field: "unit",
});

</script>
    <style scoped lang="scss"></style>
