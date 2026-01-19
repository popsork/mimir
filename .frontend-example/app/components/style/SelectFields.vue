<template lang="pug">
StyleSection(title="Select fields")
    template(v-for="layout in layouts" :key="layout")
        StyleExamples(v-for="size in sizes" :key="size")
            StyleExample
                FormSelectField(v-bind="fieldAttributes(layout, size)")
            StyleExample
                FormSelectField(v-bind="fieldAttributes(layout, size, 'with a value')", v-model="value")
            StyleExample
                FormSelectField(v-bind="fieldAttributes(layout, size, 'with a placeholder')" placeholder="Placeholder text")
            StyleExample
                FormSelectField(v-bind="fieldAttributes(layout, size, 'with a changed value')", v-model="value" :changed="true")
            StyleExample
                FormSelectField(v-bind="fieldAttributes(layout, size, 'filterable')" :filterable="true")
            StyleExample
                FormSelectField(v-bind="fieldAttributes(layout, size, 'disabled')" v-model="value" :disabled="true")
            StyleExample(width="narrow")
                FormSelectField(v-bind="fieldAttributes(layout, size, 'overflowing label')" v-model="value")

    StyleDescription
        | If a select field needs to allow entering a custom single-use option text that is not available in the options list (combo box mode),
        | then set it to `:filterable="true"` and use `v-model:custom-value`
        | to bind a second model that will hold the custom value, if entered.
        br
        | The component will then always set existing option values to the main `v-model`
        | and the entered custom value to the `v-model:custom-value`.
        br
        | The component will also ensure that both models never get set at the same time,
        | ie. entering a custom value will set the main model to null,
        | and selecting an existing option will set the custom value model to null.

    StyleExamples
        StyleExample
            p Main value model: {{ (value === null) ? "<null>" : value }}
            p Custom value model: {{ (customValue === null) ? "<null>" : customValue }}
            FormSelectField(
                v-bind="fieldAttributes('loose', 'medium', 'with allowed custom value')"
                v-model="value"
                v-model:custom-value="customValue"
                :filterable="true"
            )

    StyleDescription
        | Secondary labels are aligned to the right and can be passed via `secondary-label` prop.
        br
        | Descriptions can be passed in via `description` slot.
    template(v-for="layout in layouts" :key="layout")
        StyleExamples(v-for="size in sizes" :key="size")
            StyleExample
                FormSelectField(v-bind="fieldAttributes(layout, size)" secondary-label="Optional")
                    template(v-slot:description)
                        | This is a description text lorem ipsum dolor sit amet
    StyleLabelHidingDescription

    template(v-for="layout in hideableLabelLayouts" :key="layout")
        StyleExamples(v-for="size in sizes" :key="size")
            StyleExample
                FormSelectField(v-bind="fieldAttributes(layout, size)" :label-visible="false")
            StyleExample
                FormSelectField(v-bind="fieldAttributes(layout, size, 'with a value')", v-model="value" :label-visible="false")
            StyleExample
                FormSelectField(v-bind="fieldAttributes(layout, size, 'filterable')" :filterable="true" :label-visible="false")
            StyleExample
                FormSelectField(v-bind="fieldAttributes(layout, size, 'disabled')" v-model="value" :disabled="true" :label-visible="false")

    StyleDescription
        | It is possible to replace the input node with any custom trigger, e.g. a button, by using the `input` slot.
        br
        | Internally, the `NDropdown` component is used in that case instead of `NSelect`.
        br
        | Only loose layout is currently supported for this feature.

    StyleExamples(v-for="size in sizes" :key="size")
        StyleExample
            FormSelectField(v-bind="dropdownFieldAttributes(size)" v-model="customInputValue")
                template(v-slot:input)
                    GenericButton(type="secondary" size="small") {{ customInputText }}
        StyleExample(width="narrow")
            FormSelectField(v-bind="dropdownFieldAttributes(size, 'overflowing label')" v-model="customInputValue")
                template(v-slot:input)
                    GenericButton(type="secondary" size="small") {{ customInputText }}
</template>
<script setup lang="ts">

const layouts = ["loose", "compact"] as const;
const hideableLabelLayouts = ["loose"] as const;

const sizes = ["medium", "large"] as const;

const value = ref("option-0-id");

const text = `
    Value ipsum dolor sit amet, consectetuer adipiscing elit.
    Varius maecenas maecenas maximus nisi ante nec neque.
    Pulvinar porttitor tincidunt facilisis pharetra dis odio pretium urna.
    Suscipit rutrum scelerisque luctus ligula inceptos suspendisse sociosqu vivamus.
    Curabitur tincidunt suscipit habitant in feugiat.
    Maecenas mattis turpis duis vehicula blandit dignissim aliquet.
    Tellus suspendisse elementum fermentum dolor eleifend sem posuere suspendisse amet.
    Placerat odio velit proin euismod placerat urna.
    Class elit eleifend quisque sem ullamcorper turpis ex augue.
    Pharetra non quis vestibulum suscipit vestibulum dui dis.
    Fusce blandit auctor praesent ridiculus suspendisse.
    Pulvinar facilisi sit lacinia cubilia faucibus proin nulla.
    Ultrices urna ridiculus quisque purus torquent urna etiam porttitor.
    Eu pretium quam; metus fringilla augue congue consectetur.
    Fusce eget vestibulum iaculis phasellus consectetur augue augue curabitur.
    Tristique nullam sapien, donec diam fames tortor consequat rhoncus.
`;
const words = text.toLowerCase().replace(/\.|;|,/g, "").replace(/\s+/g, " ").split(" ").filter(word => word.length > 1);

const labels = computed(() => {
    const result = [];
    let i = 0;

    while (i < words.length) {
        const numberOfWordsToTake = getDummyNumber(`words-${i}`, 7) + 1;
        const label = capitalizeFirstLetter(words.slice(i, i + numberOfWordsToTake).join(" "));
        result.push(label);
        i += numberOfWordsToTake;
    }

    return result;
});

const options = computed(() => {

    return labels.value.map((label, index) => {
        let icon = null;
        switch (index % 4) {
            case 1:
                icon = { name: "colored/green-ticked-circle", alt: "Active" };
                break;
            case 3:
                icon = { name: "colored/grey-clock", alt: "Inactive" };
                break;
        }

        return {
            value: `option-${index}-id`,
            label,
            icon,
        };
    });
});

const fieldAttributes = (layout: "loose" | "compact", size: "medium" | "large", labelSuffix?: string) => {
    const labelParts = [
        `${capitalizeFirstLetter(layout)} ${size} select`
    ];
    if (labelSuffix) {
        labelParts.push(labelSuffix);
    }
    const label = labelParts.join(" ");

    return {
        label,
        options: options.value,
        layout,
        size
    };
};

const dropdownFieldAttributes = (size: "medium" | "large", labelSuffix?: string) => {
    const layout = "loose" as const;
    const labelParts = [
        `${capitalizeFirstLetter(layout)} ${size} dropdown`
    ];
    if (labelSuffix) {
        labelParts.push(labelSuffix);
    }
    const label = labelParts.join(" ");

    return {
        label,
        options: options.value.slice(0, 4),
        layout,
        size,
        input: true
    };
};

const customValue = ref(null as string | null);
const customInputValue = ref(null as string | null);
const customInputText = computed(() => {
    const option = options.value.find(o => o.value === customInputValue.value);
    if (option) {
        return option.label;
    }
    return "Custom trigger!";
});

</script>
<style scoped lang="scss"></style>
