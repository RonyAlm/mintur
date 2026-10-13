import { isAxiosError } from "axios"

type BackendErrorBody = {
  error?: string
  message?: string | string[]
}

/**
 * Traducción de mensajes que el backend devuelve en inglés
 * (casos de uso de auth/users). Los mensajes en español pasan tal cual.
 */
const BACKEND_MESSAGES: Record<string, string> = {
  "Incorrect password": "La contraseña actual es incorrecta.",
  "Passwords do not match": "Las contraseñas no coinciden.",
  "New password cannot be the same as the current password":
    "La nueva contraseña debe ser distinta a la actual.",
  "Error updating password": "No se pudo actualizar la contraseña.",
  "User not found": "No se encontró el usuario.",
  "User already exists": "El email o el nombre de usuario ya está en uso.",
  "Invalid credentials": "Credenciales inválidas.",
}

function extractMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null

  const body = data as BackendErrorBody
  // NestJS: `message` trae el texto útil y `error` el reason phrase
  // genérico ("Unauthorized"/"Forbidden"); class-validator puede enviar
  // `message` como array de validaciones.
  if (Array.isArray(body.message)) {
    const joined = body.message.filter(Boolean).join(", ")
    return joined || null
  }

  return body.message || body.error || null
}

/**
 * Extrae un mensaje mostrable desde un error de la API.
 * Si el backend no envía nada, devuelve un mensaje genérico en español.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Ocurrió un error inesperado. Intenta nuevamente."
): string {
  if (isAxiosError(error)) {
    if (!error.response) return "No se pudo conectar con el servidor. Verifica tu conexión."

    const message = extractMessage(error.response.data)
    return BACKEND_MESSAGES[message ?? ""] ?? message ?? fallback
  }

  if (error instanceof Error && error.message) {
    return BACKEND_MESSAGES[error.message] ?? error.message
  }

  return fallback
}

export function isUnauthorized(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 401
}

/** El rol del usuario no tiene el permiso requerido por el endpoint. */
export function isForbidden(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 403
}
