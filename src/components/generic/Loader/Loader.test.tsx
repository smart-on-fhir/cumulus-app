import { render } from "@testing-library/react"
import Loader from "./index"

it("renders Loader with default message", () => {
  const { container } = render(<Loader />)
  expect(container).toHaveTextContent("Loading...")
  expect(container.querySelector(".fa-spin")).toBeInTheDocument()
})

it("renders Loader with custom message", () => {
  const { container } = render(<Loader msg="Please wait" />)
  expect(container).toHaveTextContent("Please wait")
})
