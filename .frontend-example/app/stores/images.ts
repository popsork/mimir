export const useImagesStore = defineStore("images", {
    state: () => {
        return {
            svg: Object.fromEntries(
                Object.entries(import.meta.glob("~/assets/images/**/*.svg", { query: "?raw", import: "default", eager: true })).map(
                    ([path, content]) => {
                        const name = path.replace(/^\/assets\/images\//, "").replace(/\.svg$/, "");
                        return [name, content];
                    },
                ),
            )
        };
    }
});
