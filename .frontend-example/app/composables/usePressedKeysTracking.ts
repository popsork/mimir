type ShortcutKeysOptions = {
    onEventFired?: ((e: KeyboardEvent) => void) | ((e: KeyboardEvent) => boolean),
};

export const usePressedKeysTracking = (options?: ShortcutKeysOptions) => {
    const listen = ref(false);
    const pressedKeys = useMagicKeys({
        passive: false,
        onEventFired(e) {
            //
            // When the user starts releasing keys, we stop
            // registering the action as a "I want to perform a shortcut"
            if (e.type === "keydown") {
                listen.value = true;
            }

            if (e.type === "keyup") {
                listen.value = false;
            }

            return options?.onEventFired?.(e);
        },
    });

    const digits = "0123456789".split("");
    const keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ".split("");
    const specialKeys = [...Array(12)].map((_, index) => `F${index + 1}`);
    const modifiers = ["Shift", "Ctrl", "Meta", "Alt"];

    //
    // useMagicKeys uses `key` from the KeyboardEvent in its `current`-property.
    // So that property might contain '!' instead of '1' if the user holds down the
    // shift key during shortcut generation. However, the `keys` ref contains both
    // `key` and `code` from the KeyboardEvent. `code` is in the form of `Digit1` (or `Numpad1`) for "1"
    // and `KeyE` for 'E'. That means that `keys` contains a property for `Digit1` that is
    // set to true if the 1 key is pressed, even if the shift key is pressed.
    const matchingDigits = computed(() => digits.filter(digit => pressedKeys[`Digit${digit}`]!.value || pressedKeys[`Numpad${digit}`]!.value));
    const matchingCharKeys = computed(() => keys.filter(key => pressedKeys[`Key${key}`]!.value));
    const matchingModifiers = computed(() => modifiers.filter(modifier => pressedKeys[modifier]!.value));
    const matchingSpecialKeys = computed(() => specialKeys.filter(key => pressedKeys[key]!.value));

    const currentlyPressedKeys = computed(() => {
        if (!listen.value) {
            return [];
        }

        //
        // Make an array of the actual pressed shortcut keys and validate it is following the rules:
        // - A special key is hit (i.e. F-buttons)
        // or
        // - At least one modifier key and at least one digit or character key
        const shortcutKeys = [...matchingModifiers.value, ...matchingCharKeys.value, ...matchingDigits.value, ...matchingSpecialKeys.value];
        if (matchingSpecialKeys.value.length === 0 && (matchingModifiers.value.length === 0 || shortcutKeys.length < 2)) {
            return [];
        }

        return shortcutKeys;
    });

    const currentlyPressedShortcut = computed(() => {
        return currentlyPressedKeys.value.join("+");
    });

    return {
        currentlyPressedShortcut,
        currentlyPressedKeys,
    };
};
