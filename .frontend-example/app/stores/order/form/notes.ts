import { OrderNote } from "~/models/OrderNote";

export const useOrderFormNotesStore = defineStore("order-form-notes", () => {
    const formStore = useOrderFormStore();

    const { form } = storeToRefs(formStore);

    const addNote = (noteType: OrderNoteType) => {
        const order = form.value.order;

        if (!order.notes) {
            order.notes = [];
        }

        const newNote = OrderNote.buildBlank({
            customerOrderId: order.id,
            noteType
        });

        order.notes.push(newNote);

        formStore.registerRelationshipAddition("OrderNote", newNote.id);
    };

    const getNoteByType = (noteType: OrderNoteType) => {
        const order = form.value.order;
        if (!order.notes) {
            return null;
        }

        // technically, order notes are a has-many relationship in the BE,
        // and there could be multiple notes of the same type returned for an order,
        // but in practice we only expect at most one note of each type, so just return the first one.
        // in case there are multiple notes of the same type,
        // the others will be silently ignored and saved back to the server.
        // they won't be deleted, they just won't be visible in the UI.
        const firstNote = order.notes.find(note => note.noteType === noteType);
        if (!firstNote) {
            return null;
        }
        return firstNote as OrderNote;
    };

    return {
        addNote,
        getNoteByType
    };
});

