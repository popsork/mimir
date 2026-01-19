import { BaseModel } from "~/models/BaseModel";

export type ArticleGroupApiResourceIdentifier = { type: "articleGroups", id: string };

export type ArticleGroupApiResponseResource = ArticleGroupApiResourceIdentifier & {
    name: string,
};

export class ArticleGroup extends BaseModel<ArticleGroupApiResourceIdentifier> {
    static override entity = "orm-article-groups";
    static override apiResourceType = "articleGroups" as const;

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),

            sequenceNumber: this.number(null)
        };
    }

    declare id: string;
    declare name: string;

    declare sequenceNumber: number;

    static fromApiResponse(resource: ArticleGroupApiResponseResource) {
        return new ArticleGroup({
            id: resource.id,
            name: resource.name
        });
    }
}
