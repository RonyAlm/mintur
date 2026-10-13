import { MonitorIcon, MoonIcon, SunIcon, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Theme } from "@/context/theme/themeContext"
import { useTheme } from "@/hooks/useTheme"

interface ThemeOption {
  value: Theme
  label: string
  description: string
  icon: LucideIcon
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "light",
    label: "Claro",
    description: "Siempre fondo claro",
    icon: SunIcon,
  },
  {
    value: "dark",
    label: "Oscuro",
    description: "Siempre fondo oscuro",
    icon: MoonIcon,
  },
  {
    value: "system",
    label: "Sistema",
    description: "Según el dispositivo",
    icon: MonitorIcon,
  },
]

/**
 * Selector de tema (claro / oscuro / sistema) para la barra superior.
 * La elección se guarda en localStorage y, en "system", sigue los cambios
 * del SO en tiempo real.
 */
export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  const ActiveIcon: LucideIcon =
    theme === "system"
      ? MonitorIcon
      : resolvedTheme === "dark"
        ? MoonIcon
        : SunIcon

  const activeLabel =
    THEME_OPTIONS.find((option) => option.value === theme)?.label ?? "Sistema"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Tema actual: ${activeLabel}. Cambiar tema de la interfaz`}
        render={
          <Button variant="ghost" size="icon" className="size-9 rounded-lg" />
        }
      >
        <ActiveIcon aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Tema de la interfaz</DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value as Theme)}
        >
          {THEME_OPTIONS.map(({ value, label, description, icon: Icon }) => (
            <DropdownMenuRadioItem
              key={value}
              value={value}
              closeOnClick
              className="gap-2.5 py-1.5"
            >
              <Icon aria-hidden="true" />
              <span className="flex min-w-0 flex-col">
                <span className="font-medium">{label}</span>
                <span className="text-xs text-muted-foreground">
                  {description}
                </span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
