import { InvoicingProcessStepStatus } from "~/enums/InvoicingProcessStepStatus";
import { BaseModel } from "~/models/BaseModel";
import { InvoicingProcess } from "~/models/InvoicingProcess";


export type InvoicingProcessStepApiResourceIdentifier = { type: "invoiceProcessSteps", id: string };

type InvoicingProcessStepApiResourceAttributes = {
    step_type: InvoicingProcessStepType,

    started_at: string | null,
    stopped_at: string | null,
    completed_at: string | null,

    error_message: string | null,
};

export type InvoicingProcessStepApiResponseResource = InvoicingProcessStepApiResourceIdentifier & InvoicingProcessStepApiResourceAttributes;


export class InvoicingProcessStep extends BaseModel<InvoicingProcessStepApiResourceIdentifier> {
    static override entity = "orm-invoicing-process-steps";
    static override apiResourceType = "invoiceProcessSteps" as const;

    static override fields() {
        return {
            id: this.string(null),
            sequenceNumber: this.number(null),

            type: this.string(null),
            startedAt: this.string(null),
            stoppedAt: this.string(null),
            completedAt: this.string(null),

            errorMessage: this.string(null),

            processId: this.string(null),
            process: this.belongsTo(InvoicingProcess, "processId"),
        };
    }

    declare id: string;
    declare sequenceNumber: number;

    declare type: InvoicingProcessStepType | null;

    declare startedAt: string | null;
    declare stoppedAt: string | null;
    declare completedAt: string | null;

    declare errorMessage: string | null;

    declare processId: string | null;
    declare process: InvoicingProcess | null;

    getStatus(): InvoicingProcessStepStatus {
        if (this.completedAt !== null) {
            return InvoicingProcessStepStatus.Completed;
        }

        if (this.stoppedAt !== null) {
            return InvoicingProcessStepStatus.Stopped;
        }

        if (this.startedAt !== null) {
            return InvoicingProcessStepStatus.Started;
        }

        return InvoicingProcessStepStatus.Pending;
    }

    getCurrentStatusSetAt(): string | null {
        const status = this.getStatus();
        switch (status) {
            case InvoicingProcessStepStatus.Pending:
                return null;
            case InvoicingProcessStepStatus.Started:
                return this.startedAt;
            case InvoicingProcessStepStatus.Stopped:
                return this.stoppedAt;
            case InvoicingProcessStepStatus.Completed:
                return this.completedAt;
        }
    }

    static fromApiResponse(resource: InvoicingProcessStepApiResponseResource) {
        return new InvoicingProcessStep({
            id: resource.id,
            type: resource.step_type,
            startedAt: getUtcDatetimeString(resource.started_at),
            stoppedAt: getUtcDatetimeString(resource.stopped_at),
            completedAt: getUtcDatetimeString(resource.completed_at),
            errorMessage: resource.error_message,
        });
    }
}
