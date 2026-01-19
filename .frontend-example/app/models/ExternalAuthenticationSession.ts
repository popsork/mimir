import { Model } from "pinia-orm";
import { PersonalAccessToken, type PersonalAccessTokenApiResponseResource } from "~/models/PersonalAccessToken";

export type ExternalAuthenticationSessionApiResponseResource = {
    id: string,
    type: "externalAuthenticationSessions",
    status: AuthenticationStatus,

    authority: ExternalAuthenticationAuthority,
    authentication_url: string,
    callback_url: string,

    personalAccessToken?: { data?: PersonalAccessTokenApiResponseResource },
};

export class ExternalAuthenticationSession extends Model {
    static override entity = "orm-external-authentication-sessions";

    static override fields() {
        return {
            id: this.string(null),
            status: this.string(null),

            authority: this.string(null),
            authenticationUrl: this.string(null),
            callbackUrl: this.string(null),

            personalAccessTokenId: this.string(null),
            personalAccessToken: this.belongsTo(PersonalAccessToken, "personalAccessTokenId"),
        };
    }

    declare id: string;
    declare status: AuthenticationStatus;

    declare authority: ExternalAuthenticationAuthority | null;
    declare authenticationUrl: string | null;
    declare callbackUrl: string | null;

    declare personalAccessTokenId: string | null;
    declare personalAccessToken: PersonalAccessToken | null;

    static fromApiResponse(resource: ExternalAuthenticationSessionApiResponseResource) {
        return new ExternalAuthenticationSession({
            id: resource.id,
            status: resource.status,

            authority: resource.authority,
            authenticationUrl: resource.authentication_url,
            callbackUrl: resource.callback_url,

            personalAccessTokenId: resource.personalAccessToken?.data?.id ?? null,
            personalAccessToken: resource.personalAccessToken?.data ? PersonalAccessToken.fromApiResponse(resource.personalAccessToken.data) : null,
        });
    }
}
