import { render } from "@testing-library/react"
import Alert, { AlertError } from "./index"

it("renders Alert with children and color", () => {
  const { container } = render(
    <Alert color="blue" icon="fa-info">Hello</Alert>
  )
  expect(container.firstChild).toHaveClass("alert-blue")
  expect(container.querySelector(".icon")).toHaveClass("fa-info")
  expect(container).toHaveTextContent("Hello")
})

it("renders AlertError with error message", () => {
  const { container } = render(
    <AlertError>Test error</AlertError>
  )
  expect(container.firstChild).toHaveClass("alert-red")
  expect(container).toHaveTextContent("Test error")
})

it("renders AlertError with Error object", () => {
  const error = new Error("Boom!")
  const { container } = render(
    <AlertError>{error}</AlertError>
  )
  expect(container).toHaveTextContent("Boom!")
})
