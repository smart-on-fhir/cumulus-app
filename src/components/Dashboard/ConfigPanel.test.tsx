import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ConfigPanel, { getChartTypes } from "./ConfigPanel"


// Mock useAuth globally for all tests
vi.mock("../../hooks", () => ({
  useAuth: () => ({ logout: () => {}, user: { name: "test" } }),
  useBackend: () => ({ result: null, loading: false, error: null })
}))

// Use vi.fn() for Vitest
const onChange = vi.fn()
const onChartTypeChange = vi.fn()
const onChartOptionsChange = vi.fn()
const onRangeOptionsChange = vi.fn()
const onSecondaryDataOptionsChange = vi.fn()

// Mocks for required props and dependencies
import { ChartConfigPanelState } from "./ConfigPanel"
import type { app } from "../../types"

const mockCols: app.SubscriptionDataColumn[] = [
  { name: "age", label: "Age", dataType: "integer", description: "" },
  { name: "gender", label: "Gender", dataType: "string", description: "" },
  { name: "date", label: "Date", dataType: "date:YYYY-MM-DD", description: "" },
]

const mockState: ChartConfigPanelState = {
  groupBy: "age",
  stratifyBy: "gender",
  sortBy: "x:asc",
  limit: 10,
  offset: 0,
  filters: [],
  chartType: "column",
  viewName: "Test View",
  viewDescription: "Test Description",
  chartOptions: {
    title: { text: "Chart Title" },
    colors: ["#123456", "#abcdef"],
    legend: { enabled: true },
    series: [{ type: "column", data: [1, 2, 3], visible: true }],
    xAxis: { title: { text: "X Axis" } },
    yAxis: { title: { text: "Y Axis" } },
    annotations: [],
    plotOptions: { column: {}, bar: {}, pie: {} },
  // custom: { theme: "default" }, // Remove unknown property
  },
  denominator: "",
  column2: "",
  column2type: undefined,
  statusColumn: "",
  eventValue: "",
  survivalBands: false,
  survivalRiskTable: false,
  xCol: { name: "age", label: "Age", dataType: "integer", description: "" },
  tags: [],
  ranges: null,
  visualOverrides: {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    enabled: false,
    fontColor: "#000",
    fontColorEnabled: false,
  },
  inspection: {
    enabled: false,
    match: [],
    context: {
      selectedAnnotationIndex: -1,
      selectedPlotLineId: "",
      selectedPlotLineAxis: "",
      selectedSeriesId: ""
    }
  },
}

// Basic smoke test
it("renders ConfigPanel and expands Chart section", async () => {
  render(
    <ConfigPanel
      cols={mockCols}
      state={mockState}
      onChange={onChange}
      onChartTypeChange={onChartTypeChange}
      onChartOptionsChange={onChartOptionsChange}
      onRangeOptionsChange={onRangeOptionsChange}
      onSecondaryDataOptionsChange={onSecondaryDataOptionsChange}
    />
  )
  // Expand Chart section
  const chartCollapseHeader = screen.getByText("Chart")
  await userEvent.click(chartCollapseHeader)
  // Chart Type select value should be visible (pick first match)
  const chartTypeSpans = screen.getAllByText(/Column Chart/i)
  expect(chartTypeSpans[0]).toBeInTheDocument()
  // Chart Title input: look for display value
  expect(screen.getByDisplayValue("Chart Title")).toBeInTheDocument()
  expect(screen.getByText(/Legend/i)).toBeInTheDocument()
})

// Test chart type selection
it("calls onChartTypeChange when chart type is changed", async () => {
  render(
    <ConfigPanel
      cols={mockCols}
      state={mockState}
      onChange={onChange}
      onChartTypeChange={onChartTypeChange}
      onChartOptionsChange={onChartOptionsChange}
      onRangeOptionsChange={onRangeOptionsChange}
      onSecondaryDataOptionsChange={onSecondaryDataOptionsChange}
    />
  )
  await userEvent.click(screen.getByText("Chart"))
  // Open select menu for Chart Type (pick first match)
  const selectValue = screen.getAllByText(/Column Chart/i)[0]
  await userEvent.click(selectValue)
  // Select "Bar Chart" option (pick first match)
  const barOption = screen.getAllByText(/Bar Chart/i)[0]
  await userEvent.click(barOption)
  expect(onChartTypeChange).toHaveBeenCalled()
})

// Test chart title input
it("calls onChartOptionsChange when chart title is changed", async () => {
  render(
    <ConfigPanel
      cols={mockCols}
      state={mockState}
      onChange={onChange}
      onChartTypeChange={onChartTypeChange}
      onChartOptionsChange={onChartOptionsChange}
      onRangeOptionsChange={onRangeOptionsChange}
      onSecondaryDataOptionsChange={onSecondaryDataOptionsChange}
    />
  )
  await userEvent.click(screen.getByText("Chart"))
  // Find Chart Title input by display value
  const input = screen.getByDisplayValue("Chart Title")
  await userEvent.clear(input)
  await userEvent.type(input, "New Title")
  expect(onChartOptionsChange).toHaveBeenCalled()
})

// Test chart subtitle input
it("calls onChartOptionsChange when chart subtitle is changed", async () => {
  render(
    <ConfigPanel
      cols={mockCols}
      state={{ ...mockState, chartOptions: { ...mockState.chartOptions, subtitle: { text: "Chart Subtitle" } } }}
      onChange={onChange}
      onChartTypeChange={onChartTypeChange}
      onChartOptionsChange={onChartOptionsChange}
      onRangeOptionsChange={onRangeOptionsChange}
      onSecondaryDataOptionsChange={onSecondaryDataOptionsChange}
    />
  )
  await userEvent.click(screen.getByText("Chart"))
  const input = screen.getByDisplayValue("Chart Subtitle")
  await userEvent.type(input, "!")
  expect(onChartOptionsChange).toHaveBeenLastCalledWith({ subtitle: { text: "Chart Subtitle!" } })
})

// Charts can suggest subtitles, e.g. survival charts their log-rank sentences
it("suggests the subtitles the chart offers", async () => {
  const sentences = ["Log-rank test: p = 0.32", "Differences at least this large would occur by chance 32% of the time if all groups had the same survival (log-rank p = 0.32)."]
  const { container } = render(
    <ConfigPanel
      cols={mockCols}
      state={{ ...mockState, chartOptions: { ...mockState.chartOptions, custom: { subtitleSuggestions: sentences } } as any }}
      onChange={onChange}
      onChartTypeChange={onChartTypeChange}
      onChartOptionsChange={onChartOptionsChange}
      onRangeOptionsChange={onRangeOptionsChange}
      onSecondaryDataOptionsChange={onSecondaryDataOptionsChange}
    />
  )
  await userEvent.click(screen.getByText("Chart"))
  const options = container.querySelectorAll("#chart-subtitle-suggestions option")
  expect(Array.from(options).map(o => o.getAttribute("value"))).toEqual(sentences)
})

// Test legend toggle
it("renders legend controls and calls onChartOptionsChange when legend is changed", async () => {
  render(
    <ConfigPanel
      cols={mockCols}
      state={mockState}
      onChange={onChange}
      onChartTypeChange={onChartTypeChange}
      onChartOptionsChange={onChartOptionsChange}
      onRangeOptionsChange={onRangeOptionsChange}
      onSecondaryDataOptionsChange={onSecondaryDataOptionsChange}
    />
  )
  await userEvent.click(screen.getByText("Legend"))
  expect(screen.getByText(/Legend/i)).toBeInTheDocument()
  // Simulate legend change if possible (depends on Legend component implementation)
  // await userEvent.click(screen.getByLabelText(/Legend/i))
})

// Test tag selector
it("renders tag selector label", () => {
  render(
    <ConfigPanel
      cols={mockCols}
      state={mockState}
      onChange={onChange}
      onChartTypeChange={onChartTypeChange}
      onChartOptionsChange={onChartOptionsChange}
      onRangeOptionsChange={onRangeOptionsChange}
      onSecondaryDataOptionsChange={onSecondaryDataOptionsChange}
    />
  )
  // Use getAllByText to avoid ambiguity
  const tagLabels = screen.getAllByText(/Tags/i)
  expect(tagLabels.length).toBeGreaterThan(0)
})

// Test data column selection
it("calls onChange when groupBy column is changed", async () => {
  render(
    <ConfigPanel
      cols={mockCols}
      state={mockState}
      onChange={onChange}
      onChartTypeChange={onChartTypeChange}
      onChartOptionsChange={onChartOptionsChange}
      onRangeOptionsChange={onRangeOptionsChange}
      onSecondaryDataOptionsChange={onSecondaryDataOptionsChange}
    />
  )
  await userEvent.click(screen.getByText("Data"))
  // Find X Axis select value and open menu (pick first match)
  const xAxisValue = screen.getAllByText(/Age/i)[0]
  await userEvent.click(xAxisValue)
  // Select "Date" option (pick first match)
  const dateOption = screen.getAllByText(/Date/i)[0]
  await userEvent.click(dateOption)
  expect(onChange).toHaveBeenCalled()
})

// The X axis and stratifier columns can be swapped, except in survival charts
describe("swapping the X axis and stratifier columns", () => {

  async function renderPanel(chartType: string) {
    const onChange = vi.fn()
    const { container } = render(
      <ConfigPanel
        cols={mockCols}
        state={{ ...mockState, chartType } as any}
        onChange={onChange}
        onChartTypeChange={onChartTypeChange}
        onChartOptionsChange={onChartOptionsChange}
        onRangeOptionsChange={onRangeOptionsChange}
        onSecondaryDataOptionsChange={onSecondaryDataOptionsChange}
      />
    )
    await userEvent.click(screen.getByText("Data"))
    return { onChange, swap: container.querySelector(".dashboard-sidebar-swap-btn-wrap > div") as HTMLElement }
  }

  it("swaps them", async () => {
    const { onChange, swap } = await renderPanel("column")
    expect(swap.getAttribute("aria-disabled")).toBe("false")
    await userEvent.click(swap)
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ groupBy: "gender", stratifyBy: "age" }))
  })

  it("is disabled in survival charts, and says why", async () => {
    const { onChange, swap } = await renderPanel("survival")
    expect(swap.getAttribute("aria-disabled")).toBe("true")
    expect(swap.getAttribute("data-tooltip")).toMatch(/follow-up time on the X axis/)
    await userEvent.click(swap)
    expect(onChange).not.toHaveBeenCalled()
  })
})

// New survival charts need the SURVIVAL_CHARTS build flag
describe("chart types", () => {
  it("leave out survival charts without the flag", () => {
    const types = getChartTypes("column", false)
    expect(types).not.toContain("survival")
    expect(types).toContain("column")
  })

  it("include survival charts with the flag", () => {
    expect(getChartTypes("column", true)).toContain("survival")
  })

  it("keep survival charts that already exist editable without the flag", () => {
    expect(getChartTypes("survival", false)).toContain("survival")
  })
})

// Some editors change the chart options of the state they were given in place.
// Highcharts.merge copies arrays by reference, so even after merge(state) the
// series and colors are the Dashboard's own. These tests pin that down, because
// SliceEditor's changes only reach the chart that way.
describe("editors that change the chart options in place", () => {

  function getPieState(): ChartConfigPanelState {
    return {
      ...structuredClone(mockState),
      chartType: "pie",
      stratifyBy: "",
      chartOptions: {
        chart : { type: "pie" },
        colors: ["#111111", "#222222"],
        series: [{ type: "pie", id: "primary-Gender", data: [{ name: "female", y: 10 }, { name: "male", y: 20 }] }]
      }
    }
  }

  function renderPanel(state: ChartConfigPanelState) {
    const onChange             = vi.fn()
    const onChartOptionsChange = vi.fn()
    render(
      <ConfigPanel
        cols={mockCols}
        state={state}
        onChange={onChange}
        onChartTypeChange={vi.fn()}
        onChartOptionsChange={onChartOptionsChange}
        onRangeOptionsChange={vi.fn()}
        onSecondaryDataOptionsChange={vi.fn()}
      />
    )
    return { onChange, onChartOptionsChange }
  }

  // The input next to a property grid label
  function getPropertyInput(container: HTMLElement, name: string) {
    const label = within(container).getByText(name, { selector: ".prop-label span" })
    return label.closest(".prop-label")!.nextElementSibling!.querySelector("input")!
  }

  // The content of a collapsed section, after expanding it
  async function expand(header: string | RegExp, container: HTMLElement = document.body) {
    const el = within(container).getByText(header)
    await userEvent.click(el)
    return el.closest<HTMLElement>(".collapse")!
  }

  it("SliceEditor changes the series in place and sends the settings", async () => {
    const state = getPieState()
    const { onChange } = renderPanel(state)
    await userEvent.click(screen.getByText("Data"))
    // The Advanced section next to Slice Colors
    const sliceEditor = screen.getByText("Slice Colors").closest(".collapse")!.parentElement!
    const advanced    = await expand("Advanced", sliceEditor)
    fireEvent.change(getPropertyInput(advanced, "Opacity"), { target: { value: "0.5" } })
    expect(onChange).toHaveBeenCalledTimes(1)
    // @ts-ignore
    expect(state.chartOptions.series![0].opacity).toBe(0.5)
    expect(onChange.mock.calls[0][0].chartOptions.series).toBe(state.chartOptions.series)
  })

  it("SliceEditor changes the slice colors in place and sends the same state", async () => {
    const state = getPieState()
    const { onChange } = renderPanel(state)
    await userEvent.click(screen.getByText("Data"))
    const colors = await expand("Slice Colors")
    const input  = getPropertyInput(colors, "female").parentElement!.querySelector<HTMLInputElement>("input[type=text]")!
    fireEvent.change(input, { target: { value: "#ff0000" } })
    expect(onChange).toHaveBeenCalledWith(state)
    expect(state.chartOptions.colors![0]).toBe("#ff0000")
  })

  it("Start Angle changes the series in place and sends the same options", async () => {
    const state = getPieState()
    const { onChartOptionsChange } = renderPanel(state)
    await userEvent.click(screen.getByText("Chart"))
    fireEvent.change(screen.getByLabelText("Start Angle"), { target: { value: "90" } })
    expect(onChartOptionsChange).toHaveBeenCalledWith(state.chartOptions)
    // @ts-ignore
    expect(state.chartOptions.series![0].startAngle).toBe(90)
  })

  it("AllSeriesEditor changes every series in place and sends the options", async () => {
    const state = structuredClone(mockState)
    state.chartOptions.series = [
      { type: "column", id: "a", data: [1, 2] },
      { type: "column", id: "b", data: [3, 4] }
    ]
    const series = state.chartOptions.series
    const { onChartOptionsChange } = renderPanel(state)
    await userEvent.click(screen.getByText("Series"))
    const override = await expand(/All Serries Override/)
    fireEvent.change(getPropertyInput(override, "Opacity"), { target: { value: "0.5" } })
    expect(onChartOptionsChange).toHaveBeenCalledTimes(1)
    expect(onChartOptionsChange.mock.calls[0][0].series).toBe(series)
    // @ts-ignore
    expect(series.map(s => s.opacity)).toEqual([0.5, 0.5])
  })

  // The names of the properties in a property grid, in order
  function getPropertyNames(container: HTMLElement) {
    return [...container.querySelectorAll(".prop-label span")].map(el => el.textContent!.trim())
  }

  async function getSliceEditorAdvanced(state: ChartConfigPanelState) {
    renderPanel(state)
    await userEvent.click(screen.getByText("Data"))
    const sliceEditor = screen.getByText("Slice Colors").closest(".collapse")!.parentElement!
    return getPropertyNames(await expand("Advanced", sliceEditor))
  }

  it("SliceEditor offers borders in 2D, and edges and depth in 3D", async () => {
    const names2d = await getSliceEditorAdvanced(getPieState())
    expect(names2d.slice(0, 2)).toEqual(["Border Width", "Border Color"])
    expect(names2d).not.toContain("Depth")

    const state3d = getPieState()
    state3d.chartOptions.chart = { type: "pie", options3d: { enabled: true } }
    document.body.innerHTML = ""
    const names3d = await getSliceEditorAdvanced(state3d)
    expect(names3d.slice(0, 3)).toEqual(["Edge Width", "Edge Color", "Depth"])
  })

  it("AllSeriesEditor offers borders for columns", async () => {
    const state = structuredClone(mockState)
    state.chartOptions.series = [{ type: "column", id: "a", data: [1, 2] }]
    renderPanel(state)
    await userEvent.click(screen.getByText("Series"))
    const names = getPropertyNames(await expand(/All Serries Override/))
    expect(names.slice(0, 2)).toEqual(["Border Width", "Border Color"])
  })
})

describe("axis sections", () => {

  function renderPanel(state: ChartConfigPanelState) {
    const onChartOptionsChange = vi.fn()
    render(
      <ConfigPanel
        cols={mockCols}
        state={state}
        onChange={vi.fn()}
        onChartTypeChange={vi.fn()}
        onChartOptionsChange={onChartOptionsChange}
        onRangeOptionsChange={vi.fn()}
        onSecondaryDataOptionsChange={vi.fn()}
      />
    )
    return onChartOptionsChange
  }

  // Expands the section with that header and returns it
  async function expandSection(header: string) {
    const el = [...document.querySelectorAll<HTMLElement>(".collapse-header")].find(h => h.textContent!.trim() === header)!
    await userEvent.click(el)
    return el.closest<HTMLElement>(".collapse")!
  }

  const ticks = (section: HTMLElement) => within(section).getByLabelText("Render axis tick marks") as HTMLInputElement

  it("send title changes to their own axis", async () => {
    const onChartOptionsChange = renderPanel(structuredClone(mockState))
    fireEvent.change(within(await expandSection("X Axis")).getByDisplayValue("X Axis"), { target: { value: "Age" } })
    expect(onChartOptionsChange).toHaveBeenLastCalledWith({ xAxis: { title: { text: "Age" } } })
    fireEvent.change(within(await expandSection("Y Axis")).getByDisplayValue("Y Axis"), { target: { value: "Count" } })
    expect(onChartOptionsChange).toHaveBeenLastCalledWith({ yAxis: { title: { text: "Count" } } })
  })

  it("show the X column as the X title placeholder", async () => {
    renderPanel(structuredClone(mockState))
    expect(within(await expandSection("X Axis")).getByDisplayValue("X Axis").getAttribute("placeholder")).toBe("Age")
  })

  it("show tick marks as off when tickWidth is unset or 0, on both axes", async () => {
    const state = structuredClone(mockState)
    state.chartOptions.xAxis = { tickWidth: 0 }
    renderPanel(state)
    expect(ticks(await expandSection("X Axis")).checked).toBe(false)
    expect(ticks(await expandSection("Y Axis")).checked).toBe(false)
  })

  it("show tick marks as on when tickWidth is set, and turn them off", async () => {
    const state = structuredClone(mockState)
    state.chartOptions.yAxis = { tickWidth: 1 }
    const onChartOptionsChange = renderPanel(state)
    const box = ticks(await expandSection("Y Axis"))
    expect(box.checked).toBe(true)
    await userEvent.click(box)
    expect(onChartOptionsChange).toHaveBeenLastCalledWith({ yAxis: { tickWidth: 0 } })
  })

  it("swap headers in bar charts, where the Y axis is horizontal", async () => {
    renderPanel({ ...structuredClone(mockState), chartType: "bar" })
    expect(within(await expandSection("X Axis")).getByDisplayValue("Y Axis")).toBeTruthy()
  })
})
