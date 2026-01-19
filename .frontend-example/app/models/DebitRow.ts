import { BaseModel } from "~/models/BaseModel";

import { Article, type ArticleApiResourceIdentifier, type ArticleApiResponseResource } from "~/models/Article";
import { TransportOrder, type TransportOrderApiResourceIdentifier, type TransportOrderApiResponseResource } from "~/models/TransportOrder";
import { ArticleGroup, type ArticleGroupApiResourceIdentifier, type ArticleGroupApiResponseResource } from "~/models/ArticleGroup";
import { QuantityUnit, type QuantityUnitApiResourceIdentifier, type QuantityUnitApiResponseResource } from "~/models/QuantityUnit";
import { Unit } from "~/models/Unit";
import { CustomerOrder, type CustomerOrderApiResourceIdentifier } from "~/models/CustomerOrder";
import { SelfBillingPayee } from "~/models/SelfBillingPayee";
import type { Payee, PayeeApiResourceIdentifier, PayeeApiResourceType, PayeeApiResponseResource } from "~/models/Payee";

export type DebitRowApiResourceIdentifier = { type: "debitRows", id: string };

type DebitRowApiResourceAttributes = {
    order_by: number, // sequence number
    debit_row_type: DebitRowType,

    specification: string | null,
    specification_is_manual: boolean,

    quantity: number | null, // integer, precision in separate attribute
    quantity_precision: number | null, // integer
    quantity_is_manual: boolean,

    price: number | null, // integer, precision in separate attribute, calculated value indicates major units
    price_precision: number | null, // integer
    price_is_manual: boolean,
    price_source: string | null,

    discount: number | null, // integer, percentage, 100ths of a percent (0-10_000, 100 means 1%)
    discount_is_manual: boolean,

    total_price: number | null, // integer, precision in separate attribute, calculated value indicates major units
    total_price_precision: number | null, // integer
    total_price_is_manual: boolean,

    commission: number | null, // integer, percentage, 100ths of a percent (0-10_000, 100 means 1%)
    commission_is_manual: boolean,

    article_id_is_manual: boolean,
    article_group_id_is_manual: boolean,

    quantity_unit_id_is_manual: boolean,
    payee_id_is_manual: boolean,

    //
    // in reality a relation, but we just need to pass them back and fourth
    // so that backend can keep track of parents when creating new DebitRows
    // during dry runs.
    parent_id: string | null,

    price_type: string | null,

    // these do not contain a reference to a related API resource, and therefore are not implemented as a relationship,
    // but are included as attributes instead.
    // frontend is not using them, they just need to be passed back to the API if the backend has assigned them
    origin_id: string | null,
    origin_type: string | null,
};

// price source is never sent in the request, as it is always displayed as read only
type DebitRowApiRequestResourceAttributes = Omit<DebitRowApiResourceAttributes, "price_source">;


export type DebitRowApiRequestResource = DebitRowApiResourceIdentifier & {
    attributes: DebitRowApiRequestResourceAttributes,
    relationships: {
        order?: { data: CustomerOrderApiResourceIdentifier | null },
        transportOrder?: { data: TransportOrderApiResourceIdentifier | null },
        article?: { data: ArticleApiResourceIdentifier | null },
        suggestedArticleGroup?: { data: ArticleGroupApiResourceIdentifier | null },
        quantityUnit?: { data: QuantityUnitApiResourceIdentifier | null },
        payee?: { data: PayeeApiResourceIdentifier | null },
    },
};

export type DebitRowApiResponseResource = DebitRowApiResourceIdentifier & DebitRowApiResourceAttributes & {
    transportOrder: { data?: TransportOrderApiResponseResource },
    article?: { data?: ArticleApiResponseResource },
    suggestedArticleGroup?: { data?: ArticleGroupApiResponseResource },
    quantityUnit?: { data?: QuantityUnitApiResponseResource },
    payee?: { data?: PayeeApiResponseResource },
};

export type DebitRowApiResourceFieldName = Exclude<keyof DebitRowApiResponseResource, "id" | "type">;


export class DebitRow extends BaseModel<DebitRowApiResourceIdentifier> {
    static override entity = "orm-debit-rows";
    static override apiResourceType = "debitRows" as const;

    static override fields() {
        return {
            id: this.string(null),
            transportOrderId: this.string(null),
            transportOrder: this.belongsTo(TransportOrder, "transportOrderId"),

            sequenceNumber: this.number(null),
            debitRowType: this.string(null),

            articleGroupId: this.string(null),
            articleGroupIdIsManual: this.boolean(false),
            articleGroup: this.belongsTo(ArticleGroup, "articleGroupId"),

            articleId: this.string(null),
            articleIdIsManual: this.boolean(false),
            article: this.belongsTo(Article, "articleId"),

            specification: this.string(null),
            specificationIsManual: this.boolean(false),

            quantity: this.number(null),
            quantityPrecision: this.number(null),
            quantityIsManual: this.boolean(false),

            quantityUnitId: this.string(null),
            quantityUnitIdIsManual: this.boolean(false),
            quantityUnit: this.belongsTo(QuantityUnit, "quantityUnitId"),

            price: this.number(null),
            pricePrecision: this.number(null),
            priceIsManual: this.boolean(false),
            priceSource: this.string(null),

            discount: this.number(null),
            discountIsManual: this.boolean(false),

            totalPrice: this.number(null),
            totalPricePrecision: this.number(null),
            totalPriceIsManual: this.boolean(false),

            commission: this.number(null),
            commissionIsManual: this.boolean(false),

            payeeId: this.string(null),
            payeeIdIsManual: this.boolean(false),
            payeeResourceType: this.string(null),

            // pinia-orm's polymorphic relationship doesn't work here for some reason, so define it as a basic attribute
            payee: this.attr(null),

            parentId: this.string(null),

            priceType: this.string(null),

            originId: this.string(null),
            originType: this.string(null),

            customerOrderId: this.string(null),
        };
    }

    declare id: string;

    declare transportOrderId: string | null;
    declare transportOrder: TransportOrder | null;

    declare sequenceNumber: number;
    declare debitRowType: DebitRowType;

    declare articleGroupId: string | null;
    declare articleGroupIdIsManual: boolean;
    declare articleGroup: ArticleGroup | null;

    declare articleId: string | null;
    declare articleIdIsManual: boolean;
    declare article: Article | null;

    declare specification: string | null;
    declare specificationIsManual: boolean;

    declare quantity: number | null;
    declare quantityPrecision: number | null;
    declare quantityIsManual: boolean;

    declare quantityUnitId: string | null;
    declare quantityUnitIdIsManual: boolean;
    declare quantityUnit: QuantityUnit | null;

    declare price: number | null;
    declare pricePrecision: number | null;
    declare priceIsManual: boolean;
    declare priceSource: string | null;

    declare discount: number | null;
    declare discountIsManual: boolean;

    declare totalPrice: number | null;
    declare totalPricePrecision: number | null;
    declare totalPriceIsManual: boolean;

    declare commission: number | null;
    declare commissionIsManual: boolean;

    declare payeeId: string | null;
    declare payeeIdIsManual: boolean;
    declare payeeResourceType: PayeeApiResourceType | null;
    declare payee: Payee | null;

    declare parentId: string | null;

    declare priceType: string | null;

    declare originId: string | null;
    declare originType: string | null;

    declare customerOrderId: string;

    static buildBlank(
        { customerOrderId, debitRowType, transportOrderId, sequenceNumber }:
        { customerOrderId: string, debitRowType: DebitRowType, transportOrderId: string | null, sequenceNumber: number }
    ) {
        const record = new DebitRow();
        record.id = generateNewUuid();
        record.customerOrderId = customerOrderId;
        record.debitRowType = debitRowType;
        record.transportOrderId = transportOrderId;
        record.sequenceNumber = sequenceNumber;
        return record;
    }

    static fromApiResponse(resource: DebitRowApiResponseResource) {
        const articleId = resource.article?.data?.id ?? null;
        const article = resource.article?.data ? Article.fromApiResponse(resource.article.data) : null;
        const articleIdIsManual = resource.article_id_is_manual;

        // article group should mainly be taken through the article relationsip, if present
        let articleGroupId = article?.groupId ?? null;
        let articleGroup = article?.group ?? null;
        let articleGroupIdIsManual = articleIdIsManual;

        // if group cannot be taken through article relationship, take it from suggestedArticleGroup relationship
        // this should only be a fallback in case article relationship is not present.
        // this is needed to preserve the article group field value when either only a group is suggested by the backend,
        // or when the user manually selects a group but no article (yet)
        if (!articleGroupId) {
            articleGroupId = resource.suggestedArticleGroup?.data?.id ?? null;
            articleGroup = resource.suggestedArticleGroup?.data ? ArticleGroup.fromApiResponse(resource.suggestedArticleGroup.data) : null;
            articleGroupIdIsManual = resource.article_group_id_is_manual;
        }

        // payee relationship can contain either a Unit or a SelfBillingPayee
        let payeeId = null;
        let payeeResourceType: DebitRow["payeeResourceType"] = null;
        let payee: DebitRow["payee"] = null;

        if (resource.payee?.data) {
            switch (resource.payee?.data?.type) {
                case Unit.apiResourceType:
                    payee = Unit.fromApiResponse(resource.payee.data);
                    break;
                case SelfBillingPayee.apiResourceType:
                    payee = SelfBillingPayee.fromApiResponse(resource.payee.data);
                    break;
            }
            if (payee) {
                payeeId = payee.id;
                payeeResourceType = resource.payee.data.type;
            }
        }

        return new DebitRow({
            id: resource.id,

            transportOrderId: resource.transportOrder?.data?.id ?? null,
            transportOrder: resource.transportOrder?.data ? TransportOrder.fromApiResponse(resource.transportOrder.data) : null,

            sequenceNumber: resource.order_by,
            debitRowType: resource.debit_row_type,

            articleGroupId,
            articleGroupIdIsManual,
            articleGroup,

            articleId,
            articleIdIsManual,
            article,

            specification: resource.specification,
            specificationIsManual: resource.specification_is_manual,

            quantity: resource.quantity,
            quantityPrecision: resource.quantity_precision,
            quantityIsManual: resource.quantity_is_manual,

            quantityUnitId: resource.quantityUnit?.data?.id ?? null,
            quantityUnitIdIsManual: resource.quantity_unit_id_is_manual,
            quantityUnit: resource.quantityUnit?.data ? QuantityUnit.fromApiResponse(resource.quantityUnit.data) : null,

            price: resource.price,
            pricePrecision: resource.price_precision,
            priceIsManual: resource.price_is_manual,
            priceSource: resource.price_source,

            discount: resource.discount,
            discountIsManual: resource.discount_is_manual,

            totalPrice: resource.total_price,
            totalPricePrecision: resource.total_price_precision,
            totalPriceIsManual: resource.total_price_is_manual,

            commission: resource.commission,
            commissionIsManual: resource.commission_is_manual,

            payeeId,
            payeeIdIsManual: resource.payee_id_is_manual,
            payeeResourceType,
            payee,

            parentId: resource.parent_id,
            priceType: resource.price_type,

            originId: resource.origin_id,
            originType: resource.origin_type,
        });
    }

    toApiRequestResource(): DebitRowApiRequestResource {
        return {
            ...(DebitRow.getApiResourceIdentifier(this.id)!),
            attributes: {
                order_by: this.sequenceNumber,
                debit_row_type: this.debitRowType,

                specification: this.specification,
                specification_is_manual: this.specificationIsManual,

                quantity: this.quantity,
                quantity_precision: this.quantityPrecision,
                quantity_is_manual: this.quantityIsManual,

                price: this.price,
                price_precision: this.pricePrecision,
                price_is_manual: this.priceIsManual,

                discount: this.discount,
                discount_is_manual: this.discountIsManual,

                total_price: this.totalPrice,
                total_price_precision: this.totalPricePrecision,
                total_price_is_manual: this.totalPriceIsManual,

                commission: this.commission,
                commission_is_manual: this.commissionIsManual,

                article_id_is_manual: this.articleIdIsManual,
                article_group_id_is_manual: this.articleGroupIdIsManual,
                quantity_unit_id_is_manual: this.quantityUnitIdIsManual,
                payee_id_is_manual: this.payeeIdIsManual,

                parent_id: this.parentId,
                price_type: this.priceType,
                origin_id: this.originId,
                origin_type: this.originType,
            },
            relationships: {
                order: { data: CustomerOrder.getApiResourceIdentifier(this.customerOrderId) },
                transportOrder: { data: TransportOrder.getApiResourceIdentifier(this.transportOrderId) },
                article: { data: Article.getApiResourceIdentifier(this.articleId) },
                suggestedArticleGroup: { data: ArticleGroup.getApiResourceIdentifier(this.articleGroupId) },
                quantityUnit: { data: QuantityUnit.getApiResourceIdentifier(this.quantityUnitId) },
                payee: { data: (this.payeeId && this.payeeResourceType) ? { type: this.payeeResourceType, id: this.payeeId } : null },
            }
        };
    }
}
