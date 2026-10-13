import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { AuthContext, type AuthContextType, type Credentials } from "./authContext"
import { parseStoredUser, type User } from "@/models/user.model"
import { getApiErrorMessage, isUnauthorized } from "@/lib/api-error"
import authService from "@/services/auth.service"

const ERROR_TIMEOUT_MS = 6000

interface Props {
  children?: ReactNode
}

const AuthProvider = ({ children }: Props) => {
  // Lazy init: leer localStorage una sola vez y de forma segura.
  const [user, setUser] = useState<User | null>(() =>
    parseStoredUser(localStorage.getItem("user"))
  )
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")))
  const [error, setError] = useState<string | null>(null)

  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearError = useCallback(() => {
    if (errorTimer.current) {
      clearTimeout(errorTimer.current)
      errorTimer.current = null
    }
    setError(null)
  }, [])

  const showError = useCallback(
    (message: string) => {
      setError(message)
      if (errorTimer.current) clearTimeout(errorTimer.current)
      errorTimer.current = setTimeout(() => setError(null), ERROR_TIMEOUT_MS)
    },
    []
  )

  // Limpia el timer si el componente se desmonta.
  useEffect(() => clearError, [clearError])

  // Revalida la sesión y actualiza permisos desde el perfil en cada arranque.
  useEffect(() => {
    if (!localStorage.getItem("token")) return
    let cancelled = false
    void authService.profile().then((profile) => {
      if (cancelled) return
      const current = parseStoredUser(localStorage.getItem("user"))
      const refreshed: User = {
        ...profile,
        mustChangePassword: current?.mustChangePassword ?? profile.mustChangePassword,
      }
      setUser(refreshed)
      localStorage.setItem("user", JSON.stringify(refreshed))
    }).catch(() => {
      if (cancelled) return
      setUser(null)
      localStorage.removeItem("user")
      localStorage.removeItem("token")
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const login = useCallback(
    async ({ email, password }: Credentials): Promise<boolean> => {
      setLoading(true)
      clearError()

      // Trackea en qué etapa falló para mostrar el mensaje correcto.
      let stage: "login" | "profile" = "login"

      try {
        const { accessToken, mustChangePassword } = await authService.login({
          email,
          password,
        })
        localStorage.setItem("token", accessToken)

        stage = "profile"
        const profile = await authService.profile()
        // `GET /auth/profile` no devuelve mustChangePassword: se fusiona el
        // valor que sí entrega el login antes de persistir la sesión.
        const sessionUser: User = { ...profile, mustChangePassword }
        setUser(sessionUser)
        localStorage.setItem("user", JSON.stringify(sessionUser))
        return true
      } catch (err) {
        setUser(null)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        showError(
          stage === "login" && isUnauthorized(err)
            ? "Email o contraseña incorrectos."
            : getApiErrorMessage(err)
        )
        return false
      } finally {
        setLoading(false)
      }
    },
    [clearError, showError]
  )

  const logout = useCallback(() => {
    clearError()
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
  }, [clearError])

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      localStorage.setItem("user", JSON.stringify(next))
      return next
    })
  }, [])

  const value = useMemo<AuthContextType>(
    () => ({ user, login, logout, loading, error, updateUser }),
    [user, login, logout, loading, error, updateUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
