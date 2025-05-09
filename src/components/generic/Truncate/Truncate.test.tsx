import { render } from "@testing-library/react"
import Truncate   from "."


it ("renders full text if shorter than 2 chars", () => {
    const result = render(<Truncate>a</Truncate>);
    const element = result.container.firstElementChild
    expect(element).toHaveAttribute("title", "a");
    expect(element).toHaveTextContent("a");
})


it ("truncates in the middle if longer than 2 chars", () => {
    const result = render(<Truncate>tests</Truncate>);
    const element = result.container.querySelector(".truncated")
    expect(element).toHaveAttribute("title", "tests");
    expect(element).toHaveAttribute("data-content-start", "te");
    expect(element).toHaveAttribute("data-content-end", "sts");
})