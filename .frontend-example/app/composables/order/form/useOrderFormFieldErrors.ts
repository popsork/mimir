import type { BaseModel } from "~/models/BaseModel";
import { JsonApiErrorCollection } from "~/models/JsonApiErrorCollection";

export const useOrderFormFieldErrors = <TIdentifier extends { type: string, id: string }, T extends BaseModel<TIdentifier>>(
    { recordAccessor, field, fields }:
    {
        recordAccessor: () => T | undefined,
    } & (
        // either "field" or "fields" must be given, but never both.
        // field names could maybe be restricted further based on something inferable from T class
        // to only allow valid field names for the respective model, but for now just allow any strings
        { field: string, fields?: never }
        |
        { field?: never, fields: string[] }
    )
) => {
    const { form } = storeToRefs(useOrderFormStore());

    const errors = computed(() => {
        const record = recordAccessor();
        if (!record) {
            return new JsonApiErrorCollection();
        }

        const fieldNames = field ? [field] : fields!;

        return form.value.errors.forRecord(record).forFields(fieldNames);
    });

    return {
        errors
    };
};
