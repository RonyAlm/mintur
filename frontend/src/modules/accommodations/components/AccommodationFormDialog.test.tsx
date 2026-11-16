import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { Accommodation } from "../types/accommodation.types"
import { AccommodationFormDialog } from "./AccommodationFormDialog"

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock("../api/accommodations.api", () => ({
  accommodationsApi: { create: vi.fn(), update: vi.fn() },
}))

const accommodation: Accommodation = {
  id: "stay-1",
  organizationId: "org-1",
  type: "HOTEL",
  isActive: true,
  capacity: 20,
  totalRooms: 10,
  totalBeds: 15,
  image: null,
  locality: "Formosa",
  address: "Calle 1",
  addressMap: null,
  phoneOne: null,
  phoneTwo: null,
  email: null,
  website: null,
  instagram: null,
  facebook: null,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
  organization: { id: "org-1", name: "Hotel Central", description: null },
}

function renderDialog(
  props: Partial<Parameters<typeof AccommodationFormDialog>[0]> = {},
) {
  const resolvedProps = {
    open: true,
    accommodation: null,
    onOpenChange: vi.fn(),
    onSaved: vi.fn(),
    ...props,
  }
  const view = render(<AccommodationFormDialog {...resolvedProps} />)
  return { ...view, props: resolvedProps }
}

describe("AccommodationFormDialog", () => {
  afterEach(cleanup)

  it("prefills the form with the accommodation being edited", async () => {
    const user = userEvent.setup()
    renderDialog({ accommodation })

    expect(screen.getByText("Editar alojamiento")).toBeInTheDocument()
    expect(screen.getByLabelText("Nombre *")).toHaveValue("Hotel Central")

    await user.click(screen.getByRole("button", { name: "Siguiente" }))

    expect(await screen.findByLabelText("Capacidad (plazas)")).toHaveValue(20)
  })

  it("resets the step and the values when the dialog is reopened", async () => {
    const user = userEvent.setup()
    const { rerender, props } = renderDialog()

    expect(screen.getByText("Nuevo alojamiento")).toBeInTheDocument()
    await user.type(screen.getByLabelText("Nombre *"), "Organización temporal")
    await user.click(screen.getByRole("button", { name: "Siguiente" }))
    expect(await screen.findByLabelText("Capacidad (plazas)")).toBeInTheDocument()
    expect(screen.getByText("2.").closest("li")).toHaveAttribute("aria-current", "step")

    rerender(<AccommodationFormDialog {...props} open={false} />)
    rerender(<AccommodationFormDialog {...props} open />)

    expect(screen.getByText("1.").closest("li")).toHaveAttribute("aria-current", "step")
    expect(screen.getByLabelText("Nombre *")).toHaveValue("")
  })
})
