import { DocumentModel } from "~/models/DocumentModel";

export const useOrderFormDocumentsStore = defineStore("order-form-documents", () => {
    const formStore = useOrderFormStore();

    const { form } = storeToRefs(formStore);

    const addDocument = () => {
        const order = form.value.order;

        if (!order.documents) {
            order.documents = [];
        }

        const newDocument = DocumentModel.buildBlank({
            customerOrderId: order.id,
            sequenceNumber: order.documents.length + 1
        });

        order.documents.push(newDocument);

        formStore.registerRelationshipAddition("DocumentModel", newDocument.id);

        fixDocumentSequenceNumbers();
    };

    const getDocumentByIndex = (index: number) => {
        const order = form.value.order;
        if (!order.documents || !order.documents[index]) {
            return null;
        }
        return order.documents[index] as DocumentModel;
    };

    const removeDocument = (index: number) => {
        const order = form.value.order;

        const removableDocument = getDocumentByIndex(index);
        if (!removableDocument) {
            return;
        }

        order.documents!.splice(index, 1);
        formStore.registerRelationshipRemoval("DocumentModel", removableDocument.id);

        fixDocumentSequenceNumbers();
    };

    const fixDocumentSequenceNumbers = () => {
        const order = form.value.order;
        if (!order.documents) {
            return;
        }
        order.documents.forEach((record, index) => {
            record.sequenceNumber = index + 1;
        });
    };

    return {
        addDocument,
        removeDocument,
    };
});

