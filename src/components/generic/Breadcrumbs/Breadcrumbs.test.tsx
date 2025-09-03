import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import Breadcrumbs, { BreadcrumbLink } from "./index"

const links: BreadcrumbLink[] = [
  { name: "Home", href: "/" },
  { name: "Page", href: "/page" },
  { name: "Current" }
]

it("renders breadcrumbs with links and current", () => {
  const { container } = render(
    <MemoryRouter>
      <Breadcrumbs links={links} />
    </MemoryRouter>
  )
  expect(container).toHaveTextContent("Home")
  expect(container).toHaveTextContent("Page")
  expect(container).toHaveTextContent("Current")
  expect(container.querySelectorAll("a").length).toBe(2)
})

it("renders historic breadcrumbs", () => {
  const { container } = render(
    <MemoryRouter>
      <Breadcrumbs links={links} historic />
    </MemoryRouter>
  )
  expect(container).toHaveTextContent("Home")
  expect(container).toHaveTextContent("Page")
  expect(container).toHaveTextContent("Current")
})
