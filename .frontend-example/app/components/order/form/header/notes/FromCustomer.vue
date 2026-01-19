<template lang="pug">
OrderFormHeaderNotesGroup(name="from-customer")
    OrderFormHeaderFieldsNote(:type="OrderNoteType.Planner" :editable="false")
    OrderFormHeaderFieldsNote(:type="OrderNoteType.Carrier" :editable="false")
</template>
<script setup lang="ts">


</script>
<style scoped lang="scss"></style>
