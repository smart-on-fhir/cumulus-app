import { BrowserRouter }             from "react-router-dom"
import { render }                    from "@testing-library/react"
import { getDefaultChartOptions }    from "./Charts/DefaultChartOptions"
import Dashboard, { DashboardProps } from "."
import { app }                       from "../../types"
import { AuthProvider }              from "../../auth"




function WrappedChartView(props: DashboardProps) {
    return (
        <AuthProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Dashboard {...props} />
            </BrowserRouter>
        </AuthProvider>
    );
}

describe("Dashboard", () => {

    const chartTypes = {
        "pie"          : "pie",
        "pie3d"        : "pie",
        "donut"        : "pie",
        "donut3d"      : "pie",
        "line"         : "line",
        "spline"       : "spline",
        "area"         : "area",
        "areaspline"   : "areaspline",
        "column"       : "column",
        "column3d"     : "column",
        "columnStack"  : "column",
        "columnStack3d": "column",
        "bar"          : "bar",
        "bar3d"        : "bar",
        "barStack"     : "bar",
        "barStack3d"   : "bar",
    }

    for (const key in chartTypes) {
        const type = chartTypes[key as keyof typeof chartTypes];
        it (`${key} charts must have type equal to "${type}"`, () => {
            expect(
                getDefaultChartOptions(
                    key as any,
                    {
                        chart: {
                            type: "x"
                        }
                    },
                    true
                ).chart?.type
            ).toBe(type)
        })
    }
})

describe("Chart View", () => {

    const baseSubscription: app.Subscription = {
        id: 1,
        name: "Test Subscription",
        description: "Test Subscription Description",
        groupId: 1,
        group: {
            id: 1,
            name: "Subscriptions Group 1",
            description: "",
            requests: [],
            createdAt: "",
            updatedAt: ""
        },
        createdAt: "2020-02-02",
        updatedAt: null,
        status   : "completed",
        completed: "2020-02-02",
        requestedData: null,
        dataURL: null,
        dataSourceType: "file",
        metadata: {
            cols: [
                { name: "cnt"           , label: "Count"         , dataType: "integer"        , description: "Count Column Description"  },
                { name: "string_column" , label: "String Column" , dataType: "string"         , description: "String Column Description" },
                { name: "week_column"   , label: "Week Column"   , dataType: "date:YYYY-MM-DD", description: "Week Column Description"   },
                { name: "month_column"  , label: "Month Column"  , dataType: "date:YYYY-MM"   , description: "Month Column Description"  },
                { name: "year_column"   , label: "Year Column"   , dataType: "date:YYYY"      , description: "Year Column Description"   },
                { name: "integer_column", label: "Integer Column", dataType: "integer"        , description: "Integer Column Description"},
                { name: "float_column"  , label: "Float Column"  , dataType: "float"          , description: "Float Column Description"  },
                { name: "boolean_column", label: "Boolean Column", dataType: "boolean"        , description: "Boolean Column Description"},
            ],
            "total": 1234
        },
        // Tags?: Pick<Tag, "id" | "name" | "description">[]
        // Views?: View[]s
        transmissions: null,
        StudyAreas: [
            { id: 1, name: "StudyArea 1", description: "StudyArea 1 Description" } as app.StudyArea,
            { id: 2, name: "StudyArea 2", description: "StudyArea 2 Description" } as app.StudyArea,
            { id: 3, name: "StudyArea 3", description: "StudyArea 3 Description" } as app.StudyArea
        ]
    }
    
    const baseView: app.View = {
        id           : 1,
        subscriptionId: 1,
        packageId    : null,
        name         : "Test Chart",
        description  : "Test Chart Description",
        Subscription : baseSubscription,
        isDraft      : false,
        Tags         : [
            { id: 1, name: "Tag 1", description: "Tag 1 Description" },
            { id: 2, name: "Tag 2", description: "Tag 2 Description" },
            { id: 3, name: "Tag 3", description: "Tag 3 Description" }
        ],
        settings: {
            column: "covid_pcr_result_display",
            caption: "HTML chart caption",
            // seriesVisibility?: Record<string, boolean>
            // ranges?: RangeOptions
            column2: "",
            filters: [],
            groupBy: "",
            viewType: "spline",
            column2type: "column",
            denominator: "",
            chartOptions: {
                title: {
                    text: "Chart Title",
                    style: { fontSize: "20px", fontWeight: "bold" }
                },
                xAxis: {
                    title: {
                        text: "X Axis Title"
                    }
                },
                yAxis: {
                    title: {
                        text: "Y Axis Title"
                    }
                },
                series: [
                    {
                        id  : "primary-COVID-19 PCR Result Display",
                        name: "COVID-19 PCR Result Display",
                        type: "line",
                        data: [
                            { x: 1 , y: 1 },
                            { x: 2 , y: 2 },
                            { x: 10, y: 3 },
                        ]
                    }
                ]
            }
        }
    }

    it('name and description', () => {
        // localStorage.setItem("user", '{"role":"admin"}')
        render(<WrappedChartView subscription={ baseSubscription } view={{ ...baseView }} />);
        
        expect(document.querySelector("#view-name")).toHaveValue(baseView.name);
        
        expect(document.querySelector("#view-description")).toHaveValue(baseView.description);
        
        expect(document.querySelector("text.highcharts-title")).toHaveTextContent("Chart Title")
        expect((document.querySelector("text.highcharts-title") as SVGTextElement).style).toHaveProperty("fontSize", "20px")
        expect((document.querySelector("text.highcharts-title") as SVGTextElement).style).toHaveProperty("fontWeight", "bold")

        expect(document.querySelector(".highcharts-xaxis .highcharts-axis-title")).toHaveTextContent("X Axis Title")
        expect(document.querySelector(".highcharts-yaxis .highcharts-axis-title")).toHaveTextContent("Y Axis Title")

        expect(document.querySelector(".subscription-link")).toHaveAttribute("href", "/requests/" + baseSubscription.id)
        expect(document.querySelector(".subscription-link")).toHaveTextContent(baseSubscription.name)

        expect(document.querySelector(".subscription-group-link")).toHaveAttribute("href", "/groups/" + baseSubscription.group!.id)
        expect(document.querySelector(".subscription-group-link")).toHaveTextContent(baseSubscription.group!.name)

        const xAxisLabels: string[] = []
        const yAxisLabels: string[] = []
        document.querySelectorAll<SVGTextElement>(".highcharts-xaxis-labels text").forEach(node => xAxisLabels.push(node.textContent || ""))
        document.querySelectorAll<SVGTextElement>(".highcharts-yaxis-labels text").forEach(node => yAxisLabels.push(node.textContent || ""))
        expect(xAxisLabels).toEqual(["2", "4", "6", "8", "10"])
        expect(yAxisLabels).toEqual(["0", "1", "2", "3", "4" ])

        expect(document.querySelector(".chart-caption")).toHaveTextContent(baseView.settings!.caption!)

        // tags ----------------------------------------------------------------
        const tagLinks = document.querySelectorAll<HTMLLinkElement>(".view-tags a.tag")
        expect(tagLinks.length).toEqual(baseView.Tags!.length)
        tagLinks.forEach((link, i) => {
            expect(link).toHaveAttribute("title", baseView.Tags![i].description)
            expect(link).toHaveAttribute("href", `/tags/${baseView.Tags![i].id}`)
            expect(link).toHaveTextContent(baseView.Tags![i].name)
        })

        // Study Areas ---------------------------------------------------------
        const studyAreaLinks = document.querySelectorAll<HTMLLinkElement>(".view-study-areas a.study-area-link")
        expect(studyAreaLinks.length).toEqual(baseSubscription.StudyAreas!.length)
        studyAreaLinks.forEach((link, i) => {
            expect(link).toHaveAttribute("href", `/study-areas/${baseSubscription.StudyAreas![i].id}`)
            expect(link).toHaveTextContent(baseSubscription.StudyAreas![i].name)
        })
    });
})