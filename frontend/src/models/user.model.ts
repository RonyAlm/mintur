import { z } from "zod"

const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
})

const storedRoleSchema = z
  .union([
    roleSchema,
    z.string().transform((name) => ({ id: "", name, description: null })),
  ])
  .catch({ id: "", name: "", description: null })

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: storedRoleSchema,
  permissions: z.array(z.string()).catch([]),
  mustChangePassword: z.boolean(),
})

export type User = z.infer<typeof userSchema>
export type UserRole = User["role"]

