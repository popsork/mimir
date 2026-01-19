import type { GridComponentOption, TitleComponentOption, TooltipComponentOption } from "echarts/components";
import type {
    CallbackDataParams,
    GridOption,
    TitleOption,
    XAXisOption,
    YAXisOption,
    TooltipOption,
} from "echarts/types/dist/shared";
import type { BarSeriesOption } from "echarts/charts";
import { use } from "echarts/core";
import { BarChart } from "echarts/charts";
import {
    TitleComponent,
    GridComponent,
    TooltipComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { ComposeOption } from "echarts/core";
import type { LineStyleOption } from "echarts/types/src/util/types";

export type BarChartOptions = ComposeOption<
    | TitleComponentOption
    | GridComponentOption
    | TooltipComponentOption
    | BarSeriesOption
>;
export type TooltipParamFormatterParams = CallbackDataParams | CallbackDataParams[];
export type TooltipParamsData = CallbackDataParams["data"];
export type BarSeriesOptions = BarSeriesOption[];
export type BarChartXAxisData =
    Array<{ value: number | string } & Partial<Record<string, string | number | null | object>>>
    | string[]
    | number[];
export type BarChartSeriesData = Array<{ value: number } & Partial<Record<string, string | number | null | object>>>;

export type TooltipFormatter = (params: TooltipParamFormatterParams) => (string | HTMLElement | HTMLElement[]);
export type ChartConfig = { title : string, xAxisData: BarChartXAxisData, tooltipFormatter : TooltipFormatter, seriesData: BarChartSeriesData };
type SeriesData = { value: number, date: string, orderNumbers: string[] }[];

export const useOrdersToBeInvoicedChart = (chartConfig: ComputedRef<ChartConfig> | Ref<ChartConfig>) => {
    use([
        TitleComponent,
        GridComponent,
        TooltipComponent,
        BarChart,
        CanvasRenderer,
    ]);

    const seriesOption = computed(() => [
        {
            ...seriesConfig,
            data: chartConfig.value.seriesData.map((dataValue, index) => ({
                ...dataValue,
                label: {
                    padding: dataValue.value ? 0 : [steps(0.5), steps(0.5) + 2, steps(0.5) - 2, steps(0.5)],
                },
                emphasis: {
                    itemStyle: {
                        // $color-charts-hover-info: $color-brand-darker : $color-charts-hover-overdue: $color-danger-light;
                        color: index === 0 ? "#F9A8A8" : "#113D83",
                    },
                    label: {
                        // $color-charts-hover-info: $color-brand-darker : $color-charts-hover-overdue: $color-danger-light;
                        backgroundColor: index === 0 ? "#F9A8A8" : "#113D83",
                    }
                }
            }))
        }
    ] as BarSeriesOptions);

    const chartOptions = computed((): BarChartOptions => ({
        grid: gridConfig,
        title: { ...titleConfig, text: chartConfig.value.title } as TitleOption,
        tooltip: { ...toolTipConfig, formatter: chartConfig.value.tooltipFormatter } as TooltipOption,
        xAxis: { ...xAxisConfig, data: chartConfig.value.xAxisData } as XAXisOption,
        yAxis: yAxisConfig,
        series: seriesOption.value,
    }));

    const blankChartOptions = computed((): BarChartOptions => ({
        grid: gridConfig,
        title: { ...titleConfig, text: chartConfig.value.title } as TitleOption,
        yAxis: {
            ...yAxisConfig,
            min: 0,
            max: 90,
            splitNumber: 3,
            axisLabel: {
                show: false
            }
        } as YAXisOption,
        xAxis: {
            ...xAxisConfig,
        } as XAXisOption,
    }));

    return {
        chartOptions,
        blankChartOptions
    };
};

const steps = (stepsCount: number) => 8 * stepsCount; // to match with scss units, units.scss

const yAxisMargin = steps(2.5);
const gridLeftMargin = steps(2.5);
const gridRightMargin = steps(2.5); // sync values with OrdersToBeInvoicedChart.vue, .chart-actions: right
const gridTopMargin = steps(10.5);

const gridConfig = {
    right: gridRightMargin,
    left: gridLeftMargin + yAxisMargin,
    top: gridTopMargin,
    bottom: steps(2.5),
    containLabel: true,
} as GridOption;

const axisCommonConfig = {
    axisTick: {
        show: false,
    },
    axisLabel: {
        color: "#5E6373", // $color-text-lightest
        fontWeight: 420, // @mixin body-tiny-text
        fontSize: "10px",
        fontFamily: "Geist",
        overflow: "truncate",
        interval: 0,
        hideOverlap: true,
        width: steps(5.5),
    },
} as Omit<XAXisOption, "data">;

const titleConfig = {
    top: steps(2.5), // sync values with OrdersToBeInvoicedChart.vue, .chart-actions: top
    left: gridLeftMargin - 5, // specific handling for title margins
    textStyle: {
        color: "#272930", // $color-text-normal:
        fontWeight: 500, // @mixin normal-heading
        fontSize: "18px",
        overflow: "truncate",
        fontFamily: "Geist",
    },
} as TitleComponentOption;

const axisLineStyle = {
    color: "#DADCE1", // $color-charts-split-line
    shadowOffsetX: -yAxisMargin,
    shadowColor: "#DADCE1" // $color-charts-split-line
} as LineStyleOption;

const xAxisConfig = {
    ...axisCommonConfig,
    data: [] as (number | string)[],
    offset: steps(1),
    axisLine: {
        lineStyle: axisLineStyle
    },
} as XAXisOption;

const yAxisConfig = {
    ...axisCommonConfig,
    axisLabel: {
        ...axisCommonConfig.axisLabel,
        inside: true,
        margin: -yAxisMargin,
        verticalAlign: "bottom",
        lineHeight: steps(2),
    },
    splitLine: {
        lineStyle: axisLineStyle
    },
    axisLine: { onZero: false },
} as YAXisOption;

const seriesConfig = {
    data: [] as SeriesData,
    itemStyle: {
        color: function(params: CallbackDataParams) {
            if (params.dataIndex === 0) {
                return "#FCC5C5"; // $color-charts-overdue
            }
            return "#164DA7"; // $color-charts-info
        },
        borderRadius: [50, 50, 0, 0],
    },
    type: "bar",
    colorBy: "data",
    barWidth: "85%",
    barMinHeight: 2,
    label: {
        show: true,
        position: "insideBottom",
        backgroundColor: "inherit",
        borderRadius: 2, // $element-border-radius-smallest
        formatter: function(params: CallbackDataParams) {
            if (params.dataIndex === 0) {
                return `{overdue|${params.value}}`;
            }
            return `{other|${params.value}}`;
        },
        rich: {
            overdue: {
                color: "#373B43", // $color-text-lighter
                fontFamily: "Geist",
                fontWeight: 500, // $normal-medium-text
                fontSize: "12px",
            },
            other: {
                color: "#EEEEF0", // $color-text-inverted
                fontFamily: "Geist",
                fontWeight: 500, // $normal-medium-text
                fontSize: "12px",
            }
        }
    }
} as BarSeriesOption;

/**
 * The position of the tooltip's floating layer, which follows the mouse pointer by default.
 *
 * @param pos        - The current mouse position as a two-element array [x, y].
 * @param _params    - Tooltip parameters (same as formatter params  - ToolTipParamFormatterParams).
 * @param dom        - The DOM element representing the tooltip container.
 * @param _rect      - When the mouse is over a graphic element, this provides its bounding box (x, y, width, height).
 * @param size       - The dimensions of the ECharts container. For example: { contentSize: [width, height], viewSize: [width, height] }.
 *
 * @returns An array with two numbers representing the absolute pixel coordinates [left, top] for positioning the tooltip.
 */
const tooltipPosition = (
    pos: [number, number],
    _params: any,
    dom: HTMLElement,
    _rect: { x: number, y: number, width: number, height: number },
    size: { viewSize: [number, number] }
): [number, number] => {
    // current dimensions of the tooltip element.
    const tooltipWidth = dom.offsetWidth;
    const tooltipHeight = dom.offsetHeight;
    // calculate static margin between tooltip and mouse pointer
    const margin = steps(2);

    // initial horizontal position (x) so the tooltip is centered relative to the mouse pointer.
    let x = pos[0] - tooltipWidth / 2;
    // initial vertical position (y) placing the tooltip above the pointer by default with a gap defined by 'margin'.
    let y = pos[1] - tooltipHeight - margin;

    // If positioning the tooltip above the pointer would move it off the top of the container, reposition it below the pointer.
    if (y < gridTopMargin) {
        y = pos[1] + margin;
    }

    // Ensure the tooltip doesn't overflow the left side of the container.
    if (x < gridLeftMargin + yAxisMargin) {
        x = gridLeftMargin + yAxisMargin;
    }
    // Ensure the tooltip doesn't overflow the right side of the container.
    if (x + tooltipWidth > size.viewSize[0] - gridRightMargin) {
        x = size.viewSize[0] - tooltipWidth - gridRightMargin;
    }

    return [x, y];
};

const toolTipConfig = {
    show: true,
    trigger: "item",
    axisPointer: {
        type: "shadow",
    },
    borderWidth: 1,
    borderRadius: 4,
    borderColor: "#DADCE1", // $color-border-normal
    backgroundColor: "#EEEEF0", // $color-background-light
    padding: [6, steps(1)],
    renderMode: "html",
    position: tooltipPosition
} as TooltipComponentOption;
