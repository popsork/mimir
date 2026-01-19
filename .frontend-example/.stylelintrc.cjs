module.exports = {
    defaultSeverity: "warning",

    customSyntax: "postcss-scss",
    overrides: [
        {
            files: ["**/*.vue"],
            customSyntax: "postcss-html"
        },
    ],

    ignoreFiles: [
        "dist/**/*"
    ],

    plugins: [
        "@stylistic/stylelint-plugin"
    ],

    extends: [
        "stylelint-config-standard-scss",
        "stylelint-config-recommended-vue/scss"
    ],

    rules: {
        // overridden rules in alphabetical order

        "alpha-value-notation": null,

        "at-rule-empty-line-before": ["always", {
            ignore: [
                "after-comment",
                "blockless-after-blockless",
                "first-nested",
                "inside-block",
            ],
            ignoreAtRules: [
                "else"
            ]
        }],

        "color-function-notation": null,

        "color-hex-length": null,
        "color-named": "never",
        "color-no-hex": true,

        "declaration-empty-line-before": null,

        "declaration-property-unit-allowed-list": {
            "font-size": ["px", "%", "em"],
        },

        "declaration-property-value-disallowed-list": {
            "/^transition/": ["/\\ball\\b/"],
            "/^background/": ["/https?:/"],
            "/.+/": ["initial"],
        },

        "font-family-name-quotes": "always-where-recommended",

        "selector-max-compound-selectors": null,
        "max-nesting-depth": null,

        // disable to allow `-webkit-min-device-pixel-ratio`
        "media-feature-name-no-vendor-prefix": null,

        // disable due to some bugs
        "no-descending-specificity": null,

        "no-duplicate-selectors": null,


        "no-empty-source": null,

        "declaration-block-no-redundant-longhand-properties": null,

        "property-no-vendor-prefix": [true, {
            ignoreProperties: [
                "appearance",
            ]
        }],

        "rule-empty-line-before": null,

        "scss/at-else-closing-brace-newline-after": "always-last-in-chain",
        "scss/at-else-closing-brace-space-after": "always-intermediate",
        "scss/at-else-empty-line-before": "never",
        "scss/at-else-if-parentheses-space-before": "always",
        "scss/at-if-closing-brace-newline-after": "always-last-in-chain",
        "scss/at-if-closing-brace-space-after": "always-intermediate",
        "scss/at-import-partial-extension": null, // disable due to deprecation
        "scss/at-mixin-argumentless-call-parentheses": "never",
        "scss/at-mixin-parentheses-space-before": "never",
        "scss/dollar-variable-colon-space-after": "at-least-one-space",

        "scss/dollar-variable-empty-line-before": null,

        "scss/double-slash-comment-whitespace-inside": "always",
        "scss/double-slash-comment-empty-line-before": null,

        "selector-no-qualifying-type": null,

        "unit-disallowed-list": ["rem"],


        "@stylistic/block-opening-brace-space-before": "always",

        "@stylistic/block-closing-brace-newline-after": ["always", {
            ignoreAtRules: [
                "if",
                "else"
            ]
        }],

        "@stylistic/block-closing-brace-empty-line-before": null,

        // disallow single-line blocks
        "@stylistic/block-closing-brace-newline-before": "always",
        "@stylistic/block-opening-brace-newline-after": "always",

        "@stylistic/color-hex-case": null,

        "@stylistic/declaration-colon-space-after": "always-single-line",
        "@stylistic/declaration-colon-space-before": "never",

        // disable due to https://github.com/stylelint/stylelint/issues/2794
        "@stylistic/declaration-colon-newline-after": null,

        "@stylistic/function-parentheses-space-inside": "never-single-line",

        "@stylistic/indentation": 4,

        "@stylistic/max-empty-lines": 6,

        // disable due to nuxt/vite needing an empty line to auto-import environment.scss
        "@stylistic/no-empty-first-line": null,


        "@stylistic/selector-combinator-space-after": "always",
        "@stylistic/selector-combinator-space-before": "always",

        "@stylistic/string-quotes": "double",

        // disable due to impossibility to group values in sass maps
        "@stylistic/value-list-max-empty-lines": null,

        // disable due to https://github.com/ota-meshi/stylelint-config-recommended-vue/issues/86
        "declaration-property-value-no-unknown": null,
        "scss/declaration-property-value-no-unknown": null,

        // allow rgba() syntax, as rgba(12, 23, 34, 0.5) is more readable than the new rgb(12 23 34 / 0.5) syntax
        "color-function-alias-notation": "with-alpha"
    }
};
