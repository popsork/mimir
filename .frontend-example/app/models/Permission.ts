import { Model } from "pinia-orm";
import { Role } from "~/models/Role";

export type PermissionApiResponseResource = {
    id: string,
    type: "permissions",
    name: string,
};

export class Permission extends Model {
    static override entity = "orm-permissions";

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),
            role_id: this.string(null),
            role: this.belongsTo(Role, "role_id"),
        };
    }

    declare id: string;
    declare name: string;
    declare role_id: string;
    declare role: Role;

    static fromApiResponse(resource: PermissionApiResponseResource) {
        return new Permission({
            id: resource.id,
            name: resource.name,
        });
    }
}
