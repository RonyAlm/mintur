import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"

import { AccommodationsTable } from "./AccommodationsTable"
import type { Accommodation } from "../types/accommodation.types"

afterEach(cleanup)

const accommodation: Accommodation = {
  id: "accommodation-1",
  organizationId: "organization-1",
  type: "HOTEL",
  isActive: true,
  capacity: 20,
  totalRooms: 8,
  totalBeds: 16,
  image: null,
  locality: "Formosa",
  address: "Calle 1",
  addressMap: null,
  phoneOne: "3704000000",
  phoneTwo: null,
  email: null,
  website: null,
  instagram: null,
  facebook: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  organization: { id: "organization-1", name: "Hotel Central", description: null },
}

describe("AccommodationsTable column menu", () => {
  it("toggles optional columns without navigating away", async () => {
    const user = userEvent.setup()
    render(<AccommodationsTable accommodations={[accommodation]} loading={false} />)

    expect(screen.queryByRole("columnheader", { name: "Habitaciones" })).not.toBeInTheDocument()

    const trigger = screen.getByRole("button", { name: "Columnas" })
    await user.click(trigger)
    const menu = await screen.findByRole("menu")
    await user.click(within(menu).getByRole("menuitem", { name: "Habitaciones" }))

    expect(screen.getByRole("columnheader", { name: "Habitaciones" })).toBeInTheDocument()
    expect(screen.getByText("Hotel Central")).toBeInTheDocument()
  })

})

describe("AccommodationsTable search", () => {
  const secondAccommodation: Accommodation = {
    ...accommodation,
    id: "accommodation-2",
    organizationId: "organization-2",
    locality: "Clorinda",
    address: "Avenida 25",
    type: "HOSTEL",
    organization: { id: "organization-2", name: "Hostel Norte", description: null },
  }

  it.each([
    ["name", "hotel central", "Hotel Central"],
    ["locality", "clorinda", "Hostel Norte"],
    ["address", "avenida 25", "Hostel Norte"],
    ["type", "hostel", "Hostel Norte"],
  ])("filters accommodations by %s, case-insensitively", async (_field, query, expectedName) => {
    const user = userEvent.setup()
    render(<AccommodationsTable accommodations={[accommodation, secondAccommodation]} loading={false} />)

    await user.type(screen.getByRole("textbox", { name: "Buscar alojamientos" }), query)

    expect(screen.getByText(expectedName)).toBeInTheDocument()
    expect(screen.queryByText(expectedName === "Hotel Central" ? "Hostel Norte" : "Hotel Central")).not.toBeInTheDocument()
    expect(screen.getByText("1")).toBeInTheDocument()
  })

  it("shows an empty-search message and restores rows when cleared", async () => {
    const user = userEvent.setup()
    render(<AccommodationsTable accommodations={[accommodation, secondAccommodation]} loading={false} />)
    const input = screen.getByRole("textbox", { name: "Buscar alojamientos" })

    await user.type(input, "missing place")
    expect(screen.getByText(/No hay coincidencias para/)).toBeInTheDocument()

    await user.clear(input)
    expect(screen.getByText("Hotel Central")).toBeInTheDocument()
    expect(screen.getByText("Hostel Norte")).toBeInTheDocument()
  })
})

describe("AccommodationsTable sorting", () => {
  const sortedAccommodations: Accommodation[] = [
    {
      ...accommodation,
      id: "accommodation-zeta",
      locality: "Zeta",
      isActive: true,
      organization: { ...accommodation.organization, name: "Hotel Zeta" },
    },
    {
      ...accommodation,
      id: "accommodation-alpha",
      locality: "Alpha",
      isActive: false,
      organization: { ...accommodation.organization, name: "Hotel Alpha" },
    },
    {
      ...accommodation,
      id: "accommodation-mora",
      locality: "Mora",
      isActive: true,
      organization: { ...accommodation.organization, name: "Hotel Mora" },
    },
  ]

  const bodyRows = () => screen.getAllByRole("row").slice(1)

  it("sorts by locality in ascending and descending order", async () => {
    const user = userEvent.setup()
    render(<AccommodationsTable accommodations={sortedAccommodations} loading={false} />)

    await user.click(screen.getByRole("button", { name: "Localidad" }))
    expect(bodyRows().map((row) => within(row).getAllByRole("cell")[1].textContent)).toEqual([
      "Alpha",
      "Mora",
      "Zeta",
    ])

    await user.click(screen.getByRole("button", { name: "Localidad" }))
    expect(bodyRows().map((row) => within(row).getAllByRole("cell")[1].textContent)).toEqual([
      "Zeta",
      "Mora",
      "Alpha",
    ])
  })

  it("sorts by status in ascending and descending order", async () => {
    const user = userEvent.setup()
    render(<AccommodationsTable accommodations={sortedAccommodations} loading={false} />)

    await user.click(screen.getByRole("button", { name: "Estado" }))
    expect(bodyRows().map((row) => within(row).getAllByRole("cell")[6].textContent)).toEqual([
      "Inactivo",
      "Activo",
      "Activo",
    ])

    await user.click(screen.getByRole("button", { name: "Estado" }))
    expect(bodyRows().map((row) => within(row).getAllByRole("cell")[6].textContent)).toEqual([
      "Activo",
      "Activo",
      "Inactivo",
    ])
  })
})
