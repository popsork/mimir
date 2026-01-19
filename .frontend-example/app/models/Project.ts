import { BaseModel } from "~/models/BaseModel";

import { Customer, type CustomerApiResponseResource } from "~/models/Customer";
import type { ActivityApiResponseResource } from "~/models/Activity";
import type { ActivityGroupApiResponseResource } from "~/models/ActivityGroup";
import type { ArticleApiResponseResource } from "~/models/Article";
import type { ArticleGroupApiResponseResource } from "~/models/ArticleGroup";

export type ProjectApiResourceIdentifier = { type: "projects", id: string };

export type ProjectApiResponseResource = ProjectApiResourceIdentifier & {
    name: string,
    customer?: { data?: CustomerApiResponseResource },
    activities?: { data?: ActivityApiResponseResource[] },
    activityGroups?: { data?: ActivityGroupApiResponseResource[] },
    articles?: { data?: ArticleApiResponseResource[] },
    articleGroups?: { data?: ArticleGroupApiResponseResource[] },
};
export class Project extends BaseModel<ProjectApiResourceIdentifier> {
    static override entity = "orm-projects";
    static override apiResourceType = "projects" as const;

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),
            customerId: this.string(null),
            customer: this.belongsTo(Customer, "customerId"),

            activityGroupIds: this.attr([]),
            activityIds: this.attr([]),

            articleGroupIds: this.attr([]),
            articleIds: this.attr([]),
        };
    }

    declare id: string;
    declare name: string;
    declare customerId: string;
    declare customer: Customer | null;
    declare activityGroupIds: string[];
    declare activityIds: string[];
    declare articleGroupIds: string[];
    declare articleIds: string[];

    static fromApiResponse(resource: ProjectApiResponseResource) {
        const customerId = resource.customer?.data?.id ?? null;
        const customer = resource.customer?.data ? Customer.fromApiResponse(resource.customer.data) : null;
        const {
            activityGroupIds,
            activityIds,
            articleGroupIds,
            articleIds,
        } = this.buildRelatedIdLists(resource);

        return new Project({
            id: resource.id,
            name: resource.name,
            customerId,
            customer,
            activityGroupIds,
            activityIds,
            articleGroupIds,
            articleIds,
        });
    }

    static buildRelatedIdLists(resource: ProjectApiResponseResource) {
        const idLists = {
            activityGroupIds: [] as string[],
            activityIds: [] as string[],
            articleGroupIds: [] as string[],
            articleIds: [] as string[],
        };

        (resource.activities?.data || []).forEach((relation) => {
            if (relation?.id) {
                idLists.activityIds.push(relation.id);
            }
        });
        (resource.activityGroups?.data || []).forEach((relation) => {
            if (relation?.id) {
                idLists.activityGroupIds.push(relation.id);
            }
        });
        (resource.articles?.data || []).forEach((relation) => {
            if (relation?.id) {
                idLists.articleIds.push(relation.id);
            }
            if (relation?.articleGroup?.data?.id) {
                idLists.articleGroupIds.push(relation.articleGroup.data.id);
            }
        });
        (resource.articleGroups?.data || []).forEach((relation) => {
            if (relation?.id) {
                idLists.articleGroupIds.push(relation.id);
            }
        });

        return idLists;
    }
}
