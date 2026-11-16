import { useCallback, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getApiErrorMessage } from "@/lib/api-error"

import { accommodationsApi } from "../api/accommodations.api"
import type { Accommodation } from "../types/accommodation.types"

const accommodationsQueryKey = ["accommodations"] as const

export function useAccommodations(enabled = true) {
  const queryClient = useQueryClient()
  const [mutationError, setMutationError] = useState<string | null>(null)

  const accommodationsQuery = useQuery({
    queryKey: accommodationsQueryKey,
    queryFn: () => accommodationsApi.list(),
    enabled,
    retry: false,
  })

  const loadAccommodations = useCallback(async () => {
    setMutationError(null)
    await queryClient.refetchQueries({ queryKey: accommodationsQueryKey })
  }, [queryClient])

  const toggleAccommodation = useCallback(
    async (accommodation: Accommodation) => {
      setMutationError(null)

      try {
        if (accommodation.isActive) {
          await accommodationsApi.deactivate(accommodation.id)
        } else {
          await accommodationsApi.activate(accommodation.id)
        }
        await loadAccommodations()
      } catch (err) {
        setMutationError(getApiErrorMessage(err))
        throw err
      }
    },
    [loadAccommodations],
  )

  const queryError = accommodationsQuery.isError
    ? getApiErrorMessage(accommodationsQuery.error)
    : null

  return {
    accommodations: accommodationsQuery.data ?? [],
    loading: accommodationsQuery.isLoading || accommodationsQuery.isFetching,
    error: mutationError ?? queryError,
    loadAccommodations,
    toggleAccommodation,
  }
}
