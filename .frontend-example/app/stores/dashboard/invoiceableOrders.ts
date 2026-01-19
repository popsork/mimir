import type { Locale } from "date-fns";
import { add, addDays, format, isAfter, isToday, isTomorrow, startOfDay } from "date-fns";
import { enUS, sv } from "date-fns/locale";

const OVERDUE = "overdue";
type InvoiceableDateOrOverdue = Date | typeof OVERDUE;
type OrderRowsOnInvoiceableDate = { invoiceableDateSystemOrOverdue: InvoiceableDateOrOverdue, orderRows: OrderRow[] };
type MappedInviceableOrderRows = Map<string, OrderRowsOnInvoiceableDate>;

export type DashboardInvoiceableOrdersSummaryForDate = {
    invoiceableDateSystemOrOverdue: InvoiceableDateOrOverdue,
    numberOfOrders: number,
    transportOrderIds: string[],
};

const LOCALE_MAP: Record<SiteLocale, Locale> = {
    sv,
    en: enUS,
};

const generateInvoiceableDatesSystem = (startDate: Date, weeks = 1) => {
    return Array.from({ length: weeks * 7 }).map((_, i) => {
        return add(getSystemTimeZoneDate(startDate)!, { days: i });
    });
};

export const useDashboardInvoiceableOrdersStore = defineStore("dashboard-invoiceable-orders", () => {
    const { t } = useI18n();

    const rowsStore = useOrdersRowsStore();
    const now = ref(new Date());
    const currentSystemTime = computed(() => getSystemTimeZoneDate(now.value));
    const startOfTodaySystem = computed(() => startOfDay(currentSystemTime.value!));
    const todayInSystemTime = computed(() => format(startOfTodaySystem.value, "yyyy-MM-dd"));
    const oneWeekFromTodaySystem = computed(() => addDays(startOfTodaySystem.value, 6));

    const filtersStore = useDashboardInvoiceableOrderFiltersStore();
    const { teamFilters, personalFilters } = storeToRefs(filtersStore);

    const viewsStore = useDashboardChartViewsStore();

    const personalDatePeriod = computed({
        get() {
            const view = viewsStore.getOrCreateForChart(InvoiceableOrdersChart.Personal);
            if (!view) {
                return 1;
            }

            return view.config.datePeriod;
        },
        set(value) {
            viewsStore.saveViewDatePeriod(InvoiceableOrdersChart.Personal, value);
        }
    });
    const invoiceableOrdersDatesInSystemTime = computed(() =>
        generateInvoiceableDatesSystem(startOfTodaySystem.value, personalDatePeriod.value)
    );

    const teamDatePeriod = computed({
        get() {
            const view = viewsStore.getOrCreateForChart(InvoiceableOrdersChart.Team);
            if (!view) {
                return 1;
            }

            return view.config.datePeriod;
        },
        set(value) {
            viewsStore.saveViewDatePeriod(InvoiceableOrdersChart.Team, value);
        }
    });

    const invoiceableOrdersDatesTeamInSystemTime = computed(() =>
        generateInvoiceableDatesSystem(startOfTodaySystem.value, teamDatePeriod.value)
    );

    const getDefaultMappedInvoiceableOrderRows = (datesInSystemTime: Date[]): MappedInviceableOrderRows => {
        const mappedInvoiceableOrderRows = new Map() as MappedInviceableOrderRows;
        // Set overdue
        mappedInvoiceableOrderRows.set(OVERDUE, { invoiceableDateSystemOrOverdue: OVERDUE, orderRows: [] });

        datesInSystemTime.forEach((invoiceableDateSystem: Date) => {
            const date = format(invoiceableDateSystem, "yyyy-MM-dd");
            mappedInvoiceableOrderRows.set(date, {
                invoiceableDateSystemOrOverdue: invoiceableDateSystem,
                orderRows: []
            });
        });

        return mappedInvoiceableOrderRows;
    };

    const getOrderRowsByDate = (datesInSystemTime: Date[], filterExpression: FilterExpression): MappedInviceableOrderRows => {
        const maxDate = datesInSystemTime.length ? format(datesInSystemTime[datesInSystemTime.length - 1]!, "yyyy-MM-dd") : null;
        const invoiceableOrderRows = rowsStore.collection
            .chain()
            .find({
                release_for_invoicing_at_date: { $ne: null, $lte: maxDate }
            })
            .find(getSylvieJSQuery(filterExpression))
            .data();

        const mappedInvoiceableOrderRows = getDefaultMappedInvoiceableOrderRows(datesInSystemTime);

        invoiceableOrderRows.forEach((orderRow: OrderRow) => {
            const orderDateSystem = orderRow.release_for_invoicing_at_date!; // yyyy-MM-dd

            if (mappedInvoiceableOrderRows.has(orderDateSystem)) {
                mappedInvoiceableOrderRows.get(orderDateSystem)?.orderRows.push(orderRow);
                return;
            }
            // "overdue" order-rows are stored later, so that any other date except matches following condition is mapped in previous step
            if (orderDateSystem < todayInSystemTime.value) {
                mappedInvoiceableOrderRows.get(OVERDUE)?.orderRows.push(orderRow);
            }
        });
        return mappedInvoiceableOrderRows;
    };

    const calculateInvoiceableOrdersSummaries = (mappedInvoiceableOrderRows: MappedInviceableOrderRows) => {
        return [...mappedInvoiceableOrderRows.values()].map(
            (orderRowsOnInvoiceDate: OrderRowsOnInvoiceableDate) => ({
                invoiceableDateSystemOrOverdue: orderRowsOnInvoiceDate.invoiceableDateSystemOrOverdue,
                numberOfOrders: orderRowsOnInvoiceDate.orderRows.length,
                transportOrderIds: orderRowsOnInvoiceDate.orderRows.map((orderRow: OrderRow) => orderRow.id)
            } as DashboardInvoiceableOrdersSummaryForDate)
        );
    };

    const getDayLabel = (dateOrOverdue: InvoiceableDateOrOverdue): string => {
        const startOfDateSystem = startOfDay(getSystemTimeZoneDate(dateOrOverdue)!);

        if (dateOrOverdue === OVERDUE) {
            return t("dashboard.orders.Overdue");
        }
        if (isToday(startOfDateSystem)) {
            return t("dashboard.orders.Today");
        }
        if (isTomorrow(startOfDateSystem)) {
            return t("dashboard.orders.Tomorrow");
        }
        if (isAfter(startOfDateSystem, oneWeekFromTodaySystem.value)) {
            return format(startOfDateSystem, "d.MM.yyyy", { locale: LOCALE_MAP[getCurrentLocale()] });
        }

        return format(startOfDateSystem, "eeee", { locale: LOCALE_MAP[getCurrentLocale()] });
    };

    const getDatesToBeInvoiced = (dates: Date[]) => {
        return [
            { value: getDayLabel(OVERDUE), date: undefined },
            ...dates.map(
                (date: Date) => ({
                    value: getDayLabel(date),
                    date,
                })
            )
        ];
    };

    const getOrderSummaries = (datesInSystemTime: Date[], filterExpression: FilterExpression) => {
        const mappedOrderRows = getOrderRowsByDate(datesInSystemTime, filterExpression);
        return calculateInvoiceableOrdersSummaries(mappedOrderRows);
    };

    const invoiceableOrdersByDate = computed(() => {
        if (!personalFilters.value) {
            return [];
        }

        return getOrderSummaries(invoiceableOrdersDatesInSystemTime.value, personalFilters.value);
    });

    const datesToBeInvoiced = computed(() => getDatesToBeInvoiced(invoiceableOrdersDatesInSystemTime.value));

    const teamInvoiceableOrdersByDate = computed(() => {
        if (!teamFilters.value) {
            return [];
        }

        return getOrderSummaries(invoiceableOrdersDatesTeamInSystemTime.value, teamFilters.value);
    });

    const teamDatesToBeInvoiced = computed(() => getDatesToBeInvoiced(invoiceableOrdersDatesTeamInSystemTime.value));

    return {
        personalDatePeriod,
        teamDatePeriod,
        datesToBeInvoiced,
        teamDatesToBeInvoiced,
        invoiceableOrdersByDate,
        teamInvoiceableOrdersByDate,
        getDayLabel,
    };
});

