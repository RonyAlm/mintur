import { beforeEach, describe, expect, it, vi } from "vitest"
import type { AccommodationDailyStatistic, AccommodationStatisticsSummary } from "../types/accommodation-statistics.types"
import { exportAccommodationStatisticsToPdf } from "./exportStatisticsPdf"

const { saveMock, autoTableMock } = vi.hoisted(() => ({
  saveMock: vi.fn(),
  autoTableMock: vi.fn(),
}))

vi.mock("jspdf", () => {
  class MockJsPDF {
    setFont = vi.fn()
    setFontSize = vi.fn()
    setTextColor = vi.fn()
    setDrawColor = vi.fn()
    setFillColor = vi.fn()
    setLineWidth = vi.fn()
    text = vi.fn()
    moveTo = vi.fn()
    lineTo = vi.fn()
    close = vi.fn()
    fill = vi.fn()
    stroke = vi.fn()
    rect = vi.fn()
    circle = vi.fn()
    addPage = vi.fn()
    save = saveMock
    internal = { pageSize: { getHeight: () => 297 } }
    lastAutoTable = { finalY: 200 }
  }
  return { jsPDF: MockJsPDF }
})

vi.mock("jspdf-autotable", () => ({
  default: autoTableMock,
}))

const summary: AccommodationStatisticsSummary = {
  from: "2026-10-01",
  to: "2026-10-31",
  totalGuests: 40,
  ageRanges: [
    { ageRange: "AGE_18_30", quantity: 20 },
    { ageRange: "AGE_31_45", quantity: 20 },
  ],
  travelPurposes: [
    { purpose: "TOURISM", quantity: 30 },
    { purpose: "WORK", quantity: 10 },
  ],
  origins: [
    { type: "PROVINCE", name: "Formosa", quantity: 25 },
    { type: "COUNTRY", name: "Brasil", quantity: 15 },
  ],
}

const records: AccommodationDailyStatistic[] = [
  { id: "r2", accommodationId: "a1", date: "2026-10-02", totalGuests: 10, ageRanges: [], travelPurposes: [], origins: [] },
  { id: "r1", accommodationId: "a1", date: "2026-10-01", totalGuests: 5, ageRanges: [], travelPurposes: [], origins: [] },
]

describe("exportAccommodationStatisticsToPdf", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("saves a PDF with a sanitized filename", () => {
    exportAccommodationStatisticsToPdf(summary, records, {
      range: { from: "2026-10-01", to: "2026-10-31" },
    })

    expect(saveMock).toHaveBeenCalledTimes(1)
    expect(saveMock).toHaveBeenCalledWith("reporte-de-estadisticas.pdf")
  })

  it("builds one table per report section with the mapped labels", () => {
    exportAccommodationStatisticsToPdf(summary, records, {
      range: { from: "2026-10-01", to: "2026-10-31" },
    })

    expect(autoTableMock).toHaveBeenCalledTimes(4)
    const [evolution, ages, purposes, origins] = autoTableMock.mock.calls.map((call) => call[1] as {
      head: string[][]
      body: string[][]
    })

    // Evolución: ordenada por fecha (2026-10-01 con 5 huéspedes va primero).
    expect(evolution.head).toEqual([["Fecha", "Huéspedes"]])
    expect(evolution.body).toHaveLength(2)
    expect(evolution.body[0][0]).toEqual(expect.any(String))
    expect(evolution.body[0][1]).toBe("5")
    expect(evolution.body[1][1]).toBe("10")

    expect(ages.head).toEqual([["Rango de edad", "Huéspedes"]])
    expect(ages.body).toEqual([
      ["18 a 30 años", "20"],
      ["31 a 45 años", "20"],
    ])

    expect(purposes.head).toEqual([["Motivo", "Huéspedes"]])
    expect(purposes.body).toEqual([
      ["Turismo", "30"],
      ["Trabajo", "10"],
    ])

    expect(origins.head).toEqual([["Procedencia", "Tipo", "Huéspedes"]])
    expect(origins.body).toEqual([
      ["Formosa", "Provincia", "25"],
      ["Brasil", "País", "15"],
    ])
  })
})
