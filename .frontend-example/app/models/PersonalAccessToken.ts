import { Model } from "pinia-orm";
import { User, type UserApiResponseResource } from "~/models/User";

export type PersonalAccessTokenApiResponseResource = {
    id: string,
    type: "personalAccessTokens",
    token: string,

    user?: { data?: UserApiResponseResource },
};

export class PersonalAccessToken extends Model {
    static override entity = "orm-personal-access-tokens";

    static override fields() {
        return {
            id: this.string(null),
            value: this.string(null),


            userId: this.string(null),
            user: this.belongsTo(User, "userId"),
        };
    }

    declare id: string;
    declare value: string;

    declare userId: string | null;
    declare user: User | null;

    static fromApiResponse(resource: PersonalAccessTokenApiResponseResource) {
        return new PersonalAccessToken({
            id: resource.id,
            value: resource.token,

            userId: resource.user?.data?.id ?? null,
            user: resource.user?.data ? User.fromApiResponse(resource.user.data) : null,
        });
    }
}
