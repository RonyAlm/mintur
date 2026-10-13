import { z } from "zod"
import { api } from "./api"

/**
 * `UpdateUserDto` del backend: solo estos campos son aceptados
 * (`forbidNonWhitelisted` rechaza cualquier otro con 400).
 */
export interface UpdateProfileInput {
  firstName?: string
  lastName?: string
  username?: string
  email?: string
}

/** Respuesta de `PATCH /users/:id` (no incluye el objeto role). */
const updatedProfileSchema = z.object({
  id: z.string().catch(""),
  username: z.string().catch(""),
  firstName: z.string().catch(""),
  lastName: z.string().catch(""),
  email: z.string().catch(""),
  roleId: z.string().catch(""),
})

export type UpdatedProfile = z.infer<typeof updatedProfileSchema>

const managedUserSchema = z.object({
  id: z.string(),
  username: z.string().catch(""),
  firstName: z.string().catch(""),
  lastName: z.string().catch(""),
  email: z.string().catch(""),
  roleId: z.string().catch(""),
  isActive: z.boolean().catch(true),
  mustChangePassword: z.boolean().catch(false),
})

export type ManagedUser = z.infer<typeof managedUserSchema>

export interface CreateUserInput {
  email: string
  username: string
  firstName?: string
  lastName?: string
  roleId: string
}

const parseUserList = (data: unknown): ManagedUser[] => {
  const parsed = z.array(managedUserSchema).safeParse(data)
  if (!parsed.success) throw new Error("No se pudo interpretar la lista de usuarios.")
  return parsed.data
}

const list = async (): Promise<ManagedUser[]> => {
  const { data } = await api.get("/users")
  return parseUserList(data)
}

const create = async (input: CreateUserInput): Promise<{ temporaryPassword: string }> => {
  const { data } = await api.post("/users/create", input)
  const parsed = z.object({ temporaryPassword: z.string().min(1) }).safeParse(data)
  if (!parsed.success) throw new Error("La API no devolvió la contraseña temporal del usuario.")
  return parsed.data
}

const updateManaged = async (id: string, input: UpdateProfileInput): Promise<void> => {
  await api.patch(`/users/${id}`, input)
}

const setActive = async (id: string, active: boolean): Promise<void> => {
  await api.patch(`/users/${id}/${active ? "activate" : "deactivate"}`)
}

const resetPassword = async (id: string): Promise<{ temporaryPassword: string }> => {
  const { data } = await api.patch(`/users/${id}/reset-password`)
  const parsed = z.object({ temporaryPassword: z.string().min(1) }).safeParse(data)
  if (!parsed.success) throw new Error("La API no devolvió la contraseña temporal.")
  return parsed.data
}

/**
 * Editar el propio perfil usa `PATCH /users/:id` (único endpoint de edición).
 * Requiere el permiso `users:update` del rol: si el rol no lo tiene, el
 * backend responde 403 y la UI muestra un mensaje específico (ver
 * `isForbidden` en lib/api-error).
 */
const update = async (
  id: string,
  input: UpdateProfileInput
): Promise<UpdatedProfile> => {
  const { data } = await api.patch(`/users/${id}`, input)

  const parsed = updatedProfileSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error("No se pudo interpretar la respuesta del servidor.")
  }

  return parsed.data
}

export default { update, list, create, updateManaged, setActive, resetPassword }
