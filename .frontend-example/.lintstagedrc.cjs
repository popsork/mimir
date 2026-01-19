module.exports = {
    "**/*.{js,ts,vue}": [
        "npm run eslintfix-for-lint-staged"
    ],
    "**/*.{css,scss,vue}": [
        "npm run stylelintfix-for-lint-staged"
    ],
    "app/locales/*.json": [
        "npm run check-translations"
    ]
};
