import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircleIcon, Loader2Icon, LockIcon, MailIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import InputForm from "@/components/ui/InputForm"
import logoOscuro from "@/assets/img/M-Turismo-negro.png"
import logoClaro from "@/assets/img/M-Turismo-blanco.png"
import { useAuth } from "@/modules/auth/hooks/useAuth"
import { formLoginSchema, type FormLoginValues } from "@/models/form.model"

const LoginForm = () => {
  const { login, error, loading } = useAuth()

  const { control, handleSubmit, reset } = useForm<FormLoginValues>({
    // onSubmit + reValidateMode onBlur: rendimiento y buenas prácticas RHF
    mode: "onSubmit",
    reValidateMode: "onBlur",
    resolver: zodResolver(formLoginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit: SubmitHandler<FormLoginValues> = async (data) => {
    const success = await login(data)
    if (success) {
      reset()
      // El redirect lo resuelve <Login /> con `location.state.from`.
    }
    // Si falla, `AuthContext.error` se muestra vía role="alert" (abajo).
  }

  return (
    <Card className="w-full animate-rise border-border/70 py-3 shadow-[0_30px_70px_-40px_rgba(18,51,36,0.55)]">
      <CardHeader className="flex w-full flex-col items-center justify-center gap-3 mb-4">
        <img
          src={logoOscuro}
          alt="Ministerio de Turismo de Formosa"
          className="h-10 mt-6 w-auto dark:hidden"
        />
        {/* En tema oscuro la tarjeta es oscura: se usa la versión clara */}
        <img
          src={logoClaro}
          alt=""
          aria-hidden="true"
          className="hidden h-10 mt-4 w-auto dark:block"
        />
        <p className="text-[0.7rem] font-medium tracking-[0.25em] text-primary uppercase">
          Plataforma Mintur
        </p>
        <h1 className="text-center text-2xl font-semibold">
          Inicia sesión con tu cuenta
        </h1>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-5"
        >
          {error && (
            <div
              role="alert"
              className="animate-fade flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive"
            >
              <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <InputForm
            name="email"
            control={control}
            label="Correo electrónico"
            placeholder="nombre@formosa.gob.ar"
            type="email"
            autoComplete="email"
            icon={MailIcon}
          />

          <InputForm
            name="password"
            control={control}
            label="Contraseña"
            placeholder="••••••••"
            type="password"
            revealable
            autoComplete="current-password"
            icon={LockIcon}
          />

          <Button
            type="submit"
            disabled={loading}
            className="mt-1 h-10 w-full text-base font-semibold bg-green-700 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500"
          >
            {loading && <Loader2Icon className="animate-spin" aria-hidden="true" />}
            {loading ? "Iniciando sesión…" : "Iniciar sesión"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-1.5 py-4">
        <p className="text-center text-xs text-muted-foreground">
          ¿Olvidaste tu contraseña? Contactá al administrador de la plataforma
          para restablecerla.
        </p>
      </CardFooter>
    </Card>
  )
}

export default LoginForm
