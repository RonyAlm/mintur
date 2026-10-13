import type { User } from "@/models/user.model"

/** Nombre completo para mostrar, con fallback al email. */
export function getDisplayName(user: User | null): string {
  if (!user) return ""

  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
  return full || user.username || user.email || "Usuario"
}

/** Nombre del rol del usuario, o "" si no hay sesión o no viene informado. */
export function getRoleName(user: User | null): string {
  return user?.role.name?.trim() ?? ""
}

/** Descripción del rol (puede venir null desde el backend). */
export function getRoleDescription(user: User | null): string {
  return user?.role.description?.trim() ?? ""
}

/** Iniciales para el avatar: "MR" → "MR", "maria@mail.com" → "MA". */
export function getUserInitials(user: User | null): string {
  if (!user) return "?"

  const source = [user.firstName, user.lastName].filter(Boolean).join(" ")

  if (source) {
    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
  }

  const base = user.username || user.email
  return base ? base.charAt(0).toUpperCase() : "?"
}
