import { useCallback, useEffect, useState } from "react"

import { getApiErrorMessage } from "@/lib/api-error"

import { accommodationsApi } from "../api/accommodations.api"
import type { Accommodation } from "../types/accommodation.types"

export function useAccommodations(enabled = true) {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

  const loadAccommodations = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await accommodationsApi.list()
      setAccommodations(result)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (enabled) void loadAccommodations()
  }, [enabled, loadAccommodations])

  const toggleAccommodation = useCallback(
    async (accommodation: Accommodation) => {
      setError(null)

      try {
        if (accommodation.isActive) {
          await accommodationsApi.deactivate(accommodation.id)
        } else {
          await accommodationsApi.activate(accommodation.id)
        }
        await loadAccommodations()
      } catch (err) {
        setError(getApiErrorMessage(err))
        throw err
      }
    },
    [loadAccommodations],
  )

  return {
    accommodations,
    loading,
    error,
    loadAccommodations,
    toggleAccommodation,
  }
}
