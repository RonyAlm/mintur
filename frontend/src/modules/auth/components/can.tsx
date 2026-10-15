import type { ReactNode } from "react"
import { useAuth } from "@/modules/auth/hooks/useAuth"
import { hasPermission } from "@/lib/modules"

interface CanProps {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}

export function Can({
  permission,
  children,
  fallback = null,
}: CanProps) {
  const { user } = useAuth()

  if (!hasPermission(user, permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}