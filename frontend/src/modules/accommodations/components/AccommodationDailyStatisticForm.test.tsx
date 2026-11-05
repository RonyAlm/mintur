import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { accommodationStatisticsApi } from "../api/accommodation-statistics.api"
import AccommodationDailyStatisticForm from "./AccommodationDailyStatisticForm"

vi.mock("../api/accommodation-statistics.api", () => ({
  accommodationStatisticsApi: {
    createDailyStatistic: vi.fn(),
    updateDailyStatistic: vi.fn(),
  },
}))

vi.mock("../api/georef.api", () => ({
  georefApi: {
    listProvinces: vi.fn().mockResolvedValue([
      { id: "34", nombre: "Formosa" },
      { id: "22", nombre: "Chaco" },
      { id: "18", nombre: "Corrientes" },
      { id: "06", nombre: "Buenos Aires" },
    ]),
  },
}))

async function switchTab(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole("tab", { name }))
}

async function pickProvince(user: ReturnType<typeof userEvent.setup>, index: number, province: string) {
  await user.click(screen.getByRole("combobox", { name: `Nombre de procedencia ${index}` }))
  await user.click(await screen.findByRole("option", { name: province }))
}

describe("AccommodationDailyStatisticForm", () => {
  const onCreated = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(accommodationStatisticsApi.createDailyStatistic).mockResolvedValue({} as never)
    vi.mocked(accommodationStatisticsApi.updateDailyStatistic).mockResolvedValue({} as never)
  })

  afterEach(cleanup)

  it("submits only nonzero breakdown rows", async () => {
    const user = userEvent.setup()
    render(<AccommodationDailyStatisticForm accommodationId="accommodation-1" onCreated={onCreated} onCancel={vi.fn()} />)

    expect(screen.getByLabelText("Hasta 12 años")).toBeInTheDocument()
    expect(screen.getByLabelText("13 a 17 años")).toBeInTheDocument()
    expect(screen.getByLabelText("18 a 30 años")).toBeInTheDocument()
    expect(screen.getByLabelText("31 a 45 años")).toBeInTheDocument()
    expect(screen.getByLabelText("46 a 60 años")).toBeInTheDocument()
    expect(screen.getByLabelText("61 años o más")).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText("Total de huéspedes"), { target: { value: "2" } })
    fireEvent.change(screen.getByLabelText("18 a 30 años"), { target: { value: "2" } })

    await switchTab(user, "Motivos de viaje")
    fireEvent.change(screen.getByLabelText("Motivo Turismo"), { target: { value: "2" } })

    await switchTab(user, "Procedencias")
    await pickProvince(user, 1, "Formosa")
    fireEvent.change(screen.getByLabelText("Huéspedes de procedencia 1"), { target: { value: "2" } })

    fireEvent.click(screen.getByRole("button", { name: "Guardar estadística" }))

    await waitFor(() => expect(accommodationStatisticsApi.createDailyStatistic).toHaveBeenCalledWith(expect.objectContaining({
      accommodationId: "accommodation-1",
      date: expect.any(String),
      totalGuests: 2,
      ageRanges: [{ ageRange: "AGE_18_30", quantity: 2 }],
      travelPurposes: [{ purpose: "TOURISM", quantity: 2 }],
      origins: [{ type: "PROVINCE", name: "Formosa", quantity: 2 }],
    })))
    expect(onCreated).toHaveBeenCalledOnce()
  })

  it("rejects totals that do not match a breakdown before calling the API", async () => {
    const user = userEvent.setup()
    render(<AccommodationDailyStatisticForm accommodationId="accommodation-1" onCreated={onCreated} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByLabelText("Total de huéspedes"), { target: { value: "2" } })
    fireEvent.change(screen.getByLabelText("18 a 30 años"), { target: { value: "2" } })
    await switchTab(user, "Motivos de viaje")
    fireEvent.change(screen.getByLabelText("Motivo Turismo"), { target: { value: "1" } })
    fireEvent.click(screen.getByRole("button", { name: "Guardar estadística" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("La suma de motivos de viaje debe coincidir")
    expect(accommodationStatisticsApi.createDailyStatistic).not.toHaveBeenCalled()
  })

  it("updates an existing record without changing its date or accommodation", async () => {
    const user = userEvent.setup()
    render(<AccommodationDailyStatisticForm
      accommodationId="accommodation-1"
      initialRecord={{
        id: "stat-1",
        accommodationId: "accommodation-1",
        date: "2026-10-28T00:00:00.000Z",
        totalGuests: 1,
        ageRanges: [{ statisticId: "stat-1", ageRange: "AGE_18_30", quantity: 1 }],
        travelPurposes: [{ statisticId: "stat-1", purpose: "TOURISM", quantity: 1 }],
        origins: [{ statisticId: "stat-1", type: "PROVINCE", name: "Formosa", quantity: 1 }],
      }}
      onCreated={onCreated}
      onCancel={vi.fn()}
    />)

    fireEvent.change(screen.getByLabelText("Total de huéspedes"), { target: { value: "3" } })
    fireEvent.change(screen.getByLabelText("18 a 30 años"), { target: { value: "3" } })
    await switchTab(user, "Motivos de viaje")
    fireEvent.change(screen.getByLabelText("Motivo Turismo"), { target: { value: "3" } })
    await switchTab(user, "Procedencias")
    fireEvent.change(screen.getByLabelText("Huéspedes de procedencia 1"), { target: { value: "3" } })
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }))

    await waitFor(() => expect(accommodationStatisticsApi.updateDailyStatistic).toHaveBeenCalledWith("stat-1", expect.objectContaining({
      totalGuests: 3,
      ageRanges: [{ ageRange: "AGE_18_30", quantity: 3 }],
      travelPurposes: [{ purpose: "TOURISM", quantity: 3 }],
      origins: [{ type: "PROVINCE", name: "Formosa", quantity: 3 }],
    })))
    expect(onCreated).toHaveBeenCalledOnce()
  })

  it("pre-fills the date from initialDate for a new statistic", () => {
    render(<AccommodationDailyStatisticForm
      accommodationId="accommodation-1"
      initialDate="2026-11-15"
      onCreated={onCreated}
      onCancel={vi.fn()}
    />)

    expect(screen.getByLabelText("Fecha de la estadística")).toHaveValue("2026-11-15")
  })

  it("filters provinces from Georef and selects one", async () => {
    const user = userEvent.setup()
    render(<AccommodationDailyStatisticForm accommodationId="accommodation-1" onCreated={onCreated} onCancel={vi.fn()} />)

    await switchTab(user, "Procedencias")
    const nameInput = screen.getByRole("combobox", { name: "Nombre de procedencia 1" })

    // Al abrir muestra todas las provincias cargadas desde Georef.
    await user.click(nameInput)
    expect(await screen.findByRole("option", { name: "Formosa" })).toBeInTheDocument()

    // Al escribir se filtra.
    await user.type(nameInput, "Cha")
    expect(await screen.findByRole("option", { name: "Chaco" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "Formosa" })).not.toBeInTheDocument()

    // Seleccionar una opción completa el valor.
    await user.click(screen.getByRole("option", { name: "Chaco" }))
    expect(nameInput).toHaveValue("Chaco")
  })

  it("shows a live subtotal of assigned guests per origin", async () => {
    const user = userEvent.setup()
    render(<AccommodationDailyStatisticForm accommodationId="accommodation-1" onCreated={onCreated} onCancel={vi.fn()} />)

    expect(screen.queryByText(/huéspedes asignados/)).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText("Total de huéspedes"), { target: { value: "5" } })
    await switchTab(user, "Procedencias")
    fireEvent.change(screen.getByLabelText("Huéspedes de procedencia 1"), { target: { value: "3" } })

    expect(screen.getByText("3 de 5 huéspedes asignados")).toBeInTheDocument()
  })

  it("shows live subtotals for age ranges and travel purposes", async () => {
    const user = userEvent.setup()
    render(<AccommodationDailyStatisticForm accommodationId="accommodation-1" onCreated={onCreated} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByLabelText("Total de huéspedes"), { target: { value: "10" } })
    fireEvent.change(screen.getByLabelText("18 a 30 años"), { target: { value: "6" } })
    expect(screen.getByText("6 de 10 huéspedes asignados")).toBeInTheDocument()

    await switchTab(user, "Motivos de viaje")
    fireEvent.change(screen.getByLabelText("Motivo Turismo"), { target: { value: "4" } })
    expect(screen.getByText("4 de 10 huéspedes asignados")).toBeInTheDocument()

    await switchTab(user, "Procedencias")
    expect(screen.getByText("0 de 10 huéspedes asignados")).toBeInTheDocument()
  })

  it("adds and removes origin rows", async () => {
    const user = userEvent.setup()
    render(<AccommodationDailyStatisticForm accommodationId="accommodation-1" onCreated={onCreated} onCancel={vi.fn()} />)

    await switchTab(user, "Procedencias")
    expect(screen.getAllByLabelText(/Nombre de procedencia/)).toHaveLength(1)

    fireEvent.click(screen.getByRole("button", { name: "Agregar procedencia" }))
    expect(screen.getAllByLabelText(/Nombre de procedencia/)).toHaveLength(2)

    fireEvent.click(screen.getByRole("button", { name: "Quitar procedencia 1" }))
    expect(screen.getAllByLabelText(/Nombre de procedencia/)).toHaveLength(1)
  })

  it("rejects duplicated origins (same type and name) before saving", async () => {
    const user = userEvent.setup()
    render(<AccommodationDailyStatisticForm accommodationId="accommodation-1" onCreated={onCreated} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByLabelText("Total de huéspedes"), { target: { value: "4" } })
    fireEvent.change(screen.getByLabelText("18 a 30 años"), { target: { value: "4" } })
    await switchTab(user, "Motivos de viaje")
    fireEvent.change(screen.getByLabelText("Motivo Turismo"), { target: { value: "4" } })
    await switchTab(user, "Procedencias")

    await pickProvince(user, 1, "Formosa")
    fireEvent.change(screen.getByLabelText("Huéspedes de procedencia 1"), { target: { value: "2" } })

    fireEvent.click(screen.getByRole("button", { name: "Agregar procedencia" }))
    await pickProvince(user, 2, "Formosa")
    fireEvent.change(screen.getByLabelText("Huéspedes de procedencia 2"), { target: { value: "2" } })

    fireEvent.click(screen.getByRole("button", { name: "Guardar estadística" }))

    const warningMessage = await screen.findByText(/No podés repetir la misma procedencia/)
    const warning = warningMessage.closest('[data-slot="alert"]')
    expect(warning).not.toBeNull()
    expect(warning).toHaveTextContent("No podés repetir la misma procedencia")
    expect(warning).toHaveTextContent("Revisá las procedencias")
    expect(warning).toHaveClass("border-amber-500/20", "bg-amber-500/5")
    expect(accommodationStatisticsApi.createDailyStatistic).not.toHaveBeenCalled()
  })
})
