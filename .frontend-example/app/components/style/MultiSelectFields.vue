<template lang="pug">
StyleSection(title="Multi-select fields")
    StyleExamples
        StyleExample
            FormMultiSelectField(v-bind="fieldAttributes()" v-model="values")
        StyleExample
            FormMultiSelectField(v-bind="fieldAttributes('with selected values')" v-model="prefilledValues")
        StyleExample
            FormMultiSelectField(v-bind="fieldAttributes('with many values wraps and expands')" v-model="prefilledManyValues")
        StyleExample(width="narrow")
            FormMultiSelectField(v-bind="fieldAttributes('with overflowing label')" v-model="prefilledValues")
    StyleLabelHidingDescription

    StyleExamples
        StyleExample
            FormMultiSelectField(v-bind="fieldAttributes()" v-model="values" :label-visible="false")
        StyleExample
            FormMultiSelectField(v-bind="fieldAttributes('with selected values')" v-model="prefilledValues" :label-visible="false")
        StyleExample
            FormMultiSelectField(v-bind="fieldAttributes('with many values wraps and expands')" v-model="prefilledManyValues" :label-visible="false")
</template>
<script setup lang="ts">

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
        const numberOfWordsToTake = getDummyNumber(`words-${i}`, 2) + 1;
        const label = capitalizeFirstLetter(words.slice(i, i + numberOfWordsToTake).join(" "));
        result.push(label);
        i += numberOfWordsToTake;
    }

    return result;
});

const options = computed(() => {
    return labels.value.map(label => ({
        value: label.toString(),
        label,
    }));
});


const values = ref([]);

const prefilledValues = ref([options.value[1]!.value, options.value[3]!.value]);

const prefilledManyValues = ref([1, 3, 5, 7, 9].map(index => options.value[index]!.value));


const fieldAttributes = (labelSuffix?: string) => {
    const headerLabel = "Select value";

    const labelParts = ["Multi-select field"];
    if (labelSuffix) {
        labelParts.push(labelSuffix);
    }
    const label = labelParts.join(" ");
    return {
        label,
        options: options.value,
        headerLabel
    };
};

</script>
<style scoped lang="scss">
section {
    .example[data-width="narrow"] {
        flex-basis: steps(20);
        width: steps(20);
    }
}
</style>
