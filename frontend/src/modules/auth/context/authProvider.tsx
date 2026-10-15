import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { AuthContext, type AuthContextType, type Credentials } from "./authContext"
import type { User } from "@/models/user.model"
import { getApiErrorMessage, isUnauthorized } from "@/lib/api-error"
import { authApi } from "../api/auth.api"

const ERROR_TIMEOUT_MS = 6000

interface Props {
  children?: ReactNode
}

const AuthProvider = ({ children }: Props) => {
  // La cookie HttpOnly no es legible desde JS; validar la sesión consultando el perfil.
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Invalidar operaciones de autenticación anterior
  const authOperation = useRef(0)

  const clearError = useCallback(() => {
    if (errorTimer.current) {
      clearTimeout(errorTimer.current)
      errorTimer.current = null
    }
    setError(null)
  }, [])

  const showError = useCallback((message: string) => {
    if (errorTimer.current) {
      clearTimeout(errorTimer.current)
    }

    setError(message)

    errorTimer.current = setTimeout(() => {
      setError(null)
      errorTimer.current = null
    }, ERROR_TIMEOUT_MS)
  }, [])

  // Limpia el timer si el componente se desmonta.
  useEffect(() => {
    return () => {
      if (errorTimer.current) {
        clearTimeout(errorTimer.current)
      }
    }
  }, [])

  // Revalida la sesión y actualiza permisos desde el perfil en cada arranque.
  useEffect(() => {
    let cancelled = false
    const operation = ++authOperation.current

    const restoredSession = async () => {
      try {
        const profile = await authApi.getProfile()
        if (cancelled || operation !== authOperation.current) {
          return
        }

        setUser({ ...profile })
      } catch {
        if (cancelled || operation !== authOperation.current) {
          return
        }

        setUser(null)
      } finally {
        if (operation === authOperation.current) {
          setLoading(false)
        }
      }

    }

    void restoredSession()

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(
    async ({ email, password }: Credentials): Promise<boolean> => {
      const operation = ++authOperation.current

      setLoading(true)
      clearError()

      // Trackea en qué etapa falló para mostrar el mensaje correcto.
      let stage: "login" | "profile" = "login"

      try {
        await authApi.login({
          email,
          password,
        })

        stage = "profile"
        const profile = await authApi.getProfile()

        if (operation !== authOperation.current) {
          return false
        }
        setUser(profile)
        return true
      } catch (err) {
        if (operation !== authOperation.current) {
          return false
        }
        setUser(null)
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

  const logout = useCallback(async () => {
    // Invalida cualquier login o consulta anterior.
    ++authOperation.current

    clearError()
    setUser(null)
    setLoading(false)
    try {
      await authApi.logout()
    } catch {
      showError(
        "No se pudo confirmar el cierre de sesión con el servidor.",
      );
    }
  }, [clearError, showError])

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
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
