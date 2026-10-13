import { z } from "zod"
import { api } from "./api"

const assignedPermissionSchema = z.object({ id: z.string(), name: z.string() })

const roleSchemaBase = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  isSystemRole: z.boolean().catch(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  permissions: z.array(assignedPermissionSchema).optional(),
  rolePermissions: z.array(z.unknown()).optional(),
})

// The API may serialize the many-to-many relation either as `permissions`
// or Prisma's `rolePermissions: [{ permission: { id, name } }]` shape.
export const roleSchema = z.preprocess((input) => {
  if (!input || typeof input !== "object") return input
  const role = input as Record<string, unknown>
  const relation = Array.isArray(role.permissions) ? role.permissions : role.rolePermissions
  if (!Array.isArray(relation)) return input

  const permissions = relation.flatMap((entry) => {
    // GET /roles/:id currently serializes the relation as permission names.
    if (typeof entry === "string") return [{ id: entry, name: entry }]
    if (!entry || typeof entry !== "object") return []
    const item = entry as Record<string, unknown>
    const permission = item.permission && typeof item.permission === "object"
      ? item.permission as Record<string, unknown>
      : item
    const id = typeof permission.id === "string"
      ? permission.id
      : typeof item.permissionId === "string" ? item.permissionId : undefined
    if (!id) return []
    return [{ id, name: typeof permission.name === "string" ? permission.name : id }]
  })

  return { ...role, permissions }
}, roleSchemaBase)
export type ManagedRole = z.infer<typeof roleSchema>

const parseList = (data: unknown) => {
  const result = z.array(roleSchema).safeParse(data)
  if (!result.success) throw new Error("No se pudo interpretar la lista de roles.")
  return result.data
}

const list = async () => parseList((await api.get("/roles")).data)
const getById = async (id: string) => {
  const result = roleSchema.safeParse((await api.get(`/roles/${id}`)).data)
  if (!result.success) throw new Error("No se pudo interpretar el rol.")
  return result.data
}
const create = async (input: { name: string; description?: string }) => {
  await api.post("/roles", input)
}
const update = async (id: string, input: { name?: string; description?: string }) => {
  await api.patch(`/roles/${id}`, input)
}
const assignPermission = async (roleId: string, permissionId: string) => {
  await api.post(`/roles/${roleId}/permissions`, { permissionId })
}
const removePermission = async (roleId: string, permissionId: string) => {
  await api.delete(`/roles/${roleId}/permissions/${permissionId}`)
}

export default { list, getById, create, update, assignPermission, removePermission }
