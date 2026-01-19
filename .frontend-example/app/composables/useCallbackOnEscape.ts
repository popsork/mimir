
export const useCallbackOnEscape = (callback: () => void) => {
    useEventListener(document, "keydown", (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            callback();
        }
    });
};

