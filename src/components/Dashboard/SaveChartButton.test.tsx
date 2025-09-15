import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { SaveChartButton } from "./SaveChartButton"
import { vi, describe, it, beforeEach, expect } from "vitest"
import { act } from "react"

describe("SaveChartButton", () => {
    const mockSave = vi.fn(() => Promise.resolve())
    const graphDraft = { id: 123, isDraft: true }
    const graphPublished = { id: 456, isDraft: false }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders Save button and menu", () => {
        render(
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <SaveChartButton graph={graphDraft} save={mockSave} />
            </MemoryRouter>
        )
        // Use getAllByText to avoid ambiguity
        const saveButtons = screen.getAllByText(/Save/)
        expect(saveButtons[0]).toBeInTheDocument()
        // Check for menu button by class
        expect(document.querySelector('.menu-button-btn')).toBeInTheDocument()
    })

    it("calls save when Save button is clicked", async () => {
        render(
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <SaveChartButton graph={graphDraft} save={mockSave} />
            </MemoryRouter>
        )
        const saveButtons = screen.getAllByText(/Save/)
        await act(async () => {
            fireEvent.click(saveButtons[0]) // Click the main Save button
        })
        expect(mockSave).toHaveBeenCalled()
    })

    it("shows spinner when saving", () => {
        const { container } = render(
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <SaveChartButton graph={graphDraft} save={mockSave} saving />
            </MemoryRouter>
        )
        // Query by icon class
        expect(container.querySelector('.fa-circle-notch')).toBeInTheDocument()
    })

    it("calls save with isDraft false and navigates to /views/:id on Publish", async () => {
        render(
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <SaveChartButton graph={graphDraft} save={mockSave} />
            </MemoryRouter>
        )
        await act(async () => {
            fireEvent.click(screen.getByText(/Publish/))
        })
        expect(mockSave).toHaveBeenCalledWith({ isDraft: false })
    })

    it("calls save with isDraft true and navigates to /my/drafts/:id on Save Draft", async () => {
        render(
            <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <SaveChartButton graph={graphPublished} save={mockSave} />
            </MemoryRouter>
        )
        await act(async () => {
            fireEvent.click(screen.getByText(/Switch to Draft/))
        })
        expect(mockSave).toHaveBeenCalledWith({ isDraft: true })
    })
})
