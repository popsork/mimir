import { Model } from "pinia-orm";
import type { PermissionApiResponseResource } from "~/models/Permission";
import { Permission } from "~/models/Permission";
import { User } from "~/models/User";

export type RoleApiResponseResource = {
    id: string,
    type: "roles",
    name: string,
    permissions?: { data?: PermissionApiResponseResource[] },
};

export class Role extends Model {
    static override entity = "orm-roles";

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),
            user_id: this.string(null),
            user: this.belongsTo(User, "user_id"),
            permissions: this.hasMany(Permission, "role_id").onDelete("cascade"),
        };
    }

    declare id: string;
    declare name: string;
    declare permissions: Permission[] | null;
    declare user_id: string;
    declare user: User;

    static fromApiResponse(resource: RoleApiResponseResource) {
        const permissions = resource.permissions?.data?.map(permisson => Permission.fromApiResponse(permisson)) || [];

        return new Role({
            id: resource.id,
            name: resource.name,
            permissions,
        });
    }
}
