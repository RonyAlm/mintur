import { describe, expect, it } from "vitest"
import type { AccommodationStatisticsSummary } from "@/modules/accommodations/types/accommodation-statistics.types"
import {
  buildComparison,
  buildDailyEvolution,
  buildLatestRecords,
  buildPurposeDistribution,
  buildWeeklyGuests,
  computeLoadAlerts,
  countDistinctOrigins,
  getMinistryPeriodRange,
  getPreviousPeriodRange,
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

describe("getMinistryPeriodRange", () => {
  const today = new Date(2026, 10, 16) // 16/11/2026

  it("computes the last 7 days", () => {
    expect(getMinistryPeriodRange("7d", today)).toEqual({ from: "2026-11-10", to: "2026-11-16" })
  })

  it("computes the last 30 days", () => {
    expect(getMinistryPeriodRange("30d", today)).toEqual({ from: "2026-10-18", to: "2026-11-16" })
  })

  it("computes the current month", () => {
    expect(getMinistryPeriodRange("month", today)).toEqual({ from: "2026-11-01", to: "2026-11-16" })
  })
})

describe("getPreviousPeriodRange", () => {
  it("returns the immediately preceding range of the same duration", () => {
    expect(getPreviousPeriodRange({ from: "2026-11-10", to: "2026-11-16" })).toEqual({
      from: "2026-11-03",
      to: "2026-11-09",
    })
  })
})

describe("buildLatestRecords", () => {
  const records = [
    { id: "1", accommodationId: "a", date: "2026-11-10", totalGuests: 4, ageRanges: [], travelPurposes: [], origins: [] },
    { id: "2", accommodationId: "b", date: "2026-11-15", totalGuests: 9, ageRanges: [], travelPurposes: [], origins: [] },
  ]

  it("sorts by date desc and resolves the accommodation name", () => {
    const result = buildLatestRecords(records, new Map([["a", "Hotel A"], ["b", "Hotel B"]]))
    expect(result.map((r) => r.accommodationName)).toEqual(["Hotel B", "Hotel A"])
    expect(result[0].totalGuests).toBe(9)
  })
})

describe("computeLoadAlerts", () => {
  const now = new Date(2026, 10, 16)
  const accommodations = [
    { id: "a", name: "Hotel A" },
    { id: "b", name: "Hotel B" },
    { id: "c", name: "Hotel C" },
  ]

  it("flags accommodations with no recent load, never-loaded first", () => {
    const latest = new Map<string, string | null>([
      ["a", "2026-11-15"],
      ["b", "2026-11-10"],
      ["c", null],
    ])
    const result = computeLoadAlerts(accommodations, latest, now, 5)
    expect(result.map((r) => r.accommodationId)).toEqual(["c", "b"])
    expect(result[0].daysSinceLoad).toBeNull()
    expect(result[1].daysSinceLoad).toBe(6)
  })
})

describe("buildComparison", () => {
  it("computes delta and percentage", () => {
    expect(buildComparison(120, 100)).toEqual({ current: 120, previous: 100, delta: 20, deltaPercent: 20 })
  })

  it("returns null percentage when previous is zero", () => {
    expect(buildComparison(80, 0)).toEqual({ current: 80, previous: 0, delta: 80, deltaPercent: null })
  })
})
