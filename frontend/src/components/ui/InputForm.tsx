import { useState } from "react"
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form"
import { EyeIcon, EyeOffIcon, type LucideIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface Props<T extends FieldValues> {
  name: Path<T>
  control: Control<T>
  label: string
  placeholder?: string
  type?: "text" | "email" | "password" | "tel"
  autoComplete?: string
  /** Texto de ayuda bajo el campo (WCAG 3.3.2). */
  hint?: string
  /** Agrega un botón mostrar/ocultar (solo cuando `type="password"`). */
  revealable?: boolean
  className?: string
  disabled?: boolean
  /** Ícono decorativo opcional de lucide-react, mostrado dentro del input. */
  icon?: LucideIcon
}

/**
 * Campo de formulario genérico.
 *
 * - Label asociado mediante `htmlFor`/`id` (WCAG 3.3.2).
 * - `aria-invalid` + `aria-describedby` (ayuda y error) para que el lector
 *   de pantalla anuncie el estado del campo (WCAG 3.3.1).
 */
const InputForm = <T extends FieldValues>({
  name,
  control,
  type = "text",
  placeholder,
  label,
  autoComplete,
  hint,
  revealable = false,
  className,
  disabled = false,
  icon,
}: Props<T>) => {
  const hintId = `${String(name)}-hint`
  const errorId = `${String(name)}-error`
  const [visible, setVisible] = useState(false)

  const canReveal = revealable && type === "password"
  const resolvedType = canReveal && visible ? "text" : type
  const LeadingIcon = icon

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const hasError = Boolean(fieldState.error)
        const describedBy =
          [hint ? hintId : null, hasError ? errorId : null]
            .filter(Boolean)
            .join(" ") || undefined

        return (
          <div className={cn("flex flex-col gap-2", className)}>
            <Label htmlFor={name} className="text-foreground/80">
              {label}
            </Label>

            <div className="relative">
              <Input
                id={name}
                type={resolvedType}
                placeholder={placeholder}
                autoComplete={autoComplete}
                aria-invalid={hasError}
                aria-describedby={describedBy}
                disabled={disabled}
                className={cn(
                  "h-10 bg-background/60",
                  icon && "pl-10",
                  canReveal && "pr-10"
                )}
                {...field}
              />

              {icon && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-1 left-4 flex items-center justify-center text-muted-foreground"
                >
                  {LeadingIcon && <LeadingIcon className="size-4" />}
                </div>
              )}

              {canReveal && (
                <button
                  type="button"
                  onClick={() => setVisible((v) => !v)}
                  aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={visible}
                  className="absolute inset-y-1 right-1 flex size-8 items-center justify-center rounded-md
                   text-muted-foreground transition-colors hover:text-foreground"
                >
                  {visible ? (
                    <EyeOffIcon className="size-4" aria-hidden />
                  ) : (
                    <EyeIcon className="size-4" aria-hidden />
                  )}
                </button>
              )}
            </div>

            {hint && (
              <span id={hintId} className="text-xs text-muted-foreground">
                {hint}
              </span>
            )}

            {hasError && (
              <span
                id={errorId}
                role="alert"
                className="text-sm font-medium text-destructive"
              >
                {fieldState.error?.message}
              </span>
            )}
          </div>
        )
      }}
    />
  )
}

export default InputForm
