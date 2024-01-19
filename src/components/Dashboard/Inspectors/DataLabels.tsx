import { AlignValue, DataLabelsOverflowValue, PlotSeriesDataLabelsOptions, VerticalAlignValue } from "highcharts"
import PropertyGrid from "../../generic/PropertyGrid"
import { getStyleOptions } from "./Style"


export function getOptions(options: PlotSeriesDataLabelsOptions, onChange: (o: Partial<PlotSeriesDataLabelsOptions>) => void) {
    return [
        {
            name: "Enabled",
            type: "boolean",
            value: !!options?.enabled,
            onChange: (enabled: boolean) => onChange({ enabled })
        },
        {
            name: "Horizontal Align",
            type: "options",
            description: "The alignment of the data label compared to the point. " +
                "If right, the right side of the label should be touching the point. " +
                "For points with an extent, like columns, the alignments also dictates " +
                "how to align it inside the box, as given with the inside option.",
            options: ["left", "center", "right"],
            value: options?.align,
            onChange: (align: AlignValue) => onChange({ align })
        },
        {
            name: "Vertical Align",
            type: "options",
            description: "The vertical alignment of a data label. The default value " +
                "depends on the data, for instance in a column chart, the label is above " +
                "positive values and below negative values.",
            options: ["bottom", "middle", "top"],
            value: options?.verticalAlign,
            onChange: (verticalAlign: VerticalAlignValue) => onChange({ verticalAlign })
        },
        {
            name: "Allow Overlap",
            type: "boolean",
            description: "Whether to allow data labels to overlap. To make " +
                "the labels less sensitive for overlapping, the " +
                "dataLabels.padding can be set to 0.",
            value: !!options?.allowOverlap,
            onChange: (allowOverlap: boolean) => onChange({ allowOverlap })
        },
        {
            name: "Background Color",
            type: "color",
            value: options?.backgroundColor,
            onChange: (backgroundColor?: string) => onChange({ backgroundColor: backgroundColor || "transparent" })
        },
        {
            name: "Padding",
            type: "number",
            value: options?.padding ?? 5,
            min: 0,
            onChange: (padding?: number) => onChange({ padding })
        },
        {
            name: "Border Width",
            type: "number",
            value: options?.borderWidth,
            step: 0.1,
            onChange: (borderWidth?: number) => onChange({ borderWidth })
        },
        {
            name: "Border Radius",
            type: "number",
            value: options?.borderRadius,
            onChange: (borderRadius?: number) => onChange({ borderRadius })
        },
        {
            name: "Border Color",
            type: "color",
            value: options?.borderColor,
            onChange: (borderColor?: string) => onChange({ borderColor })
        },
        {
            name: "Crop",
            type: "boolean",
            description: "Whether to hide data labels that are outside the plot area. " +
                "By default, the data label is moved inside the plot area according to the overflow option",
            value: options?.crop !== false,
            onChange: (crop: boolean) => onChange({ crop })
        },
        {
            name: "Overflow",
            type: "options",
            description: 'How to handle data labels that flow outside the plot area. The default is "justify", ' +
                'which aligns them inside the plot area. For columns and bars, this means it will be moved ' +
                'inside the bar. To display data labels outside the plot area, set crop to false and overflow ' +
                'to "allow".',
            options: ["allow", "justify"],
            value: options?.overflow || "justify",
            onChange: (overflow: DataLabelsOverflowValue) => onChange({ overflow })
        },
        {
            name: "X Offset",
            type: "number",
            value: options?.x,
            onChange: (x?: number) => onChange({ x })
        },
        {
            name: "Y Offset",
            type: "number",
            value: options?.y,
            onChange: (y?: number) => onChange({ y })
        },
        {
            name: "Z Index",
            type: "number",
            description: "The z index of the data labels. Use a zIndex of 6 to display " +
                "it above the series, or use a zIndex of 2 to display it behind the series.",
            value: options?.zIndex ?? 6,
            onChange: (zIndex?: number) => onChange({ zIndex })
        },
        {
            name: "Format",
            type: "string",
            placeholder: "Example: {y:.2f}",
            description: "See https://www.highcharts.com/docs/chart-concepts/labels-and-string-formatting",
            value: options?.format,
            onChange: (format: string) => onChange({ format: format || undefined })
        },
        {
            name : "Style",
            type : "group",
            open : true,
            value: getStyleOptions(options?.style ?? {}, style => {
                onChange({ style: { ...options?.style, ...style }})
            }, [
                "color",
                "fontSize",
                "fontWeight",
                "fontStyle",
                "textDecoration",
                "textOutline"
            ])
        }
    ] as any[]
}

export default function DataLabels({
    options = {} as PlotSeriesDataLabelsOptions,
    onChange
}: {
    options?: PlotSeriesDataLabelsOptions,
    onChange: (a: Partial<PlotSeriesDataLabelsOptions>) => void
}) {
    return <PropertyGrid props={getOptions(options, onChange)} />
}