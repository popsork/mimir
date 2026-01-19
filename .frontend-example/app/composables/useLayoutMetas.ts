export const useLayoutMetas = () => {
    useHead({
        htmlAttrs: {
            lang: computed(() => getCurrentLocale())
        },
        link: [{ rel: "shortcut icon", href: "/favicon.ico" }],
    });
};
