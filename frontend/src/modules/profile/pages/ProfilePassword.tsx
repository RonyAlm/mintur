import { useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRoundIcon, Loader2Icon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import InputForm from "@/components/ui/InputForm"
import { getApiErrorMessage } from "@/lib/api-error"
import { useAuth } from "@/modules/auth/hooks/useAuth"
import { cn } from "@/lib/utils"
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "@/models/form.model"
import { authApi } from "@/modules/auth/api/auth.api"
import { ContentSection } from "../components/ContentSection"

type Feedback = { type: "success" | "error"; message: string } | null

const ProfilePassword = () => {
  const { user, updateUser } = useAuth()
  const [feedback, setFeedback] = useState<Feedback>(null)

  const hasTempPassword = user?.mustChangePassword ?? false

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ChangePasswordValues>({
    mode: "onSubmit",
    reValidateMode: "onBlur",
    shouldFocusError: true,
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onSubmit: SubmitHandler<ChangePasswordValues> = async (data) => {
    setFeedback(null)

    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })

      // El backend limpia mustChangePassword: lo reflejamos en la sesión
      // para que desaparezca el aviso de contraseña temporal.
      updateUser({ mustChangePassword: false })
      reset()
      setFeedback({
        type: "success",
        message: hasTempPassword
          ? "Contraseña actualizada. Ya podés usar la plataforma con tu nueva contraseña."
          : "Contraseña actualizada correctamente.",
      })
    } catch (err) {
      setFeedback({ type: "error", message: getApiErrorMessage(err) })
    }
  }

  return (
    <ContentSection
      title="Cambiar contraseña"
      desc="Completá tu contraseña actual y elegí una nueva de al menos 6 caracteres."
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5"
      >
        {hasTempPassword && (
          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground">
            <TriangleAlertIcon
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <p>
              Estás usando una <strong>contraseña temporal</strong>. Por
              seguridad, creá una contraseña propia antes de seguir navegando.
            </p>
          </div>
        )}

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

        <InputForm
          control={control}
          name="currentPassword"
          type="password"
          label="Contraseña actual"
          autoComplete="current-password"
          revealable
          hint="Si es una contraseña temporal, la que te asignó el administrador."
        />
        <InputForm
          control={control}
          name="newPassword"
          type="password"
          label="Nueva contraseña"
          autoComplete="new-password"
          revealable
          hint="Mínimo 6 caracteres y distinta a la actual."
        />
        <InputForm
          control={control}
          name="confirmPassword"
          type="password"
          label="Repetir nueva contraseña"
          autoComplete="new-password"
          revealable
        />

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2Icon className="animate-spin" aria-hidden />
            ) : (
              <KeyRoundIcon aria-hidden />
            )}
            Cambiar contraseña
          </Button>
        </div>
      </form>
    </ContentSection>
  )
}

export default ProfilePassword
