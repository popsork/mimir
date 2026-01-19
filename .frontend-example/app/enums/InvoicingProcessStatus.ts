export enum InvoicingProcessStatus {
    Creating = "creating",
    Pending = "pending",
    Running = "running",
    ExternalProcessing = "externalProcessing",
    ExternalProcessingDone = "externalProcessingDone",
    Restarting = "restarting",
    Completed = "completed",
    Cancelling = "cancelling",
    Cancelled = "cancelled",
    Failed = "failed",
    Error = "error",
}
