import { QueryClient } from "@tanstack/react-query"

/**
 * Crea un cliente de TanStack Query aislado para tests.
 * `retry: false` evita reintentos que ralentizan la suite; `gcTime: 0` limpia la caché al desmontar.
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}
