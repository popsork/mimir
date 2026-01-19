import type { MaybeRefOrGetter } from "vue";

export type ShortcutCallback = () => void;
export type ShortcutMap = Record<string, ShortcutCallback>;
export type ShortcutItem = {
    combination: string,
    callback: ShortcutCallback,
    keys: string[],
};

const parseShortcut = (shortcut:string) => shortcut.split("+").map(key => key.trim());
const isPartialShortcutMatch = (keys: string[], pressedKeys: string[]) => {
    return pressedKeys.every(k => keys.includes(k));
};

const isExactShortcutMatch = (keys: string[], pressedKeys: string[]) => {
    return keys.length === pressedKeys.length && isPartialShortcutMatch(keys, pressedKeys);
};

export const useKeyboardShortcuts = (shortcuts: MaybeRefOrGetter<ShortcutMap>) => {
    const { typeableFieldFocused } = useFocusTracking();
    const { currentlyPressedKeys } = usePressedKeysTracking({
        onEventFired(e) {
            if (e.type !== "keydown" || typeableFieldFocused.value) {
                return;
            }

            const possibleShortcuts = getPossibleShortcuts();
            if (possibleShortcuts.length === 0) {
                return;
            }

            handleMatchingShortcuts(possibleShortcuts);

            e.preventDefault();
        },
    });

    const shortcutList = computed(() => {
        const shortcutsValue = unref(shortcuts) as ShortcutMap;
        return Object.entries(shortcutsValue).map(([shortcut, callback]) => ({
            combination: shortcut,
            callback,
            keys: parseShortcut(shortcut),
        })) as ShortcutItem[];
    });

    const getPossibleShortcuts = () => {
        if (currentlyPressedKeys.value.length === 0) {
            return [];
        }

        return shortcutList.value.filter((s) => {
            return isPartialShortcutMatch(s.keys, currentlyPressedKeys.value);
        });
    };

    const debouncedInvoke = useTimeoutFn((callback: ShortcutCallback) => {
        callback();
    }, 100, { immediate: false });

    //
    // Handles the possible shortcuts for the current pressed keys.
    // If an exact match is found in the list of possible shortcuts it either
    //  - if it is the only possible shortcut, trigger it immediately
    //  - if there are other options, trigger it with delay (which can be stopped if another key is pressed)
    //
    // The delay (currently 100ms) is kind of arbitrary and might need to change in the future, it's here to
    // handle multikey shortcuts, the user might have some view bound to Ctrl+1 and another to Ctrl+1+2.
    // If we trigger directly we might trigger the first (Ctrl+1) and then Ctrl+1+2 directly after which can
    // appear as "broken"/"blinky".
    const handleMatchingShortcuts = (possibilities: ShortcutItem[]) => {
        debouncedInvoke.stop();

        const exactMatch = possibilities.find(m => isExactShortcutMatch(m.keys, currentlyPressedKeys.value));
        if (!exactMatch) {
            return;
        }

        if (possibilities.length === 1) {
            exactMatch.callback();
            return;
        }

        debouncedInvoke.start(exactMatch.callback);
    };
};
