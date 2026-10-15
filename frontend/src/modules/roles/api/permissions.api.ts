
import { z } from "zod"
import { api } from "@/lib/axios"

const permissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Permission = z.infer<typeof permissionSchema>

const list = async (): Promise<Permission[]> => {
  const response = await api.get("/permissions")
  const result = z.array(permissionSchema).safeParse(response.data)

  if (!result.success) {
    if (import.meta.env.DEV) {
      console.error(
        "Error al interpretar la lista de permisos:",
        result.error,
      )
    }

    throw new Error("No se pudo interpretar la lista de permisos.")
  }

  return result.data
}

const getById = async (id: string): Promise<Permission> => {
  const response = await api.get(`/permissions/${id}`)
  const result = permissionSchema.safeParse(response.data)

  if (!result.success) {
    if (import.meta.env.DEV) {
      console.error("Error al interpretar el permiso:", result.error)
    }

    throw new Error("No se pudo interpretar el permiso.")
  }

  return result.data
}

const create = async (
  input: { name: string; description?: string },
): Promise<void> => {
  await api.post("/permissions", input)
}

const permissionsApi = {
  list,
  getById,
  create,
}

export default permissionsApi
