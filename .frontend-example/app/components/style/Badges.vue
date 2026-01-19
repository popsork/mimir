<template lang="pug">
StyleSection(title="Badges")
    StyleDescription
        | Badges use either GenericBadge component for custom colors or more specific components for predefined statuses.
        |
        | Badges have two sizes: medium (default) and small.

    .size(v-for="size in sizes" :key="size")
        h3 {{ capitalizeFirstLetter(size) }} size
        StyleExamples
            StyleExample
                GenericBadge(:size="size" text="Generic badge")
            StyleExample
                //- $color-background-inverted + $color-text-inverted
                GenericBadge(:size="size" text="Custom colors badge" color="#4C505D" text-color="#EEEEF0")
        StyleDescription OrderStatusBadge component
        StyleExamples
            StyleExample
                OrderStatusBadge(:size="size" text="Pending" :status="TransportOrderStatusName.Pending")
            StyleExample
                OrderStatusBadge(:size="size" text="Planned" :status="TransportOrderStatusName.Planned")
            StyleExample
                OrderStatusBadge(:size="size" text="Dispatched" :status="TransportOrderStatusName.Dispatched")
            StyleExample
                OrderStatusBadge(:size="size" text="Accepted" :status="TransportOrderStatusName.Accepted")
            StyleExample
                OrderStatusBadge(:size="size" text="Started" :status="TransportOrderStatusName.Started")
            StyleExample
                OrderStatusBadge(:size="size" text="Completed" :status="TransportOrderStatusName.Completed")
            StyleExample
                OrderStatusBadge(:size="size" text="Verified" :status="TransportOrderStatusName.Verified")
            StyleExample
                OrderStatusBadge(:size="size" text="Invoicing" :status="TransportOrderStatusName.Invoicing")
            StyleExample
                OrderStatusBadge(:size="size" text="SelfBillable" :status="TransportOrderStatusName.SelfBillable")
            StyleExample
                OrderStatusBadge(:size="size" text="SelfBilling" :status="TransportOrderStatusName.SelfBilling")
            StyleExample
                OrderStatusBadge(:size="size" text="Archived" :status="TransportOrderStatusName.Archived")
        StyleDescription InvoicingProcessStatusBadge component
        StyleExamples
            StyleExample
                InvoicingProcessStatusBadge(:size="size" text="Creating" :status="InvoicingProcessStatus.Creating")
            StyleExample
                InvoicingProcessStatusBadge(:size="size" text="Pending" :status="InvoicingProcessStatus.Pending")
            StyleExample
                InvoicingProcessStatusBadge(:size="size" text="Restarting" :status="InvoicingProcessStatus.Restarting")
            StyleExample
                InvoicingProcessStatusBadge(:size="size" text="Running" :status="InvoicingProcessStatus.Running")
            StyleExample
                InvoicingProcessStatusBadge(:size="size" text="External processing" :status="InvoicingProcessStatus.ExternalProcessing")
            StyleExample
                InvoicingProcessStatusBadge(:size="size" text="External processing done" :status="InvoicingProcessStatus.ExternalProcessingDone")
            StyleExample
                InvoicingProcessStatusBadge(:size="size" text="Completed" :status="InvoicingProcessStatus.Completed")
            StyleExample
                InvoicingProcessStatusBadge(:size="size" text="Cancelling" :status="InvoicingProcessStatus.Cancelling")
            StyleExample
                InvoicingProcessStatusBadge(:size="size" text="Cancelled" :status="InvoicingProcessStatus.Cancelled")
            StyleExample
                InvoicingProcessStatusBadge(:size="size" text="Failed" :status="InvoicingProcessStatus.Failed")
            StyleExample
                InvoicingProcessStatusBadge(:size="size" text="Error" :status="InvoicingProcessStatus.Error")

</template>
<script setup lang="ts">

const sizes = ["large", "medium", "small"] as const;


</script>
<style scoped lang="scss">
h3 {
    @include small-heading;
    margin-bottom: steps(2);
}
</style>
