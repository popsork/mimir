import type { SelectOption } from "~/components/form/SelectField.vue";

// this is meant to be used for collection-based select fields
// where the collection is fetched from the server.

// if the field already has a value when the form is opened,
// and the currently selected object is available,
// then there must always be a corresponding option in the option list
// for the field to work correctly.

// therefore this function prepends the current object as the first option
// if it is not already present in the collection (e.g. while the options are still being fetched from the server).

// for remote select fields this also prevents losing the currently selected object
// when the repo is cleared (e.g., during a new search).

type SupportedRecord = {
    id: string,
};

const prependRecordIfNotIncluded = <T extends SupportedRecord>(array: T[], record: T | null): T[] => {
    if (!record) {
        return array;
    }

    if (array.some(item => item.id === record.id)) {
        return array;
    }

    return [record, ...array] as T[];
};

type Arguments<T extends SupportedRecord> = {
    collection: T[],
    currentObject: T | null,
    builder: (record: T) => SelectOption,
};

export const buildSelectOptions = <T extends SupportedRecord>(
    { collection, currentObject, builder }: Arguments<T>
): SelectOption[] => {
    const completeCollection = prependRecordIfNotIncluded(collection, currentObject);

    return completeCollection.map(item => builder(item));
};

