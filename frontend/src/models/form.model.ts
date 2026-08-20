import { z } from "zod"

export const customFormSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    email: z.string().min(1, "Ingrese un email").email("Ingrese un email válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
})

export type FormValues = z.infer<typeof customFormSchema>

export const formLoginSchema = z.object({
    email: z.string().min(1, "Ingrese un email").email("Ingrese un email válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export type FormLoginValues = z.infer<typeof formLoginSchema>
