// this is needed for named imports to work with vue-tsc
declare module '@event-calendar/core' {
    export const createCalendar: any
    export const destroyCalendar: any
    export const TimeGrid: any
    export const Interaction: any
    const _default: any
    export default _default
}
