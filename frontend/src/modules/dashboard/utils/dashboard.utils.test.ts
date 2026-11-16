import { describe, expect, it } from "vitest"
import type { AccommodationStatisticsSummary } from "@/modules/accommodations/types/accommodation-statistics.types"
import {
  buildDailyEvolution,
  buildPurposeDistribution,
  buildWeeklyGuests,
  countDistinctOrigins,
  resolveDashboardVariant,
} from "./dashboard.utils"

const summary: AccommodationStatisticsSummary = {
  from: "2026-11-01",
  to: "2026-11-30",
  totalGuests: 42,
  ageRanges: [],
  travelPurposes: [
    { purpose: "TOURISM", quantity: 20 },
    { purpose: "WORK", quantity: 12 },
    { purpose: "OTHER", quantity: 0 },
  ],
  origins: [
    { type: "PROVINCE", name: "Mendoza", quantity: 10 },
    { type: "PROVINCE", name: "Mendoza", quantity: 5 },
    { type: "COUNTRY", name: "Chile", quantity: 8 },
    { type: "COUNTRY", name: "  ", quantity: 2 },
  ],
}

describe("resolveDashboardVariant", () => {
  it("routes a system role to the ministry view", () => {
    expect(resolveDashboardVariant(true, [])).toBe("ministry")
  })

  it("routes OWNER and ADMIN memberships to the owner view", () => {
    expect(resolveDashboardVariant(false, [{ role: "OWNER" }])).toBe("owner")
    expect(resolveDashboardVariant(false, [{ role: "ADMIN" }, { role: "OPERATOR" }])).toBe("owner")
  })

  it("routes an OPERATOR membership to the operator view", () => {
    expect(resolveDashboardVariant(false, [{ role: "OPERATOR" }])).toBe("operator")
  })

  it("falls back to ministry when there is no membership nor system role", () => {
    expect(resolveDashboardVariant(false, [])).toBe("ministry")
  })
})

describe("buildPurposeDistribution", () => {
  it("labels purposes and omits zero-quantity entries", () => {
    expect(buildPurposeDistribution(summary)).toEqual([
      { name: "Turismo", quantity: 20 },
      { name: "Trabajo", quantity: 12 },
    ])
  })

  it("returns an empty array when there is no summary", () => {
    expect(buildPurposeDistribution(null)).toEqual([])
  })
})

describe("buildDailyEvolution", () => {
  it("sorts records by date and maps guests", () => {
    const records = [
      { id: "2", accommodationId: "a", date: "2026-11-03", totalGuests: 7, ageRanges: [], travelPurposes: [], origins: [] },
      { id: "1", accommodationId: "a", date: "2026-11-01", totalGuests: 3, ageRanges: [], travelPurposes: [], origins: [] },
    ]
    const result = buildDailyEvolution(records)
    expect(result.map((point) => point.guests)).toEqual([3, 7])
    expect(result[0].label).toBe("1 nov")
  })
})

describe("buildWeeklyGuests", () => {
  it("aggregates guests per ISO week and sorts by week start", () => {
    const records = [
      { id: "1", accommodationId: "a", date: "2026-11-02", totalGuests: 5, ageRanges: [], travelPurposes: [], origins: [] }, // lunes
      { id: "2", accommodationId: "a", date: "2026-11-03", totalGuests: 3, ageRanges: [], travelPurposes: [], origins: [] }, // martes
      { id: "3", accommodationId: "a", date: "2026-11-09", totalGuests: 7, ageRanges: [], travelPurposes: [], origins: [] }, // lunes siguiente
    ]
    const result = buildWeeklyGuests(records)
    expect(result).toHaveLength(2)
    expect(result[0].guests).toBe(8)
    expect(result[1].guests).toBe(7)
  })
})

describe("countDistinctOrigins", () => {
  it("counts distinct normalized origin names ignoring blanks", () => {
    expect(countDistinctOrigins(summary)).toBe(2)
  })

  it("returns zero when there is no summary", () => {
    expect(countDistinctOrigins(null)).toBe(0)
  })
})
