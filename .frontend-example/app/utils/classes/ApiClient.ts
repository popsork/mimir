import Kitsu from "kitsu";
import { AxiosHeaders, type AxiosProgressEvent } from "axios";

import {
    deserialise as deserializeJsonApiResponse,
    error as createKitsuError
} from "kitsu-core";

import type { JsonApiOperation } from "~/models/JsonApiOperation";
import type { ViewApiRequestResource } from "~/models/View";
import type { ActionExecution } from "~/models/ActionExecution";
import { CustomerOrder } from "~/models/CustomerOrder";
import type { OrderInvoiceability } from "~/models/OrderInvoiceability";
import type { TransportOrderPartialApiRequestResource } from "~/models/TransportOrder";
import type { InvoicingProcess, InvoicingProcessStatusChangeApiRequestResource } from "~/models/InvoicingProcess";
import type { BlockedTimePeriod, BlockedTimePeriodPartialApiRequestResource } from "~/models/BlockedTimePeriod";

export type ApiUploadProgressEvent = AxiosProgressEvent;

export class ApiClient {
    config: Configuration;
    client: Kitsu;
    baseUrl: string;

    constructor() {
        this.config = useConfiguration();
        this.baseUrl = `${this.config.apiOrigin}/api/v1`;

        this.client = new Kitsu({
            baseURL: this.baseUrl,
            camelCaseTypes: false,
            pluralize: true,
            resourceCase: "kebab"
        });

        // interceptors are linked by reference, so they get also applied to the same axios instance directly
        this.client.interceptors.request.use((requestConfig) => {
            requestConfig.headers = new AxiosHeaders({
                ...(requestConfig.headers || {}),
                ...this.getAuthorizationAndLanguageHeaders()
            });

            return requestConfig;
        });

        this.client.interceptors.response.use(
            response => response, // successful response scenario
            (error: any) => {
                if (error.isAxiosError) {
                    // mark the error as an API error to avoid having to check for both possible properties
                    error.isApiError = true;
                }
                return Promise.reject(error);
            }
        );
    }

    getAuthorizationAndLanguageHeaders(): Record<string, string> {
        const headers = {} as Record<string, string>;

        headers["Accept-Language"] = getCurrentLocale();
        const authStore = useAuthenticationStore();
        if (authStore.personalAccessToken) {
            headers.Authorization = `Bearer ${authStore.personalAccessToken.value}`;
        }

        return headers;
    }

    request(parameters: Parameters<Kitsu["request"]>[0]) {
        return this.client.request(parameters);
    }

    async modelRequest(
        { url, method, record }:
        { url: string, method: "POST" | "PATCH", record: { toApiRequestResource: () => any } }
    ) {
        // when a model instance needs to be serialized for a request's body using the model's toApiRequestResource(),
        // we need to bypass kitsu's request(), because it will try to re-serialize the body on its own,
        // so we use kitsu's axios.request() directly here, based on what kitsu.request() does internally
        const data = { data: record.toApiRequestResource() };

        return this.rawRequest({ url, method, data });
    }

    async rawRequest(
        { url, method, data, onUploadProgress }:
        {
            url: string,
            method: "POST" | "PATCH",
            data: any,
            onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
        }
    ) {
        const axiosPayload = {
            method,
            url,
            data,
            headers: this.client.headers,
            ...(onUploadProgress ? { onUploadProgress } : {}),
        };

        try {
            const {
                data,
                headers: responseHeaders,
                status
            } = await this.client.axios.request(axiosPayload);

            return {
                ...deserializeJsonApiResponse(data),
                status,
                ...(responseHeaders && Object.keys(responseHeaders).length ? { headers: responseHeaders } : {})
            };
        } catch (error) {
            throw createKitsuError(error);
        }
    }


    async atomicRequest(
        { url, operations, extraHeaders }:
        { url: string, operations: JsonApiOperation[], extraHeaders?: Record<string, string> }
    ) {
        const fullUrl = new URL(`${this.baseUrl}/${url}`);
        const headers: Record<string, string> = {
            "Content-Type": "application/vnd.api+json",
            Accept: "application/vnd.api+json",
            ...this.getAuthorizationAndLanguageHeaders(),
            ...extraHeaders,
        };

        const operationRequestBodies = operations.map(operation => operation.getRequestBody());

        const body = JSON.stringify({ "atomic:operations": operationRequestBodies }, null, 4);

        const response = await fetch(fullUrl, { headers, method: "POST", body });

        let responseOk = response.ok;
        let responseBody: any;
        try {
            // use separate text() and JSON.parse instead of json()
            // so that the raw response body is available for the error object in case JSON parsing fails
            responseBody = await response.text();
            responseBody = JSON.parse(responseBody);
        } catch {
            responseOk = false;
        }

        if (!responseOk) {
            // for non-2XX or invalid responses,
            // construct an error object with a similar structure to the ones thrown by Kitsu / Axios
            const errorResponse = {
                status: response.status,
                data: responseBody,
            };

            const error = new Error(`Atomic request failed`) as any;
            error.isApiError = true;
            error.response = errorResponse;
            throw error;
        }

        const operationResponses = responseBody["atomic:results"].map((result: any) => {
            return deserializeJsonApiResponse(result);
        });

        return operationResponses;
    }

    nonJsonApiRequest({ path, query }: { path: string, query?: { [key: string]: string } }) {
        const url = new URL(`${this.baseUrl}/${path}`);
        if (query) {
            url.search = new URLSearchParams(query).toString();
        }

        return fetch(url, { headers: this.getAuthorizationAndLanguageHeaders() }).then((response) => {
            if (!response.ok || !response.body) {
                throw new Error(`API request failed. URL: ${url}`);
            }
            return response as Response & { body: NonNullable<Response["body"]> };
        });
    }

    getOrderColumns() {
        return this.nonJsonApiRequest({ path: "order-list-columns" });
    }

    getOrderRows() {
        return this.nonJsonApiRequest({
            path: "order-list-rows",
            query: { take: MAX_NUMBER_OF_TABLE_ROWS.toString() }
        });
    }

    includableRouteResources = [
        "routeStatus",
        "routeStops",
        "routeStops.stop",
        "routeStops.destination",
        "routeStops.destination.location",
        "routeStops.transportOrder",
        "unit",
        "schedules",
    ];

    getRoutes(
        { searchQuery, latestFirst, maxNumberOfResults, startFrom, startTill, endFrom, endTill, status }:
        {
            searchQuery?: string,
            latestFirst: boolean,
            maxNumberOfResults?: number,
            startFrom?: string | null,
            startTill?: string | null,
            endFrom?: string | null,
            endTill?: string | null,
            status?: string | null,
        }
    ) {
        const queryParameters = {} as { [key: string]: string };
        queryParameters["include"] = this.includableRouteResources.join(",");

        if (searchQuery && searchQuery.length > 0) {
            queryParameters["filter[search]"] = searchQuery;
        }
        if (startFrom) {
            queryParameters["filter[start_from]"] = startFrom;
        }
        if (startTill) {
            queryParameters["filter[start_till]"] = startTill;
        }
        if (endFrom) {
            queryParameters["filter[end_from]"] = endFrom;
        }
        if (endTill) {
            queryParameters["filter[end_till]"] = endTill;
        }
        if (status) {
            queryParameters["filter[status]"] = status;
        }

        if (maxNumberOfResults !== undefined) {
            queryParameters["page[limit]"] = maxNumberOfResults.toString();
        }

        queryParameters["sort"] = latestFirst ? "-created_at,-id" : "created_at,id";

        const queryString = buildQueryString(queryParameters);

        const url = `routes${queryString}`;

        return this.request({ url: url, type: "routes" });
    }

    getInvoicingOrderColumns() {
        return this.nonJsonApiRequest({ path: "invoiceable-order-list-columns" });
    }

    getInvoicingOrderRows() {
        return this.nonJsonApiRequest({
            path: "invoiceable-order-list-rows",
            query: { take: MAX_NUMBER_OF_TABLE_ROWS.toString() }
        });
    }

    getSelfBillingOrderColumns() {
        return this.nonJsonApiRequest({ path: "self-billable-order-list-columns" });
    }

    getSelfBillingOrderRows() {
        return this.nonJsonApiRequest({
            path: "self-billable-order-list-rows",
            query: { take: MAX_NUMBER_OF_TABLE_ROWS.toString() }
        });
    }

    createPasswordAuthenticationSession({ email, password }: { email: string, password: string }) {
        return this.request({
            method: "POST",
            url: "auth/password-authentication-sessions?include=personalAccessToken,personalAccessToken.user,personalAccessToken.user.roles,personalAccessToken.user.roles.permissions",
            type: "passwordAuthenticationSessions",
            body: { email, password }
        });
    }

    createExternalAuthenticationSession({ authority, callbackUrl }: { authority: string, callbackUrl: string }) {
        return this.request({
            method: "POST",
            url: "auth/external-authentication-sessions?include=personalAccessToken,personalAccessToken.user,personalAccessToken.user.roles,personalAccessToken.user.roles.permissions",
            type: "externalAuthenticationSessions",
            body: { authority, callback_url: callbackUrl }
        });
    }

    updateExternalAuthenticationSession({ id, code }: { id: string, code: string }) {
        const encodedId = encodeURIComponent(id);
        const url = `auth/external-authentication-sessions/${encodedId}?include=personalAccessToken,personalAccessToken.user,personalAccessToken.user.roles,personalAccessToken.user.roles.permissions`;

        return this.request({
            method: "PATCH",
            url,
            type: "externalAuthenticationSessions",
            body: { id, code }
        });
    }

    getPersonalAccessToken(tokenId: string) {
        return this.request({
            method: "GET",
            url: `personal-access-tokens/${encodeURIComponent(tokenId)}?include=user,user.roles,user.roles.permissions`,
            type: "personalAccessTokens"
        });
    }

    destroyPersonalAccessToken(tokenId: string) {
        return this.request({
            method: "DELETE",
            url: `personal-access-tokens/${encodeURIComponent(tokenId)}`,
            type: "personalAccessTokens"
        });
    }

    includableOrderResources = [
        "customer",
        "customer.mainCustomer",
        "contact",
        "agreement",
        "project",
        "project.activityGroups",
        "project.activities",
        "operation",
        "service",
        "cargoType",

        "orderStatuses",

        "orderNotes",
        "additionalServices",

        "stops",
        "stops.destination",
        "stops.destination.location",
        "stops.zone",

        "transportOrders",
        "transportOrders.pickup",
        "transportOrders.delivery",
        "transportOrders.unit",
        "transportOrders.line",
        "transportOrders.operation",
        "transportOrders.transportOrderStage",
        "transportOrders.transportOrderStatus",
        "transportOrders.latestTrackingEvent",

        "specificationRows",
        "specificationRows.startPointDestination",
        "specificationRows.startPointDestination.location",
        "specificationRows.endPointDestination",
        "specificationRows.endPointDestination.location",
        "specificationRows.activity",
        "specificationRows.specificationRowQuantityType",
        "specificationRows.files",

        "specificationSummary",

        "debitRows",
        "debitRows.transportOrder",
        "debitRows.quantityUnit",
        "debitRows.article",
        "debitRows.suggestedArticleGroup",
        "debitRows.article.articleGroup", // if no group is stored on the debit row itself, include it via article
        "debitRows.payee",

        "debitRowSummary",

        "goodsRows",
        "goodsRows.goodsRowQuantityType",
        "goodsRows.dimensionsQuantityUnit",
        "goodsRows.packages",

        "goodsRowSummary",
        "goodsTotalOverride",

        "dangerousGoodsRows",
        "dangerousGoodsRows.goodsRow",
        "dangerousGoodsRows.dangerousGoodsRowSubstanceType",
        "dangerousGoodsRows.dangerousGoodsRowQuantityType",
        "dangerousGoodsRows.wasteCode",
        "dangerousGoodsRows.unitedNationsNumber",

        "documents",
        "documents.documentType",
        "documents.file",

        "deviationRows",
        "deviationRows.deviationCause",
        "deviationRows.deviationType",
        "deviationRows.transportOrder",
        "deviationRows.user",
        "deviationRows.files",

        "schedules",
    ];

    getOrder({ orderId }: { orderId: string }) {
        const encodedOrderId = encodeURIComponent(orderId);

        const queryString = buildQueryString({ include: this.includableOrderResources.join(",") });

        const url = `orders/${encodedOrderId}${queryString}`;
        return this.request({
            url,
            type: "orders"
        });
    }

    deleteOrder({ orderId }: { orderId: string }) {
        const url = `orders/${encodeURIComponent(orderId)}`;
        return this.request({
            method: "DELETE",
            url,
            type: "orders"
        });
    }

    getOrderTemplates() {
        const queryParameters = {} as { [key: string]: string };

        queryParameters["filter[is_template]"] = "1";

        const includableTemplateResources = [
            "customer",
            "customer.mainCustomer",
            "operation",
            "service",
            "orderNotes",
            "stops",
            "schedules"
        ];

        queryParameters["include"] = includableTemplateResources.join(",");

        const queryString = buildQueryString(queryParameters);

        const url = `orders${queryString}`;
        return this.request({
            url,
            type: "orders"
        });
    }


    private getEndpointForSearchScope(scope: SearchScope): string {
        switch (scope) {
            case SearchScope.Articles:
                return "articles";
            case SearchScope.Customers:
                return "customers";
            case SearchScope.Orders:
                return "transport-orders";
            case SearchScope.Specifications:
                return "specification-rows";
            case SearchScope.Deviations:
                return "deviation-rows";
        }
    }

    search({ scope, query, peek = false }: { scope: SearchScope, query: string, peek?: boolean }) {
        const endpoint = this.getEndpointForSearchScope(scope);
        const queryParams: { q: string, peek?: string } = {
            q: query,
        };

        if (peek) {
            queryParams.peek = "1";
        }

        const url = `${endpoint}/search`;
        return this.nonJsonApiRequest({
            path: url,
            query: queryParams
        });
    }

    getCustomers(
        { searchQuery, maxNumberOfResults }:
        { searchQuery: string, maxNumberOfResults?: number }
    ) {
        const queryParameters = {} as { [key: string]: string };

        queryParameters["include"] = "mainCustomer";

        if (searchQuery.length > 0) {
            queryParameters["filter[search]"] = searchQuery;
        }

        if (maxNumberOfResults !== undefined) {
            queryParameters["page[limit]"] = maxNumberOfResults.toString();
        }

        const queryString = buildQueryString(queryParameters);

        const url = `customers${queryString}`;
        return this.request({
            url,
            type: "customers"
        });
    }

    getContacts({ customerId }: { customerId: string }) {
        const encodedCustomerId = encodeURIComponent(customerId);
        const url = `customers/${encodedCustomerId}/contacts?include=customer`;
        return this.request({ url, type: "contacts" });
    }

    getProjects({ customerId }: { customerId: string }) {
        const encodedCustomerId = encodeURIComponent(customerId);
        const include = [
            "customer",
            "activities",
            "activityGroups",
            "articles",
            "articles.articleGroup",
            "articleGroups",
        ].join(",");
        const url = `customers/${encodedCustomerId}/projects?include=${include}`;
        return this.client.request({ url, type: "projects" });
    }

    getAgreements({ customerId }: { customerId: string }) {
        const encodedCustomerId = encodeURIComponent(customerId);
        const url = `customers/${encodedCustomerId}/agreements?include=customer`;
        return this.request({ url, type: "agreements" });
    }

    getOperations() {
        return this.request({ url: "operations", type: "operations" });
    }

    getServices() {
        return this.request({ url: "services?include=operations", type: "services" });
    }

    getCargoTypes() {
        return this.request({ url: "cargo-types", type: "cargoTypes" });
    }

    getBlockedTimeReasons() {
        return this.request({ url: "blocked-time-reasons", type: "blockedTimeReasons" });
    }

    getDestinations(
        { searchQuery, maxNumberOfResults }:
        { searchQuery: string, maxNumberOfResults?: number }
    ) {
        const queryParameters = {
            include: "location",
        } as { [key: string]: string };

        if (searchQuery.length > 0) {
            queryParameters["filter[search]"] = searchQuery;
        }

        if (maxNumberOfResults !== undefined) {
            queryParameters["page[limit]"] = maxNumberOfResults.toString();
        }

        const queryString = buildQueryString(queryParameters);

        const url = `destinations${queryString}`;
        return this.request({
            url,
            type: "destinations"
        });
    }

    getLines() {
        return this.request({ url: "lines", type: "lines" });
    }

    getTransportOrderStages() {
        return this.request({ url: "transport-orders-stages", type: "transportOrderStages" });
    }

    getArticleGroups() {
        return this.request({ url: "article-groups", type: "articleGroups" });
    }

    getArticles(
        { searchQuery, projectId, articleGroupId, maxNumberOfResults }:
        { searchQuery: string, projectId: string | null, articleGroupId: string | null, maxNumberOfResults?: number }
    ) {
        const queryParameters = {
            include: "articleGroup",
        } as { [key: string]: string };

        if (searchQuery.length > 0) {
            queryParameters["filter[search]"] = searchQuery;
        }

        if (projectId !== null) {
            queryParameters["filter[project_id]"] = projectId;
        }

        if (articleGroupId !== null) {
            queryParameters["filter[article_group_id]"] = articleGroupId;
        }

        if (maxNumberOfResults !== undefined) {
            queryParameters["page[limit]"] = maxNumberOfResults.toString();
        }

        const queryString = buildQueryString(queryParameters);

        const url = `articles${queryString}`;
        return this.request({
            url,
            type: "articles"
        });
    }

    getActivities() {
        return this.request({ url: "activities?include=activityGroup", type: "activities" });
    }

    getSpecificationRowQuantityTypes() {
        return this.request({ url: "specification-row-quantity-types", type: "specificationRowQuantityTypes" });
    }

    getGoodsRowQuantityTypes() {
        return this.request({ url: "goods-row-quantity-types", type: "goodsRowQuantityTypes" });
    }

    getDangerousGoodsRowSubstanceTypes() {
        return this.request({ url: "dangerous-goods-row-substance-types", type: "dangerousGoodsRowSubstanceTypes" });
    }

    getDangerousGoodsRowQuantityTypes() {
        return this.request({ url: "dangerous-goods-row-quantity-types", type: "dangerousGoodsRowQuantityTypes" });
    }

    getUnitedNationsNumbers() {
        return this.request({
            url: "united-nations-numbers",
            type: "unitedNationsNumbers",
            params: {
                fields: {
                    unitedNationsNumbers: "name,value,class"
                }
            }
        });
    }

    getWasteCodes() {
        return this.request({ url: "waste-codes", type: "wasteCodes" });
    }

    getDocumentTypes() {
        return this.request({ url: "document-types", type: "documentTypes" });
    }

    getDeviationTypes() {
        return this.request({ url: "deviation-types?include=deviationCauses", type: "deviationTypes" });
    }

    getQuantityUnits() {
        return this.request({ url: "quantity-units", type: "quantityUnits" });
    }

    getUnits(
        { searchQuery, maxNumberOfResults }:
        { searchQuery: string, maxNumberOfResults?: number }
    ) {
        const queryParameters = {} as { [key: string]: string };

        if (searchQuery.length > 0) {
            queryParameters["filter[search]"] = searchQuery;
        }

        if (maxNumberOfResults !== undefined) {
            queryParameters["page[limit]"] = maxNumberOfResults.toString();
        }

        const queryString = buildQueryString(queryParameters);

        const url = `units${queryString}`;
        return this.client.request({
            url,
            type: "units"
        });
    }

    getUnit(unitId: string) {
        const encodedOrderId = encodeURIComponent(unitId);

        const url = `units/${encodedOrderId}`;
        return this.request({
            url,
            type: "units"
        });
    }

    getPayees(
        { searchQuery, maxNumberOfResults }:
        { searchQuery: string, maxNumberOfResults?: number }
    ) {
        const queryParameters = {} as { [key: string]: string };

        if (searchQuery.length > 0) {
            queryParameters["filter[search]"] = searchQuery;
        }

        if (maxNumberOfResults !== undefined) {
            queryParameters["page[limit]"] = maxNumberOfResults.toString();
        }

        const queryString = buildQueryString(queryParameters);

        const url = `payees${queryString}`;
        return this.client.request({
            url,
            // type is actually not needed here,
            // but kitsu's request() type signature incorrectly requires it to always be a string,
            // so just need to put something here, even though the resources won't actually have this type
            type: "payees"
        });
    }

    saveOrder({ action, operations }: { action: OrderAction, operations: JsonApiOperation[] }) {
        const queryString = buildQueryString({ include: this.includableOrderResources.join(",") });
        const url = `orders/atomic${queryString}`;

        const extraHeaders = this.getExtraHeadersForOrderAction(action);

        return this.atomicRequest({
            url,
            operations,
            extraHeaders,
        });
    }

    getExtraHeadersForOrderAction(action: OrderAction) {
        const flagHeaders = [] as string[];

        switch (action) {
            case OrderAction.Calculate:
                flagHeaders.push("X-Dry-Run");
                break;
            case OrderAction.AutoPlan:
                flagHeaders.push("X-Dry-Run");
                flagHeaders.push("X-Auto-Plan");
                break;
        }

        return Object.fromEntries(flagHeaders.map(name => [name, "1"]));
    }


    saveDestination({ operations }: { operations: JsonApiOperation[] }) {
        const queryString = buildQueryString({ include: "location" });
        const url = `orders/atomic${queryString}`;
        return this.atomicRequest({
            url,
            operations
        });
    }

    getViews() {
        const url = `views?include=user`;
        return this.request({
            url,
            type: "views"
        });
    }

    getView(viewId: string) {
        const encodedViewId = encodeURIComponent(viewId);
        return this.request({
            url: `views/${encodedViewId}`,
            type: "views"
        });
    }

    createView({ view }: { view: ViewApiRequestResource }) {
        return this.request({
            method: "POST",
            url: "views",
            type: "views",
            body: view,
        });
    }

    updateView({ view }: { view: ViewApiRequestResource }) {
        return this.request({
            method: "PATCH",
            url: `views/${encodeURIComponent(view.id!)}`,
            type: "views",
            body: view,
        });
    }

    deleteView(viewId: string) {
        return this.request({
            method: "DELETE",
            url: `views/${viewId}`,
            type: "views",
        });
    }

    upsertView({ view }: { view: ViewApiRequestResource }) {
        return this.client.request({
            method: "PUT",
            url: `views/${encodeURIComponent(view.id!)}`,
            type: "views",
            body: view,
        });
    }

    getActions() {
        return this.request({ url: "actions", type: "actions" });
    }

    saveActionExecutions({ operations }: { operations: JsonApiOperation[] }) {
        const queryString = buildQueryString({ include: "action,actionable" });
        const url = `action-executions/atomic${queryString}`;

        return this.atomicRequest({
            url,
            operations,
        });
    }

    createActionExecution(actionExecution: ActionExecution) {
        return this.modelRequest({
            method: "POST",
            url: "action-executions?include=action,actionable",
            record: actionExecution,
        });
    }

    createOrderStatus({ orderId, status }: { orderId: string, status: string }) {
        // do not use this method as an example, as this is used only for a temporary workaround button
        // since we do not have a model for OrderStatus.
        // the construction of the resource body should normally go through the model and use modelRequest().
        const resource = {
            type: "orderStatuses",
            attributes: {
                name: status,
            },
            relationships: {
                order: {
                    data: CustomerOrder.getApiResourceIdentifier(orderId),
                },
            },
        };
        return this.rawRequest({
            method: "POST",
            url: "order-statuses",
            data: { data: resource },
        });
    }

    getOrderAuditEntries({ orderId }: { orderId: string }) {
        const encodedOrderId = encodeURIComponent(orderId);
        const url = `orders/${encodedOrderId}/audits?include=user`;
        return this.request({ url, type: "audits" });
    }

    createOrderInvoiceability(orderInvoiceability: OrderInvoiceability) {
        return this.modelRequest({
            method: "POST",
            url: "order-invoiceabilities",
            record: orderInvoiceability,
        });
    }

    createWaybill() {
        return this.request({
            method: "POST",
            url: "waybills",
            type: "waybills",
            body: {}
        });
    }

    getInvoicingProfiles() {
        return this.request({ url: "invoice-profiles", type: "invoiceProfiles" });
    }

    createInvoicingProcess(invoicingProcess: InvoicingProcess) {
        return this.modelRequest({
            method: "POST",
            url: "invoice-processes",
            record: invoicingProcess,
        });
    }

    getInvoicingProcesses(
        { active, latestFirst, maxNumberOfResults }:
        { active: boolean, latestFirst: boolean, maxNumberOfResults?: number }
    ) {
        const queryParameters = {
            include: "steps",
            "filter[is_active]": (active) ? "1" : "0",
            "sort": (latestFirst) ? "-created_at,-id" : "created_at,id",
        } as { [key: string]: string | string[] };

        if (maxNumberOfResults !== undefined) {
            queryParameters["page[limit]"] = maxNumberOfResults.toString();
        }

        const queryString = buildQueryString(queryParameters);

        const url = `invoice-processes${queryString}`;

        return this.request({
            url,
            type: "invoiceProcesses"
        });
    }

    getInvoicingProcess({ processId }: { processId: string }) {
        const encodedProcessId = encodeURIComponent(processId);

        const queryString = buildQueryString({ include: "steps,user,invoices,logs" });

        const url = `invoice-processes/${encodedProcessId}${queryString}`;
        return this.request({
            url,
            type: "invoiceProcesses"
        });
    }

    updateInvoicingProcess(resource: InvoicingProcessStatusChangeApiRequestResource) {
        return this.rawRequest({
            method: "PATCH",
            url: `invoice-processes/${encodeURIComponent(resource.id)}`,
            data: { data: resource },
        });
    }

    updateTransportOrder(partialResource: TransportOrderPartialApiRequestResource) {
        return this.rawRequest({
            method: "PATCH",
            url: `transport-orders/${encodeURIComponent(partialResource.id)}`,
            data: { data: partialResource },
        });
    }

    getTransportOrder(transportOrderId: string) {
        return this.request({
            url: `transport-orders/${encodeURIComponent(transportOrderId)}?include=operation,unit`,
            type: "transportOrders",
        });
    }

    includableBlockedTimePeriodResources = ["unit", "blockedTimeReason"];

    getBlockedTimePeriods(
        { unitIds, from, till }:
        { unitIds: string[], from: string | null, till: string | null }
    ) {
        const queryParameters = {
            include: this.includableBlockedTimePeriodResources.join(","),
            "filter[unit.id][]": unitIds,
        } as { [key: string]: string | string[] };

        if (from) {
            queryParameters["filter[from]"] = from;
        }

        if (till) {
            queryParameters["filter[till]"] = till;
        }

        const queryString = buildQueryString(queryParameters);

        const url = `blocked-time-periods${queryString}`;

        return this.request({
            url,
            type: "blockedTimePeriods"
        });
    }

    createBlockedTimePeriod(blockedTimePeriod: BlockedTimePeriod) {
        const queryString = buildQueryString({ include: this.includableBlockedTimePeriodResources.join(",") });

        return this.modelRequest({
            method: "POST",
            url: `blocked-time-periods${queryString}`,
            record: blockedTimePeriod,
        });
    }

    destroyBlockedTimePeriod(id: string) {
        return this.request({
            method: "DELETE",
            url: `blocked-time-periods/${encodeURIComponent(id)}`,
            type: "blockedTimePeriods"
        });
    }

    updateBlockedTimePeriod(partialResource: BlockedTimePeriodPartialApiRequestResource) {
        const queryString = buildQueryString({ include: this.includableBlockedTimePeriodResources.join(",") });
        return this.rawRequest({
            method: "PATCH",
            url: `blocked-time-periods/${encodeURIComponent(partialResource.id)}${queryString}`,
            data: { data: partialResource },
        });
    }

    getRouteSettings() {
        return this.request({ url: "routes-settings", type: "routeSettings" });
    }

    getRoute({ routeId }: { routeId: string }) {
        const encodedRouteId = encodeURIComponent(routeId);

        const queryString = buildQueryString({ include: this.includableRouteResources.join(",") });

        const url = `routes/${encodedRouteId}${queryString}`;
        return this.request({
            url,
            type: "routes"
        });
    }

    saveRoute({ operations }: { operations: JsonApiOperation[] }) {
        const queryString = buildQueryString({ include: this.includableRouteResources.join(",") });
        const url = `routes/atomic${queryString}`;

        return this.atomicRequest({
            url,
            operations,
        });
    }

    createFile(
        { formData, onUploadProgress }:
        {
            formData: FormData,
            onUploadProgress?: (progressEvent: ApiUploadProgressEvent) => void,
        }
    ) {
        return this.rawRequest({
            url: "files",
            method: "POST",
            data: formData,
            onUploadProgress,
        });
    }

}
