import { useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon, SaveIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import InputForm from "@/components/ui/InputForm"
import { getApiErrorMessage, isForbidden } from "@/lib/api-error"
import { useAuth } from "@/hooks/useAuth"
import { getRoleDescription, getRoleName } from "@/lib/user"
import { cn } from "@/lib/utils"
import { hasPermission } from "@/lib/modules"
import {
  profileFormSchema,
  type ProfileFormValues,
} from "@/models/form.model"
import usersService from "@/services/users.service"
import { ContentSection } from "./ContentSection"

type Feedback = { type: "success" | "error"; message: string } | null

const FORBIDDEN_MESSAGE =
  "Tu rol no tiene permisos para modificar tu perfil. Contactá al administrador para realizar este cambio."

const ProfileAccount = () => {
  const { user, updateUser } = useAuth()
  const canUpdateProfile = hasPermission(user, "users:update")
  const [feedback, setFeedback] = useState<Feedback>(null)

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ProfileFormValues>({
    mode: "onSubmit",
    reValidateMode: "onBlur",
    shouldFocusError: true,
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      username: user?.username ?? "",
      email: user?.email ?? "",
    },
  })

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    setFeedback(null)

    if (!user?.id) {
      setFeedback({
        type: "error",
        message: "No se pudo identificar tu usuario. Volvé a iniciar sesión.",
      })
      return
    }

    try {
      const updated = await usersService.update(user.id, data)
      updateUser({
        firstName: updated.firstName,
        lastName: updated.lastName,
        username: updated.username,
        email: updated.email,
      })
      // Sincroniza los valores por defecto y limpia el estado dirty.
      reset(data)
      setFeedback({
        type: "success",
        message: "Perfil actualizado correctamente.",
      })
    } catch (err) {
      setFeedback({
        type: "error",
        message: isForbidden(err) ? FORBIDDEN_MESSAGE : getApiErrorMessage(err),
      })
    }
  }

  const roleName = getRoleName(user)
  const roleDescription = getRoleDescription(user)

  return (
    <ContentSection
      title="Información de la cuenta"
      desc="Actualizá tus datos personales, tu usuario y tu correo. Tu rol lo asigna el administrador de la plataforma.">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5"
      >
        {feedback && (
          <div
            role={feedback.type === "error" ? "alert" : "status"}
            className={cn(
              "rounded-xl border px-4 py-3 text-sm",
              feedback.type === "error"
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-primary/30 bg-primary/10 text-foreground"
            )}
          >
            {feedback.message}
          </div>
        )}

        {/* Rol: información de solo lectura (los permisos viven en el backend) */}
        <div className="rounded-xl border border-border/70 bg-muted/40 p-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Rol asignado
          </p>

          <div className="mt-2">
            {roleName ? (
              <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-primary uppercase">
                {roleName}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                Sin rol asignado
              </span>
            )}
          </div>

          {roleDescription && (
            <p className="mt-2 text-sm text-muted-foreground">
              {roleDescription}
            </p>
          )}

          <p className="mt-2 text-xs text-muted-foreground">
             Tus permisos definen los módulos y acciones disponibles; el rol
             no puede modificarse desde tu perfil.
          </p>
        </div>

        {!canUpdateProfile && <p className="rounded-lg border border-border bg-muted p-3 text-sm text-muted-foreground">Tu cuenta no tiene el permiso users:update. Podés consultar tus datos, pero no modificarlos.</p>}
        <InputForm
          control={control}
          name="firstName"
          label="Nombre"
          autoComplete="given-name"
          disabled={!canUpdateProfile}
          hint="Se muestra en la plataforma y en el menú de usuario."
        />
        <InputForm
          control={control}
          name="lastName"
          disabled={!canUpdateProfile}
          label="Apellido"
          autoComplete="family-name"
          hint="Se muestra junto al nombre."
        />
        <InputForm
          control={control}
          name="username"
          disabled={!canUpdateProfile}
          label="Usuario"
          autoComplete="username"
          hint="Identificador público único (mínimo 3 caracteres)."
        />
        <InputForm
          control={control}
          name="email"
          disabled={!canUpdateProfile}
          type="email"
          label="Email"
          autoComplete="email"
          hint="Se usa para iniciar sesión en la plataforma."
        />

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button 
           className="cursor-pointer"
           size="lg" type="submit" disabled={isSubmitting || !canUpdateProfile}>
            {isSubmitting ? (
              <Loader2Icon className="animate-spin" aria-hidden />
            ) : (
              <SaveIcon aria-hidden />
            )}
            Guardar cambios
          </Button>
          <Button
            size="lg"
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => reset()}
            disabled={isSubmitting || !canUpdateProfile}>
            Descartar
          </Button>
        </div>
      </form>
    </ContentSection>
  )
}

export default ProfileAccount
