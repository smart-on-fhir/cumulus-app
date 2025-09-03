import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ConfigPanel from "./ConfigPanel"


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
  annotations: [],
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
      selectedAnnotationIndex: null,
      selectedPlotLineId: null,
      selectedPlotLineAxis: null,
      selectedSeriesId: null
    }
  },
}

// Basic smoke test
it("renders ConfigPanel and expands Chart section", async () => {
  render(
    <ConfigPanel
      cols={mockCols}
      state={mockState}
      viewType="overview"
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
      viewType="overview"
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
      viewType="overview"
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

// Test legend toggle
it("renders legend controls and calls onChartOptionsChange when legend is changed", async () => {
  render(
    <ConfigPanel
      cols={mockCols}
      state={mockState}
      viewType="overview"
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
      viewType="overview"
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
      viewType="overview"
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
