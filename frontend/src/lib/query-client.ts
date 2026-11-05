import { QueryClient } from "@tanstack/react-query"

/**
 * Cliente global de TanStack Query.
 *
 * Configuración por defecto pensada para una SPA con datos de servidor:
 * - `staleTime`/`gcTime` moderados para aprovechar la caché sin servir datos obsoletos.
 * - `retry: 1` para no martillar la API ante un error transitorio.
 * - `refetchOnWindowFocus: false` para evitar consultas duplicadas al cambiar de pestaña.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
