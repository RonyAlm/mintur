import axios, { type InternalAxiosRequestConfig } from "axios"
import { api } from "../services/api"

const AUTH_PATH = "/auth"

const isAuthPath = (url?: string) => url?.startsWith(AUTH_PATH) ?? false

/** Adjunta el JWT guardado a cada petición saliente. */
const withAuthHeader = (request: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token")
  if (!token) return request

  request.headers = new axios.AxiosHeaders(request.headers)
  request.headers.set("Authorization", `Bearer ${token}`)
  return request
}

/**
 * Registra los interceptores de axios una sola vez (se llama desde main.tsx).
 *
 * - Request: agrega `Authorization`.
 * - Response: en 401 cierra la sesión y devuelve al login. Se excluyen los
 *   endpoints `/auth/*` para no pisar el intento de login (que debe mostrar
 *   el error en el formulario, no redirigir).
 */
export const AxiosInterceptor = () => {
  api.interceptors.request.use(withAuthHeader)

  api.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401 &&
        !isAuthPath(error.config?.url) &&
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/auth")
      ) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.assign("/auth/login")
      }

      return Promise.reject(error)
    }
  )
}
