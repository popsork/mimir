export default defineNuxtRouteMiddleware((to) => {
    if (to.name === "orders") {
        return goToRoute({ name: "orders-list" });
    }

    if (to.name === "routes") {
        return goToRoute({ name: "routes-list" });
    }

    if (to.name === "order-templates") {
        return goToRoute({ name: "order-templates-list" });
    }

    if (to.name === "invoicing") {
        return goToRoute({ name: "invoicing-orders" });
    }

    if (to.name === "invoicing-processes") {
        return goToRoute({ name: "invoicing-active-processes" });
    }

    if (to.name === "self-billing") {
        return goToRoute({ name: "self-billing-orders" });
    }
});
