import type { SelfBillingPayee, SelfBillingPayeeApiResourceIdentifier, SelfBillingPayeeApiResponseResource } from "~/models/SelfBillingPayee";
import type { Unit, UnitApiResourceIdentifier, UnitApiResponseResource } from "~/models/Unit";

// Payee is not actually a separate model,
// but one of two models: Unit and SelfBillingPayee - a payee can be either of those,
// and it does not have anything additional on top of those.

// this file only defines the types which help with not repeating both units and self-billing payees everywhere

export type Payee = Unit | SelfBillingPayee;

export type PayeeApiResourceIdentifier = UnitApiResourceIdentifier | SelfBillingPayeeApiResourceIdentifier;

export type PayeeApiResponseResource = UnitApiResponseResource | SelfBillingPayeeApiResponseResource;

export type PayeeApiResourceType = PayeeApiResourceIdentifier["type"];

