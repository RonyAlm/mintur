import { useEffect, useState } from "react"

import { georefApi } from "../api/georef.api"

// Cache a nivel de módulo: las provincias no cambian y así evitamos refetch
// cada vez que el formulario se monta (crear/editar en diálogos).
let cachedNames: string[] | null = null
let inflight: Promise<string[]> | null = null

function loadProvinceNames(): Promise<string[]> {
  if (!inflight) {
    inflight = georefApi
      .listProvinces()
      .then((provinces) =>
        provinces
          .map((province) => province.nombre)
          .sort((a, b) => a.localeCompare(b, "es-AR")),
      )
      .then((names) => {
        cachedNames = names
        return names
      })
      .catch((error) => {
        inflight = null
        throw error
      })
  }
  return inflight
}

export function useProvinceNames() {
  const [provinceNames, setProvinceNames] = useState<string[]>(cachedNames ?? [])
  const [loading, setLoading] = useState(cachedNames === null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (cachedNames) return
    let active = true
    loadProvinceNames()
      .then((loaded) => {
        if (active) setProvinceNames(loaded)
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { provinceNames, loading, error }
}
