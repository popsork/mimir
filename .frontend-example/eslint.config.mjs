import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import stylistic from "@stylistic/eslint-plugin";
import vuePug from "eslint-plugin-vue-pug";

import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import withNuxt from "./.nuxt/eslint.config.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
});

export default withNuxt(
    {
        ignores: [
            "**/public",
            "**/*.d.ts",
        ],
    },
    ...compat.extends(
        "plugin:vue-pug/strongly-recommended",
    ),
    {
        plugins: {
            "@vue-pug": vuePug,
            "@stylistic": stylistic,
            "@typescript-eslint": typescriptEslint
        },

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },

            ecmaVersion: "latest",
            sourceType: "module",

            parserOptions: {
                parser: "@typescript-eslint/parser",
            },
        },

        rules: {
            // js rules
            "no-console": "off",

            // stylistic rules apply to both js and ts files
            "@stylistic/indent": ["error", 4, {
                CallExpression: {
                    arguments: "off",
                },

                SwitchCase: 1,
            }],
            "@stylistic/quotes": ["error", "double", {
                avoidEscape: true,
                allowTemplateLiterals: true,
            }],

            "@stylistic/semi": ["warn", "always", {
                omitLastInOneLineBlock: true,
            }],
            "@stylistic/no-extra-semi": "error",
            "@stylistic/brace-style": ["error", "1tbs", {
                allowSingleLine: true,
            }],
            "@stylistic/object-curly-spacing": ["error", "always"],
            "@stylistic/no-multiple-empty-lines": "off",
            "@stylistic/comma-dangle": ["error", "only-multiline"],
            "@stylistic/space-before-function-paren": ["error", {
                anonymous: "never",
                named: "never",
                asyncArrow: "always",
            }],

            "@stylistic/space-infix-ops": "error",
            "@stylistic/space-before-blocks": "error",
            "@stylistic/member-delimiter-style": ["error", {
                multiline: {
                    delimiter: "comma",
                    requireLast: true,
                },
                singleline: {
                    delimiter: "comma",
                    requireLast: false,
                },
            }],

            // ts rules
            "@typescript-eslint/no-explicit-any": "off",

            // vue rules
            "vue/html-quotes": ["error", "double", { "avoidEscape": true }],
            "vue/v-on-style": ["error", "longform"],

            "vue/v-slot-style": ["error", {
                atComponent: "v-slot",
                default: "v-slot",
                named: "longform",
            }],

            "vue/html-indent": ["error", 4],

            "vue/max-attributes-per-line": ["error", {
                singleline: {
                    max: 6,
                },

                multiline: {
                    max: 1,
                },
            }],

            "vue/no-v-html": "off",
            "vue/no-v-text-v-html-on-component": "off",
            "vue/require-default-prop": "off",
            "vue/padding-line-between-blocks": ["error", "never"],

            // switch some rules from error to warning to not block the page with error overlay during development
            "@typescript-eslint/no-unused-vars": "warn",

            // disable multi-word rule because the linter does not recognize nuxt's automatic multi-word naming based on route/folder structure
            "vue/multi-word-component-names": "off",

            // disable some eslint rules because they are conflicting with typescript
            // and typescript-eslint has its own corresponding rules
            "func-call-spacing": "off",
            "no-useless-constructor": "off",

            // these rules are disabled due to problems with pug and eslint-plugin-vue-pug
            // they should be already disabled by the plugin
            // https://github.com/rashfael/eslint-plugin-vue-pug/blob/main/lib/configs/base.js
            // but for some reason it does not work
            "vue/component-name-in-template-casing": "off",
            "vue/html-self-closing": "off",
            "vue/html-end-tags": "off",
            "vue/multiline-html-element-content-newline": "off",
            "vue/singleline-html-element-content-newline": "off",

            // disable unified signatures rule to avoid errors where code like this:
            // const emit = defineEmits<{
            //     (e: "focus"): void,
            //     (e: "blur"): void,
            // }>();
            // is suggested to be written like this:
            // const emit = defineEmits<{
            //     (e: "focus" | "blur"): void,
            // }>();
            // because these are separate events and it is clearer if they are written separately
            "@typescript-eslint/unified-signatures": "off",
        },
    }
);
