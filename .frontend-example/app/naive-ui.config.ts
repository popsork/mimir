import type { GlobalThemeOverrides } from "naive-ui";

const focusShadow = "0 0 0 2px #638CCF"; //  @include outline-when-active / $color-outline-accent

export const motusNaiveUiTheme: GlobalThemeOverrides = {
    common: {
        primaryColor: "#272930", // $color-text-normal
        primaryColorHover: "#164DA7", // $color-text-highlight
        primaryColorPressed: "#164DA7", // $color-text-highlight
        fontFamily: "Geist",
        fontSize: "12px", // should match the size in normal-text mixin
        fontWeight: "420",
        fontWeightStrong: "500",
        borderColor: "#DADCE1", // $color-border-normal
        borderRadius: "4px"
    },

    Button: {
        // NButton is not used directly as a component,
        // but some other components use it internally, e.g. date picker uses tiny buttons for actions

        border: "1px solid #164DA7", // $color-border-highlight
        borderHover: "1px solid #164DA7", // $color-border-highlight
        textColor: "#164DA7", // $color-text-highlight;
        color: "transparent",
        colorHover: "#EDF3FD", // $color-background-accent

        colorPrimary: "#164DA7", // $color-background-inverted-highlight
        colorPrimaryHover: "#113D83", // $color-background-inverted-highlight-darker
        colorPressedPrimary: "#113D83", // $color-background-inverted-highlight-darker
        colorFocusPrimary: "#113D83", // $color-background-inverted-highlight-darker
        textColorPrimary: "#EEEEF0", // $color-text-inverted
        borderRadiusTiny: "12px",
        borderPrimary: "none",
        paddingTiny: "0 12px",
        fontSizeTiny: "12px",
        fontWeight: "500",
    },

    Input: {
        textColor: "#272930", // $color-text-normal
        placeholderColor: "#5E6373", // $color-text-lightest
        suffixTextColor: "#5E6373", // $color-text-lightest
        iconColor: "#5E6373", // $color-text-lightest

        heightSmall: "24px",
        heightMedium: "28px",
        heightLarge: "36px",

        // font styling is adjusted in the component.
        // here are only the basic sizes for naive-ui
        fontSizeSmall: "12px",
        fontSizeMedium: "12px",
        fontSizeLarge: "12px",
        lineHeight: "16px",
        lineHeightTextarea: "16px",

        paddingSmall: "0 6px",
        paddingMedium: "0 6px",
        paddingLarge: "0 8px",

        border: "1px solid #8D92A3", // $color-border-darker
        borderHover: "1px solid #5E6373", // $color-border-hover
        borderFocus: "1px solid #C1C3CD", // $color-border-dark
        boxShadowFocus: focusShadow,

        colorDisabled: "#EEEEF0", // $color-background-light
        borderDisabled: "1px solid #DADCE1", // $color-border-normal
        textColorDisabled: "#C1C3CD", // $color-text-disabled
        iconColorDisabled: "#C1C3CD", // $color-text-disabled
    },

    Select: {
        peers: {
            InternalSelection: {
                border: "1px solid #8D92A3", // $color-border-darker
                borderHover: "1px solid #5E6373", // $color-border-hover
                borderActive: "1px solid #C1C3CD", // $color-border-dark
                borderFocus: "1px solid #C1C3CD", // $color-border-dark
                boxShadowActive: focusShadow,
                boxShadowFocus: focusShadow,

                colorDisabled: "#EEEEF0", // $color-background-light
            },
            InternalSelectMenu: {
                optionHeightMedium: "32px", // used for normal select fields
                optionHeightSmall: "28px" // used for multi-select fields
            },
        },
    },

    Dropdown: {
        optionHeightMedium: "32px",
    },

    DataTable: {
        tdPaddingSmall: "1px 5px",
        thPaddingSmall: "5px",
        thColor: "#ffffff", // $color-background-lightest
        tdColorStriped: "#EEEEF0", // $color-background-light
        tdColorHover: "#DADCE1", // $color-background-darker
        fontSizeSmall: "10px", // @small-text,
        thFontWeight: "650", // @small-strong-text
        borderColor: "transparent"
    },

    Split: {
        resizableTriggerColor: "transparent"
    },
};
