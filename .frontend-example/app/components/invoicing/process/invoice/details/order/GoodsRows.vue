<template lang="pug">
GenericTable(v-if="numberOfRows > 0" name="goods-rows" :columns="columns" :number-of-rows="numberOfRows")
    template(v-slot)
        tr(v-for="(goodsRow, index) in goodsRows" :key="index")
            td(data-name="quantity") {{ goodsRow.quantityText }}
            td(data-name="loading-meters") {{ localizeNumber(goodsRow.loadingMetres) }}
            td(data-name="pallet-places") {{ localizeNumber(goodsRow.palletPlaces) }}
            td(data-name="weight") {{ goodsRow.weightText }}
            td(data-name="volume") {{ goodsRow.volumeText }}
</template>
<script setup lang="ts">
import type { InvoiceGoodsRow } from "~/models/Invoice";

const props = defineProps<{
    goodsRows: InvoiceGoodsRow[],
}>();

const numberOfRows = computed(() => props.goodsRows?.length ?? 0);

const columnNames = ["quantity", "loading-metres", "pallet-places", "weight", "volume"] as const;

const { t } = useI18n();
const columns = computed(() => {
    return columnNames.map((name) => ({
        name: name,
        label: t(`invoicing.process.invoice.fields.goods_rows.${humanize(name)}`),
    }));
});

</script>
<style scoped lang="scss">
table {

    :deep(colgroup) {
        col {
            width: 20%;
        }
    }
}
</style>
