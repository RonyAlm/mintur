import { createContext } from "react"

/** Preferencia guardada por la persona usuaria. */
export type Theme = "light" | "dark" | "system"

/** Tema realmente aplicado al documento, ya resuelto desde "system". */
export type ResolvedTheme = "light" | "dark"

export interface ThemeContextType {
  /** Preferencia elegida (puede ser "system"). */
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextType | null>(null)
