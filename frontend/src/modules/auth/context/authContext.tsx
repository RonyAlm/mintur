import { createContext } from "react"
import type { User } from "@/models/user.model"

export type { User }

export interface Credentials {
  email: string
  password: string
}

export interface AuthContextType {
  user: User | null
  /** Resuelve `true` cuando el login terminó correctamente. */
  login: (credentials: Credentials) => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
  error: string | null
  /**
   * Fusiona datos parciales en el usuario mantenido en memoria.
   */
  updateUser: (patch: Partial<User>) => void
}

export const AuthContext = createContext<AuthContextType | null>(null)
