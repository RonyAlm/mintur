import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  ThemeContext,
  type ResolvedTheme,
  type Theme,
} from "@/context/theme/themeContext"

interface ThemeProviderProps {
  children: ReactNode
  /** Tema aplicado si no hay preferencia guardada (por defecto: el del sistema). */
  defaultTheme?: Theme
  storageKey?: string
}

const isTheme = (value: unknown): value is Theme =>
  value === "light" || value === "dark" || value === "system"

const readSystemTheme = (): ResolvedTheme =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"

/**
 * Aplica el tema al `<html>`: alterna la clase `.dark` (que dispara los
 * tokens de `index.css`) y sincroniza `color-scheme` para los controles nativos.
 */
const applyTheme = (resolved: ResolvedTheme) => {
  const root = document.documentElement
  root.classList.toggle("dark", resolved === "dark")
  root.style.colorScheme = resolved
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "mintur-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (isTheme(stored)) return stored
    } catch {
      // Storage no disponible (modo privado): se usa el valor por defecto.
    }
    return defaultTheme
  })

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(readSystemTheme)

  // Sigue los cambios del SO mientras la preferencia sea "system".
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = (event: MediaQueryListEvent) =>
      setSystemTheme(event.matches ? "dark" : "light")

    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme

  useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next)
      try {
        localStorage.setItem(storageKey, next)
      } catch {
        // Sin storage la preferencia no persiste, pero el tema sí se aplica.
      }
    },
    [storageKey]
  )

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
