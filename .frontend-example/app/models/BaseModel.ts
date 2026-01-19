import { Model } from "pinia-orm";

export type ModelEntityName<M extends typeof Model> = M["entity"];
export type ModelEntityNames<T extends readonly typeof Model[]> = T[number]["entity"];


export abstract class BaseModel<TIdentifier extends { type: string, id: string }> extends Model {
    declare id: string;


    // subclasses must override this literal in their class
    // and set it to a const value matching the fixed type string in that model's resource identifier type
    static apiResourceType: string;

    // this returns either an identifier object like { type: "orders", id: "123" } or null,
    // depending on whether an id is present
    static getApiResourceIdentifier<K extends string>(
        this: { apiResourceType: K },
        id: string | null
    ): { type: K, id: string } | null {
        if (!id) {
            return null;
        }
        return { type: this.apiResourceType, id };
    }

    // this is a bit tricky, because we need to use the static method of the subclass,
    // so narrow the subclass definition down to explicitly indicate that it has the static method
    // and that the static method actually returns the correct type
    getApiResourceIdentifier(): TIdentifier {
        type NarrowedSubClassType = typeof BaseModel & {
            apiResourceType: TIdentifier["type"],
            getApiResourceIdentifier(id: string | null): { type: TIdentifier["type"], id: string } | null,
        };

        const subClass = this.constructor as NarrowedSubClassType;

        // at runtime this is safe, because apiResourceType really is TIdentifier["type"] and an id is always present
        return subClass.getApiResourceIdentifier(this.id)! as TIdentifier;
    }

    clone(): this {
        const constructor = this.constructor as typeof BaseModel;
        const newInstance = new (constructor as any)();

        const fields = (constructor as typeof BaseModel).fields();
        for (const key of Object.keys(fields)) {
            const value = (this as any)[key];

            if (value instanceof BaseModel) {
                (newInstance as any)[key] = value.clone();
            } else if (Array.isArray(value)) {
                (newInstance as any)[key] = value.map(item =>
                    item instanceof BaseModel ? item.clone() : clone(item)
                );
            } else {
                (newInstance as any)[key] = clone(value);
            }
        }

        return newInstance as this;
    }
}

