import { z } from "zod"

export const customFormSchema = z
  .object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    email: z.email("Ingrese un email válido"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

export type FormValues = z.infer<typeof customFormSchema>

export const formLoginSchema = z.object({
  email: z.email("Ingrese un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export type FormLoginValues = z.infer<typeof formLoginSchema>

/**
 * Edición del perfil propio (`PATCH /users/:id`): refleja los únicos campos
 * aceptados por `UpdateUserDto` (el rol no es editable desde la UI).
 */
export const profileFormSchema = z.object({
  firstName: z.string().trim().min(1, "Ingresá tu nombre"),
  lastName: z.string().trim().min(1, "Ingresá tu apellido"),
  username: z
    .string()
    .trim()
    .min(3, "El usuario debe tener al menos 3 caracteres"),
  email: z.email("Ingrese un email válido"),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

/**
 * `PATCH /auth/change-password`: todos los campos exigen 6 caracteres en el
 * backend, más las reglas de coincidencia y de "distinta a la actual".
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    newPassword: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "La nueva contraseña debe ser distinta a la actual",
    path: ["newPassword"],
  })

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
