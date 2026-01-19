<template lang="pug">
OrderFormHeaderNotesGroup(name="internal")
    OrderFormHeaderFieldsNote(:type="OrderNoteType.Internal" :editable="true")
    OrderFormHeaderFieldsNote(:type="OrderNoteType.Invoice" :editable="true")
</template>
<script setup lang="ts">


</script>
<style scoped lang="scss"></style>
