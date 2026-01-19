import { BaseModel } from "~/models/BaseModel";
import type { UserApiResourceIdentifier } from "~/models/User";

export type ViewApiResourceIdentifier = { type: "views", id: string };

type ViewApiResourceAttributes = {
    name: string,
    view_context: ViewContext,
    view: any, // config
    shortcut: string | null,
    is_default: boolean,
    is_system: boolean, // is sticky
    is_readonly: boolean,
    color: string | null, // tab background color
    order_by: number, // sequence number
};

export type ViewApiResponseResource = ViewApiResourceIdentifier & ViewApiResourceAttributes & {
    user?: { data: UserApiResourceIdentifier | null },
};

export type ViewApiRequestResource = Omit<ViewApiResourceAttributes, "is_readonly"> & {
    id?: string | null,
};

export type ViewConfig = OrderMapViewConfig | TableViewConfig | DashboardChartViewConfig | CalendarViewConfig;

export class View<T extends ViewConfig> extends BaseModel<ViewApiResourceIdentifier> {
    static override entity = "orm-views";

    static override fields() {
        return {
            id: this.string(null),
            context: this.string(null),
            type: this.string(null),
            name: this.string(null),
            shortcut: this.string(null),
            config: this.attr(null),
            isSticky: this.boolean(false),
            isReadonly: this.boolean(null),
            tabBackgroundColor: this.string(null),
            sequenceNumber: this.number(null),
            userId: this.string(null), // we only keep the id for the user as that is the only thing needed for now
            isDirty: this.boolean(false), // local field only for FE for tracking dirty-state
        };
    }

    declare id: string;
    declare context: ViewContext;
    declare type: ViewType;
    declare name: string;
    declare shortcut: string | null;
    declare config: T;
    declare isSticky: boolean;
    declare isReadonly: boolean;
    declare tabBackgroundColor: string | null;
    declare sequenceNumber: number;
    declare userId: string | null;
    declare isDirty: boolean;

    static fromApiResponse(resource: ViewApiResponseResource) {
        const type = resource.is_default ? ViewType.Default : ViewType.Regular;
        const config = this.buildConfig(resource);

        return new View<ViewConfig>({
            id: resource.id,
            context: resource.view_context,
            name: resource.name,
            shortcut: resource.shortcut,
            config,
            type,
            isSticky: resource.is_system,
            isReadonly: resource.is_readonly,
            tabBackgroundColor: resource.color,
            sequenceNumber: resource.order_by,
            userId: resource.user?.data?.id || null,
        });
    }

    static buildConfig(resource: ViewApiResponseResource) {
        const defaultConfig = this.getDefaultConfigForContext(resource.view_context);
        const receivedConfig = !resource.view || Array.isArray(resource.view) ? {} : resource.view;

        return { ...defaultConfig, ...receivedConfig };
    }

    static getDefaultConfigForContext(context: ViewContext): Record<string, any> {
        // this needs to return an object with the minimum required config keys for the given context to work,
        // in case the config coming from the DB is not sufficiently populated.
        // (e.g., freshly seeded views don't contain all the needed keys)
        switch (context) {
            case ViewContext.OrderList:
            case ViewContext.InvoiceableOrderList:
            case ViewContext.SelfBillableOrderList:
            case ViewContext.OrderTemplates:
                return {
                    columns: [],
                    filters: getEmptyFilterExpression()
                };
            case ViewContext.DashboardChart:
                return {
                    filters: getEmptyFilterExpression(),
                };
            case ViewContext.OrderMap:
                return {};
            case ViewContext.OrderCalendar:
                return {};
            default:
                throw new Error(`No default config defined for view context ${context}`);
        }
    }


    toRequestBody(): ViewApiRequestResource {
        return {
            id: this.id,
            name: this.name,
            view_context: this.context,
            shortcut: this.shortcut,
            color: this.tabBackgroundColor,
            order_by: this.sequenceNumber,
            is_system: this.isSticky,
            is_default: this.type === ViewType.Default,
            view: this.config,
        };
    }

    enforceNoShortcutOnSystemViews(): void {
        //
        // System and default views cannot have defined shortcuts (TMS-1267)
        if (this.isSticky || this.type === ViewType.Default) {
            this.shortcut = null;
        }
    }

    static buildBlank(
        { context, name, sequenceNumber }:
        { context: ViewContext, name: string, sequenceNumber: number }
    ) {
        const record = new View();
        record.context = context;
        record.id = generateNewUuid();
        record.name = name;
        record.config = this.getDefaultConfigForContext(context);
        record.sequenceNumber = sequenceNumber;
        return record;
    }
}
