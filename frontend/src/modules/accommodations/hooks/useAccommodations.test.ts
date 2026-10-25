import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { accommodationsApi } from "../api/accommodations.api"
import type { Accommodation } from "../types/accommodation.types"
import { useAccommodations } from "./useAccommodations"

vi.mock("../api/accommodations.api", () => ({
  accommodationsApi: {
    list: vi.fn(),
    activate: vi.fn(),
    deactivate: vi.fn(),
  },
}))

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

const mockedApi = vi.mocked(accommodationsApi)

describe("useAccommodations", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockedApi.list.mockResolvedValue([accommodation])
    mockedApi.activate.mockResolvedValue(accommodation)
    mockedApi.deactivate.mockResolvedValue(accommodation)
  })

  it("loads accommodations and clears loading when enabled", async () => {
    const { result } = renderHook(() => useAccommodations())

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(mockedApi.list).toHaveBeenCalledOnce()
    expect(result.current.accommodations).toEqual([accommodation])
    expect(result.current.error).toBeNull()
  })

  it("does not load accommodations when disabled", async () => {
    const { result } = renderHook(() => useAccommodations(false))

    expect(result.current.loading).toBe(false)
    expect(mockedApi.list).not.toHaveBeenCalled()
  })

  it("sets an error and clears loading when loading fails", async () => {
    mockedApi.list.mockRejectedValueOnce(new Error("List failed"))
    const { result } = renderHook(() => useAccommodations())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe("List failed")
    expect(result.current.accommodations).toEqual([])
  })

  it.each([
    { isActive: true, method: "deactivate" as const },
    { isActive: false, method: "activate" as const },
  ])("$method an accommodation and reloads the list", async ({ isActive, method }) => {
    const { result } = renderHook(() => useAccommodations())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.toggleAccommodation({ ...accommodation, isActive })
    })

    expect(mockedApi[method]).toHaveBeenCalledWith(accommodation.id)
    expect(mockedApi.list).toHaveBeenCalledTimes(2)
  })

  it("retains the mutation error and propagates a failed activation", async () => {
    const mutationError = new Error("Activation failed")
    mockedApi.activate.mockRejectedValueOnce(mutationError)
    const { result } = renderHook(() => useAccommodations())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let rejectedError: unknown
    await act(async () => {
      try {
        await result.current.toggleAccommodation({ ...accommodation, isActive: false })
      } catch (error) {
        rejectedError = error
      }
    })

    expect(rejectedError).toBe(mutationError)
    expect(result.current.error).toBe("Activation failed")
    expect(mockedApi.list).toHaveBeenCalledOnce()
  })
})
