import { BaseModel } from "~/models/BaseModel";
import { Role, type RoleApiResponseResource } from "~/models/Role";

export type UserApiResourceIdentifier = { type: "users", id: string };

type UserApiResourceAttributes = {
    name: string,
    email: string,
};

export type UserApiResponseResource = UserApiResourceIdentifier & UserApiResourceAttributes & {
    roles?: { data?: RoleApiResponseResource[] },
};

export class User extends BaseModel<UserApiResourceIdentifier> {
    static override entity = "orm-users";
    static override apiResourceType = "users" as const;

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),
            email: this.string(null),
            roles: this.hasMany(Role, "user_id").onDelete("cascade"),
        };
    }

    declare id: string;
    declare name: string;
    declare email: string;
    declare roles: Role[] | null;

    static fromApiResponse(resource: UserApiResponseResource) {
        const roles = resource.roles?.data?.map(role => Role.fromApiResponse(role)) || [];
        return new User({
            id: resource.id,
            name: resource.name,
            email: resource.email,
            roles,
        });
    }
}
