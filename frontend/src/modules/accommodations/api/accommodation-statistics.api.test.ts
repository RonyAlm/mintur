import { beforeEach, describe, expect, it, vi } from "vitest"
import { api } from "@/lib/axios"
import { accommodationStatisticsApi } from "./accommodation-statistics.api"

vi.mock("@/lib/axios", () => ({
  api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}))

describe("accommodationStatisticsApi", () => {
  beforeEach(() => vi.clearAllMocks())

  it("requests the all-accommodations summary using the existing date query contract", async () => {
    const summary = {
      from: "2026-10-01",
      to: "2026-10-10",
      totalGuests: 42,
      totalRecords: 7,
      accomodationsCount: 3,
      ageRanges: [],
      travelPurposes: [],
      origins: [],
    }
    vi.mocked(api.get).mockResolvedValueOnce({ data: summary } as never)

    await expect(accommodationStatisticsApi.getAllSummary("2026-10-01", "2026-10-10"))
      .resolves.toEqual(summary)

    expect(api.get).toHaveBeenCalledWith("/accommodation-statistics/summary", {
      params: { from: "2026-10-01", to: "2026-10-10" },
    })
  })
})
