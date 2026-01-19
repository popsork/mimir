import { BaseModel } from "~/models/BaseModel";
import { User, type UserApiResponseResource } from "~/models/User";
import { CustomerOrder } from "./CustomerOrder";

export type AuditEntryApiResourceIdentifier = { type: "audits", id: string };

type AuditEntryApiResourceAttributes = {
    auditable_type: string,
    event: AuditEvent,
    change_count: number,
    old_values: Record<string, any> | null,
    new_values: Record<string, any> | null,
    created_at: string,
};

export type AuditEntryApiResponseResource = AuditEntryApiResourceIdentifier & AuditEntryApiResourceAttributes & {
    user: { data?: UserApiResponseResource },
};

export class AuditEntry extends BaseModel<AuditEntryApiResourceIdentifier> {
    static override entity = "orm-audit-entries";
    static override apiResourceType = "audits" as const;

    static override fields() {
        return {
            id: this.string(null),
            sequenceNumber: this.number(null),

            auditableType: this.string(null),
            event: this.string(null),
            numberOfChanges: this.number(null),
            oldValues: this.attr(null),
            newValues: this.attr(null),

            createdAt: this.string(null),

            customerOrderId: this.string(null),
            customerOrder: this.belongsTo(CustomerOrder, "customerOrderId"),

            userId: this.string(null),
            user: this.belongsTo(User, "userId"),

            userName: this.string(null) // pre-calculated field to avoid having to load the relationship
        };
    }

    declare id: string;

    declare sequenceNumber: number;

    declare auditableType: string | null;
    declare event: AuditEvent;
    declare numberOfChanges: number | null;

    declare oldValues: Record<string, any> | null;
    declare newValues: Record<string, any> | null;

    declare createdAt: string | null;

    declare userId: string | null;
    declare user: User | null;
    declare userName: string | null;

    declare customerOrderId: string;

    static fromApiResponse(resource: AuditEntryApiResponseResource) {

        return new AuditEntry({
            id: resource.id,

            auditableType: resource.auditable_type,
            event: resource.event,
            numberOfChanges: resource.change_count,
            oldValues: resource.old_values,
            newValues: resource.new_values,
            createdAt: getUtcDatetimeString(resource.created_at),

            userId: resource.user?.data?.id ?? null,
            user: resource.user?.data ? User.fromApiResponse(resource.user.data) : null,
            userName: resource.user?.data?.name ?? null,
        });
    }


}
