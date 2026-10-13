import { z } from "zod"
import { api } from "./api"
import { userSchema, type User } from "@/models/user.model"

export interface Credentials {
  email: string
  password: string
}

/**
 * `POST /auth/login`. `mustChangePassword` marca contraseña temporal:
 * el backend lo limpia al confirmar `PATCH /auth/change-password`.
 */
const loginResponseSchema = z.object({
  accessToken: z.string().min(1, "Respuesta de autenticación inválida."),
  email: z.string().catch(""),
  mustChangePassword: z.boolean().catch(false),
})

export type LoginResponse = z.infer<typeof loginResponseSchema>

const changePasswordResponseSchema = z.object({
  isSuccess: z.boolean(),
  message: z.string().catch(""),
})

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

/**
 * Los servicios propagan el error (throw) y la capa de UI decide cómo
 * mostrarlo: así evitamos mezclar `{ isSuccess: false }` con respuestas
 * exitosas y se elimina la doble comprobación de errores.
 */
const login = async (credentials: Credentials): Promise<LoginResponse> => {
  const { data } = await api.post("/auth/login", credentials)

  const parsed = loginResponseSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error("No se pudo interpretar la respuesta del servidor.")
  }

  return parsed.data
}

const profile = async (): Promise<User> => {
  const { data } = await api.get("/auth/profile")

  const parsed = userSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error("No se pudo interpretar la información del perfil.")
  }

  return parsed.data
}

/**
 * Cambia la contraseña del usuario autenticado (requiere Bearer).
 * Un 401 con la contraseña actual incorrecta NO cierra la sesión: el
 * interceptor excluye las rutas `/auth/*` del redirect a login.
 */
const changePassword = async (input: ChangePasswordInput): Promise<void> => {
  const { data } = await api.patch("/auth/change-password", input)

  const parsed = changePasswordResponseSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error("No se pudo interpretar la respuesta del servidor.")
  }

  if (!parsed.data.isSuccess) {
    throw new Error(parsed.data.message || "No se pudo cambiar la contraseña.")
  }
}

export default { login, profile, changePassword }
