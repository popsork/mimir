import { BaseModel } from "~/models/BaseModel";

import { SpecificationRowQuantityType, type SpecificationRowQuantityTypeApiResourceIdentifier, type SpecificationRowQuantityTypeApiResponseResource } from "~/models/SpecificationRowQuantityType";
import { Activity, type ActivityApiResourceIdentifier, type ActivityApiResponseResource } from "~/models/Activity";
import { CustomerOrder, type CustomerOrderApiResourceIdentifier } from "~/models/CustomerOrder";
import { Destination, type DestinationApiResourceIdentifier, type DestinationApiResponseResource } from "~/models/Destination";
import { FileModel, type FileApiResourceIdentifier, type FileApiResponseResource } from "~/models/FileModel";

export type SpecificationRowApiResourceIdentifier = { type: "specificationRows", id: string };

type SpecificationRowApiResourceAttributes = {
    order_by: number, // sequence number

    started_at: string | null,
    ended_at: string | null,

    // this value is duplicated from destination
    start_point_name: string | null,

    // these values are duplicated from destination->location
    start_point_street_name: string | null,
    start_point_street_number: string | null,
    start_point_postal_code: string | null,
    start_point_city: string | null,
    start_point_country: string | null,
    start_point_latitude: number | null, // float, up to 7 decimal places expected
    start_point_longitude: number | null, // float, up to 7 decimal places expected
    start_point_accuracy: LocationAccuracy | null,

    // this value is duplicated from destination
    end_point_name: string | null,

    // these values are duplicated from destination->location
    end_point_street_name: string | null,
    end_point_street_number: string | null,
    end_point_postal_code: string | null,
    end_point_city: string | null,
    end_point_country: string | null,
    end_point_latitude: number | null, // float, up to 7 decimal places expected
    end_point_longitude: number | null, // float, up to 7 decimal places expected
    end_point_accuracy: LocationAccuracy | null,

    notes: string | null,
    receipt_number: string | null,

    quantity: number | null, // integer, precision in separate attribute
    quantity_precision: number | null, // integer

    hours: number | null, // integer, precision in separate attribute
    hours_precision: number | null, // integer

    activity_name_override: string | null,
};

export type SpecificationRowApiRequestResource = SpecificationRowApiResourceIdentifier & {
    attributes: SpecificationRowApiResourceAttributes,
    relationships: {
        order?: { data: CustomerOrderApiResourceIdentifier | null },
        startPointDestination?: { data: DestinationApiResourceIdentifier | null },
        endPointDestination?: { data: DestinationApiResourceIdentifier | null },
        activity?: { data: ActivityApiResourceIdentifier | null },
        specificationRowQuantityType?: { data: SpecificationRowQuantityTypeApiResourceIdentifier | null },
        files?: { data: FileApiResourceIdentifier[] },
    },
};

export type SpecificationRowApiResponseResource = SpecificationRowApiResourceIdentifier & SpecificationRowApiResourceAttributes & {
    startPointDestination?: { data?: DestinationApiResponseResource },
    endPointDestination?: { data?: DestinationApiResponseResource },
    activity?: { data?: ActivityApiResponseResource },
    specificationRowQuantityType: { data?: SpecificationRowQuantityTypeApiResponseResource },
    files?: { data?: FileApiResponseResource[] },
};

export type SpecificationRowApiResourceFieldName = Exclude<keyof SpecificationRowApiResponseResource, "id" | "type">;


export class SpecificationRow extends BaseModel<SpecificationRowApiResourceIdentifier> {
    static override entity = "orm-specification-rows";
    static override apiResourceType = "specificationRows" as const;

    static override fields() {
        return {
            id: this.string(null),
            sequenceNumber: this.number(null),

            startedAt: this.string(null),
            endedAt: this.string(null),

            startPointDestinationId: this.string(null),
            startPointDestination: this.belongsTo(Destination, "startPointDestinationId"),
            startPointName: this.string(null),
            startPointStreetName: this.string(null),
            startPointStreetNumber: this.string(null),
            startPointPostalCode: this.string(null),
            startPointCity: this.string(null),
            startPointCountry: this.string(null),
            startPointLatitude: this.number(null),
            startPointLongitude: this.number(null),
            startPointAccuracy: this.string(null),

            endPointDestinationId: this.string(null),
            endPointDestination: this.belongsTo(Destination, "endPointDestinationId"),
            endPointName: this.string(null),
            endPointStreetName: this.string(null),
            endPointStreetNumber: this.string(null),
            endPointPostalCode: this.string(null),
            endPointCity: this.string(null),
            endPointCountry: this.string(null),
            endPointLatitude: this.number(null),
            endPointLongitude: this.number(null),
            endPointAccuracy: this.string(null),

            activityId: this.string(null),
            activity: this.belongsTo(Activity, "activityId"),
            activityNameOverride: this.string(null),

            notes: this.string(null),
            receiptNumber: this.string(null),

            quantity: this.number(null),
            quantityPrecision: this.number(null),

            hours: this.number(null),
            hoursPrecision: this.number(null),

            quantityTypeId: this.string(null),
            quantityType: this.belongsTo(SpecificationRowQuantityType, "quantityTypeId"),

            customerOrderId: this.string(null),

            // files are not added as hasMany here, because they don't have an owner ID
            // and are simply loaded into the array without pinia-orm knowing any relationships
            files: this.attr([]),
        };
    }

    declare id: string;

    declare sequenceNumber: number;

    declare startedAt: string | null;
    declare endedAt: string | null;

    declare startPointDestinationId: string | null;
    declare startPointDestination: Destination | null;
    declare startPointName: string | null;
    declare startPointStreetName: string | null;
    declare startPointStreetNumber: string | null;
    declare startPointPostalCode: string | null;
    declare startPointCity: string | null;
    declare startPointCountry: string | null;
    declare startPointLatitude: number | null;
    declare startPointLongitude: number | null;
    declare startPointAccuracy: LocationAccuracy | null;

    declare endPointDestinationId: string | null;
    declare endPointDestination: Destination | null;
    declare endPointName: string | null;
    declare endPointStreetName: string | null;
    declare endPointStreetNumber: string | null;
    declare endPointPostalCode: string | null;
    declare endPointCity: string | null;
    declare endPointCountry: string | null;
    declare endPointLatitude: number | null;
    declare endPointLongitude: number | null;
    declare endPointAccuracy: LocationAccuracy | null;

    declare activityId: string | null;
    declare activity: Activity | null;
    declare activityNameOverride: string | null;

    declare notes: string | null;
    declare receiptNumber: string | null;

    declare quantity: number | null;
    declare quantityPrecision: number | null;

    declare quantityTypeId: string | null;
    declare quantityType: SpecificationRowQuantityType | null;

    declare hours: number | null;
    declare hoursPrecision: number | null;

    declare customerOrderId: string;
    declare files: FileModel[] | null;

    static buildBlank(
        { customerOrderId, sequenceNumber }:
        { customerOrderId: string, sequenceNumber: number }
    ) {
        const record = new SpecificationRow();
        record.id = generateNewUuid();
        record.customerOrderId = customerOrderId;
        record.sequenceNumber = sequenceNumber;
        return record;
    }

    static fromApiResponse(resource: SpecificationRowApiResponseResource) {

        const files = Array.isArray(resource.files?.data)
            ? resource.files.data.map((relatedResource) => {
                const record = FileModel.fromApiResponse(relatedResource);
                return record;
            })
            : null
        ;

        return new SpecificationRow({
            id: resource.id,
            sequenceNumber: resource.order_by,
            startedAt: getUtcDatetimeString(resource.started_at),
            endedAt: getUtcDatetimeString(resource.ended_at),

            startPointDestinationId: resource.startPointDestination?.data?.id ?? null,
            startPointDestination: resource.startPointDestination?.data ? Destination.fromApiResponse(resource.startPointDestination.data) : null,
            startPointName: resource.start_point_name,
            startPointStreetName: resource.start_point_street_name,
            startPointStreetNumber: resource.start_point_street_number,
            startPointPostalCode: resource.start_point_postal_code,
            startPointCity: resource.start_point_city,
            startPointCountry: resource.start_point_country,
            startPointLatitude: resource.start_point_latitude,
            startPointLongitude: resource.start_point_longitude,
            startPointAccuracy: resource.start_point_accuracy,

            endPointDestinationId: resource.endPointDestination?.data?.id ?? null,
            endPointDestination: resource.endPointDestination?.data ? Destination.fromApiResponse(resource.endPointDestination.data) : null,
            endPointName: resource.end_point_name,
            endPointStreetName: resource.end_point_street_name,
            endPointStreetNumber: resource.end_point_street_number,
            endPointPostalCode: resource.end_point_postal_code,
            endPointCity: resource.end_point_city,
            endPointCountry: resource.end_point_country,
            endPointLatitude: resource.end_point_latitude,
            endPointLongitude: resource.end_point_longitude,
            endPointAccuracy: resource.end_point_accuracy,

            activityId: resource.activity?.data?.id ?? null,
            activity: resource.activity?.data ? Activity.fromApiResponse(resource.activity.data) : null,
            activityNameOverride: resource.activity_name_override,

            notes: resource.notes,
            receiptNumber: resource.receipt_number,

            quantity: resource.quantity,
            quantityPrecision: resource.quantity_precision,
            quantityTypeId: resource.specificationRowQuantityType?.data?.id ?? null,
            quantityType: resource.specificationRowQuantityType?.data ? SpecificationRowQuantityType.fromApiResponse(resource.specificationRowQuantityType.data) : null,
            hours: resource.hours,
            hoursPrecision: resource.hours_precision,

            files,
        });
    }

    toApiRequestResource() {
        const resource: SpecificationRowApiRequestResource = {
            ...(SpecificationRow.getApiResourceIdentifier(this.id)!),
            attributes: {
                order_by: this.sequenceNumber,

                started_at: getSystemTimeZoneDatetimeString(this.startedAt),
                ended_at: getSystemTimeZoneDatetimeString(this.endedAt),

                start_point_name: this.startPointName,
                start_point_street_name: this.startPointStreetName,
                start_point_street_number: this.startPointStreetNumber,
                start_point_postal_code: this.startPointPostalCode,
                start_point_city: this.startPointCity,
                start_point_country: this.startPointCountry,
                start_point_latitude: this.startPointLatitude,
                start_point_longitude: this.startPointLongitude,
                start_point_accuracy: this.startPointAccuracy,

                end_point_name: this.endPointName,
                end_point_street_name: this.endPointStreetName,
                end_point_street_number: this.endPointStreetNumber,
                end_point_postal_code: this.endPointPostalCode,
                end_point_city: this.endPointCity,
                end_point_country: this.endPointCountry,
                end_point_latitude: this.endPointLatitude,
                end_point_longitude: this.endPointLongitude,
                end_point_accuracy: this.endPointAccuracy,

                notes: this.notes,
                receipt_number: this.receiptNumber,
                quantity: this.quantity,
                quantity_precision: this.quantityPrecision,
                hours: this.hours,
                hours_precision: this.hoursPrecision,
                activity_name_override: this.activityNameOverride,
            },
            relationships: {
                order: { data: CustomerOrder.getApiResourceIdentifier(this.customerOrderId) },
                startPointDestination: { data: Destination.getApiResourceIdentifier(this.startPointDestinationId) },
                endPointDestination: { data: Destination.getApiResourceIdentifier(this.endPointDestinationId) },
                activity: { data: Activity.getApiResourceIdentifier(this.activityId) },
                specificationRowQuantityType: { data: SpecificationRowQuantityType.getApiResourceIdentifier(this.quantityTypeId) },
            }
        };

        if (this.files !== null) {
            resource.relationships.files = { data: this.files.map(file => FileModel.getApiResourceIdentifier(file.id)! ) };
        }

        return resource;
    }
}
