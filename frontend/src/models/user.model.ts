import { z } from "zod"

/**
 * Rol devuelto por `GET /auth/profile` y `GET /users/:id`:
 * `{ id, name, description }` (description puede venir null).
 */
const roleSchema = z.object({
  id: z.string().catch(""),
  name: z.string().catch(""),
  description: z.string().nullish(),
})

/**
 * Sesiones antiguas guardaban el rol como string plano; se aceptan ambos
 * formatos para no cerrar la sesión de usuarios existentes al desplegar.
 */
const storedRoleSchema = z
  .union([
    roleSchema,
    z.string().transform((name) => ({ id: "", name, description: null })),
  ])
  .catch({ id: "", name: "", description: null })

/**
 * Esquema defensivo del usuario de sesión.
 *
 * - El usuario se persiste en localStorage, así que nunca confiamos en
 *   `JSON.parse` (regla: parse-validate-early / parse-never-trust-json).
 * - Los campos "secundarios" usan `.catch(...)` para tolerar variaciones del
 *   backend sin romper la sesión; la UI tiene fallbacks de display.
 */
export const userSchema = z.object({
  id: z.string().catch(""),
  email: z.string().catch(""),
  username: z.string().catch(""),
  firstName: z.string().catch(""),
  lastName: z.string().catch(""),
  role: storedRoleSchema,
  /** Permisos efectivos entregados por GET /auth/profile. */
  permissions: z.array(z.string()).catch([]),
  /**
   * Solo lo entrega `POST /auth/login`; se persiste con la sesión y se limpia
   * en `PATCH /auth/change-password`. `GET /auth/profile` no lo incluye, por
   * eso el `.catch(false)` no rompe el parseo de ese endpoint.
   */
  mustChangePassword: z.boolean().catch(false),
})

export type User = z.infer<typeof userSchema>
export type UserRole = User["role"]

/** Parsea de forma segura el usuario guardado en localStorage. */
export function parseStoredUser(raw: string | null): User | null {
  if (!raw) return null

  try {
    const result = userSchema.safeParse(JSON.parse(raw))
    return result.success ? result.data : null
  } catch {
    return null
  }
}
