import type { DocumentModel } from "~/models/DocumentModel";

export const useOrderFormDocumentAccessor = (indexFunction: () => number) => {
    const { form } = storeToRefs(useOrderFormStore());

    const getDocument = () => {
        const documents = (form.value.order.documents || []) as DocumentModel[];
        const index = indexFunction();
        return documents[index];
    };

    return {
        getDocument
    };
};
