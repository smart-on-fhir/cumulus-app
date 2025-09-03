import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Checkbox from "./index"

it("renders Checkbox and toggles checked state", async () => {
  let checked = false
  const handleChange = (val: boolean) => { checked = val }
  const { getByRole } = render(
    <Checkbox checked={checked} onChange={handleChange} name="test" label="Test Label" />
  )
  const input = getByRole("checkbox")
  expect(input).not.toBeChecked()
  await userEvent.click(input)
  expect(checked).toBe(true)
})

it("renders Checkbox with labelLeft", () => {
  const { getByText } = render(
    <Checkbox checked={false} onChange={() => {}} name="test" label="Test Label" labelLeft />
  )
  expect(getByText("Test Label")).toBeInTheDocument()
})

it("renders Checkbox with description", () => {
  const { getByText } = render(
    <Checkbox checked={false} onChange={() => {}} name="test" description="Desc" />
  )
  expect(getByText("Desc")).toBeInTheDocument()
})
