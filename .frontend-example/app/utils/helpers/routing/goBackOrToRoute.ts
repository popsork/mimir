export function goBackOrToRoute(...args: Parameters<typeof goToRoute>) {
    if (backRouteExists()) {
        const router = useRouter();
        router.back();
        return;
    }

    return goToRoute(...args);
}

const backRouteExists = () => {
    // vue router provides a "back" property in history state if there is a page to go back to
    return typeof window.history.state?.back === "string";
};
