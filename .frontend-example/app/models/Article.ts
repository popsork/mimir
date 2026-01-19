import { BaseModel } from "~/models/BaseModel";

import { ArticleGroup, type ArticleGroupApiResponseResource } from "~/models/ArticleGroup";

export type ArticleApiResourceIdentifier = { type: "articles", id: string };

export type ArticleApiResponseResource = ArticleApiResourceIdentifier & {
    name: string,
    code: string,
    number: string | null,

    articleGroup?: { data?: ArticleGroupApiResponseResource },
};


export class Article extends BaseModel<ArticleApiResourceIdentifier> {
    static override entity = "orm-articles";
    static override apiResourceType = "articles" as const;

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),
            code: this.string(null),
            number: this.string(null),

            groupId: this.string(null),
            group: this.belongsTo(ArticleGroup, "groupId"),

            groupName: this.string(null),

            sequenceNumber: this.number(null)
        };
    }

    declare id: string;
    declare name: string;
    declare code: string;
    declare number: string | null;

    declare groupId: string | null;
    declare group: ArticleGroup | null;
    declare groupName: string | null;

    declare sequenceNumber: number;

    static fromApiResponse(resource: ArticleApiResponseResource) {
        const groupId = resource.articleGroup?.data?.id ?? null;
        const group = resource.articleGroup?.data ? ArticleGroup.fromApiResponse(resource.articleGroup.data) : null;

        return new Article({
            id: resource.id,
            name: resource.name,
            code: resource.code,
            number: resource.number,

            groupId,
            group,
            groupName: group?.name ?? null, // store group name along with article for easier access
        });
    }
}
