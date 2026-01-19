import { Model } from "pinia-orm";
import { PersonalAccessToken, type PersonalAccessTokenApiResponseResource } from "~/models/PersonalAccessToken";

export type PasswordAuthenticationSessionApiResponseResource = {
    id: string,
    type: "passwordAuthenticationSessions",
    status: AuthenticationStatus,

    personalAccessToken?: { data?: PersonalAccessTokenApiResponseResource },
};

export class PasswordAuthenticationSession extends Model {
    static override entity = "orm-password-authentication-sessions";

    static override fields() {
        return {
            id: this.string(null),
            status: this.string(null),

            personalAccessTokenId: this.string(null),
            personalAccessToken: this.belongsTo(PersonalAccessToken, "personalAccessTokenId"),
        };
    }

    declare id: string;
    declare status: AuthenticationStatus;

    declare personalAccessTokenId: string | null;
    declare personalAccessToken: PersonalAccessToken | null;

    static fromApiResponse(resource: PasswordAuthenticationSessionApiResponseResource) {
        return new PasswordAuthenticationSession({
            id: resource.id,
            status: resource.status,

            personalAccessTokenId: resource.personalAccessToken?.data?.id ?? null,
            personalAccessToken: resource.personalAccessToken?.data ? PersonalAccessToken.fromApiResponse(resource.personalAccessToken.data) : null,
        });
    }
}
