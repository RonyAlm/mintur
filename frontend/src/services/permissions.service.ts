import { z } from "zod"
import { api } from "./api"

const permissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})
export type Permission = z.infer<typeof permissionSchema>

const list = async () => {
  const result = z.array(permissionSchema).safeParse((await api.get("/permissions")).data)
  if (!result.success) throw new Error("No se pudo interpretar la lista de permisos.")
  return result.data
}
const getById = async (id: string) => {
  const result = permissionSchema.safeParse((await api.get(`/permissions/${id}`)).data)
  if (!result.success) throw new Error("No se pudo interpretar el permiso.")
  return result.data
}
const create = async (input: { name: string; description?: string }) => {
  await api.post("/permissions", input)
}

export default { list, getById, create }
