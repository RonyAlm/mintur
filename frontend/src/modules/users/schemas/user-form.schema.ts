import { z } from "zod"

export const userFormSchema = z.object({
  email: z.string().trim().email("Ingresá un correo electrónico válido."),
  username: z.string().trim().min(3, "El nombre de usuario debe tener al menos 3 caracteres."),
  firstName: z.string().trim(),
  lastName: z.string().trim(),
  roleId: z.string(),
})

export type UserFormValues = z.infer<typeof userFormSchema>
