import { EditableGroupProperty, EditableProperty } from "../../generic/PropertyGrid/types";
import { DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE } from "../config";
import { DEFS } from "./definitions";

export type SchemaEntry = Omit<EditableProperty, "onChange"> | Omit<EditableGroupProperty, "onChange"> | Schema

export interface Schema {
    [key: string]: SchemaEntry
}

const schema: Schema = {
    chart: {
        backgroundColor: {
            name: "Background Color",
            description: "The background color of the outer chart area.",
            type: "color",
            defaultValue: "#FFFFFF"
        },
        borderColor: {
            name: "Border Color",
            description: "The color of the outer chart border.",
            type: "color",
            defaultValue: "#334eff"
        },
        borderWidth: {
            name: "Border Width",
            description: "The pixel width of the outer chart border.",
            type: "number",
            defaultValue: 0,
            min: 0
        },
        borderRadius: {
            name: "Border Radius",
            description: "The corner radius of the outer chart border.",
            type: "number",
            defaultValue: 0,
            min: 0
        },
        spacingTop: {
            name: "Spacing Top",
            description: "The space between the top edge of the chart and the content (plot area, axis title and labels, title, subtitle or legend in top position).",
            type: "number",
            defaultValue: 25
        },
        spacingRight: {
            name: "Spacing Right",
            description: "The space between the right edge of the chart and the content (plot area, axis title and labels, title, subtitle or legend in right position).",
            type: "number",
            defaultValue: 25
        },
        spacingBottom: {
            name: "Spacing Bottom",
            description: "The space between the bottom edge of the chart and the content (plot area, axis title and labels, title, subtitle or legend in bottom position).",
            type: "number",
            defaultValue: 25
        },
        spacingLeft: {
            name: "Spacing Left",
            description: "The space between the left edge of the chart and the content (plot area, axis title and labels, title, subtitle or legend in left position).",
            type: "number",
            defaultValue: 25
        },
        marginTop: {
            name: "Margin Top",
            type: "number",
            description: "The margin between the top outer edge of the chart and the plot area.\nUse this to set a fixed pixel value for the margin or remove it to use the default dynamic margin."
        },
        marginRight: {
            name: "Margin Right",
            type: "number",
            description: "The margin between the right outer edge of the chart and the plot area.\nUse this to set a fixed pixel value for the margin or remove it to use the default dynamic margin."
        },
        marginBottom: {
            name: "Margin Bottom",
            type: "number",
            description: "The margin between the bottom outer edge of the chart and the plot area.\nUse this to set a fixed pixel value for the margin or remove it to use the default dynamic margin."
        },
        marginLeft: {
            name: "Margin Left",
            type: "number",
            "description": "The margin between the left outer edge of the chart and the plot area.\nUse this to set a fixed pixel value for the margin or remove it to use the default dynamic margin."
        },
        style: {
            fontFamily: {
                ...DEFS.fontFamily,
                defaultValue: DEFAULT_FONT_FAMILY
            },
            fontSize: {
                name: "Font Size",
                type: "length",
                units: ["px", "pt"],
                description: "This allows you to control all the chart's font sizes by only setting the root level size.\nAll other element's font-sizes are relative to this one.",
                min: 8,
                max: 40,
                defaultValue: DEFAULT_FONT_SIZE + "px"
            }
        },
        plotBorderWidth: {
            name: "Border Width",
            description: "The pixel width of the plot area border",
            type: "number",
            step: 1,
            min: 0,
            max: 100,
            defaultValue: 0
        },
        plotBorderColor: {
            name: "Border Color",
            type: "color"
        },
        plotBackgroundColor: {
            name: "Background Color",
            type: "color"
        },
        plotShadow: {
            type: "shadow",
            name: "Plot Shadow",
            open: true,
            description: "Controls the drop shadow of the plot area",
        },
        options3d: {
            alpha: {
                name: "Alpha",
                type: "number",
                description: "One of the two rotation angles for the chart.",
                min: -180,
                max: 180,
                defaultValue: 0
            },
            beta: {
                name: "Beta",
                type: "number",
                description: "One of the two rotation angles for the chart.",
                min: -180,
                max: 180,
                defaultValue: 0
            },
            depth: {
                name: "depth",
                type: "number",
                description: "The total depth of the chart.",
                min: 50,
                defaultValue: 200
            },
            enabled: {
                name: "Enabled",
                type: "boolean",
                description: "Whether to render the chart using the 3D functionality.",
                defaultValue: false
            },
            fitToPlot: {
                name: "Fit to Plot",
                type: "boolean",
                description: "Whether the 3d box should automatically adjust to the chart plot area.",
                defaultValue: true
            },
            viewDistance: {
                name: "View Distance",
                type: "number",
                description: "Defines the distance the viewer is standing in front of the chart, this setting is important to calculate the perspective effect in column and scatter charts. It is not used for 3D pie charts.",
                min: 5,
                max: 100,
                defaultValue: 25
            },
            axisLabelPosition: {
                name: "Axis Label Position",
                description: "Can be \"auto\" or null. Set it to \"auto\" to automatically move the labels to the best edge.",
                type: "options",
                defaultValue: null,
                options: [
                    {
                        "value": null,
                        "label": "null"
                    },
                    {
                        "value": "auto",
                        "label": "auto"
                    }
                ]
            },
            frame: {
                visible: {
                    name: "Show Frame",
                    type: "options",
                    options: [
                        { value: true , label: "true"  },
                        { value: false, label: "false" },
                        { value: "default", label: "default" },
                        { value: "auto", label: "auto" }
                    ],
                    defaultValue: "default",
                    description: "Whether to display the frame. Possible values are true, false, \"auto\" to display only the frames behind the data, and \"default\" to display faces behind the data based on the axis layout, ignoring the point of view."
                }
            }
        },
        polar: {
            name: "Polar",
            type: "boolean",
            description: "When true, cartesian charts like line, spline, area and column are transformed into the polar coordinate system. This produces polar charts, also known as radar charts."
        },
    },
    legend: {
        enabled: {
            name: "Enabled",
            type: "boolean",
            defaultValue: true
        },
        align: {
            name: "X Align",
            description: "The horizontal alignment of the legend box within the chart area. Valid values are left, center and right.\nIn the case that the legend is aligned in a corner position, the layout option will determine whether to place it above/below or on the side of the plot area.",
            type   : "options",
            options: ["left", "center", "right"],
            defaultValue: "center"
        },
        verticalAlign: {
            name   : "Y Align",
            type   : "options",
            options: ["top", "middle", "bottom"],
            defaultValue: "bottom",
            description: "The vertical alignment of the legend box. Can be one of top, middle or bottom. Vertical position can be further determined by the y option.\n\nIn the case that the legend is aligned in a corner position, the layout option will determine whether to place it above/below or on the side of the plot area.\n\nWhen the layout option is proximate, the verticalAlign option doesn't apply."
        },
        x: {
            name: "X Offset",
            type: "number",
            description: "The x offset of the legend relative to its horizontal alignment align within chart.spacingLeft and chart.spacingRight. Negative x moves it to the left, positive x moves it to the right."
        },
        y: {
            name: "Y Offset",
            type: "number",
            description: "The vertical offset of the legend relative to it's vertical alignment verticalAlign within chart.spacingTop and chart.spacingBottom. Negative y moves it up, positive y moves it down."
        },
        layout: {
            name: "Layout",
            description: "The layout of the legend items. Can be one of horizontal or vertical or proximate. When proximate, the legend items will be placed as close as possible to the graphs they're representing, except in inverted charts or when the legend position doesn't allow it.",
            type: "options",
            options: ["horizontal", "vertical"/*, "proximate"*/],
            defaultValue: "horizontal"
        },
        alignColumns: {
            name: "Align Columns",
            description: "If the layout is horizontal and the legend items span over two lines or more, whether to align the items into vertical columns. Setting this to false makes room for more items, but will look more messy.",
            type: "boolean",
            defaultValue: true
        },
        floating: {
            name: "Floating",
            description: "When the legend is floating, the plot area ignores it and is allowed to be placed below it.",
            type: "boolean",
            defaultValue: false
        },
        width: {
            name: "Width",
            type: "length",
            units: ["%", "px"]
        },
        padding: {
            name: "Padding",
            type: "number",
            description: "The inner padding of the legend box.",
            defaultValue: 8
        },
        maxHeight: {
            name: "Max Height",
            type: "length",
            units: ["px", "%"],
            description: "Maximum pixel height for the legend. When the maximum height is extended, navigation will show."
        },
        backgroundColor: {
            name: "Background Color",
            type: "color",
            description: "The background color of the legend."
        },
        borderWidth: {
            name: "Border Width",
            type: "number"
        },
        borderColor: {
            name: "Border Color",
            type: "color",
            defaultValue: "#999999"
        },
        borderRadius: {
            name: "Border Radius",
            type: "number"
        },
        shadow: {
            type: "shadow",
            name: "Drop Shadow",
            // open: true,
            description: "Controls the drop shadow of the legend area"
        },
        itemDistance: {
            name: "Item Distance",
            type: "number",
            defaultValue: 20
        },
        itemMarginTop: {
            name: "Margin Top",
            type: "number",
            defaultValue: 2
        },
        itemMarginBottom: {
            name: "Margin Bottom",
            type: "number",
            defaultValue: 2
        },
        labelFormat: {
            name: "Format",
            type: "string",
            defaultValue: "{name}",
            description: "A format string for each legend label. Available variables relates to properties on the series, or the point in case of pies."
        }
    }
}

export default schema