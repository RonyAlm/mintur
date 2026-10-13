import {
  BarChart3Icon,
  HotelIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"
import type { User } from "@/models/user.model"

/**
 * Catálogo central de módulos y permisos que habilitan su acceso.
 *
 * Este es el único archivo que hay que tocar para:
 * - agregar/quitar un módulo (rutas, sidebar y dashboard salen de acá),
 * - definir qué permisos habilitan cada módulo.
 *
 * Regla: el frontend oculta módulos; la autorización real sigue viva en el
 * backend (ningún endpoint se habilita por esto).
 */

/** Identificador único de cada módulo de la plataforma. */
export type ModuleId =
  | "usuarios"
  | "alojamientos"
  | "reportes"
  | "configuracion"
  | "roles"

/** Agrupación en el sidebar (los grupos vacíos no se renderizan). */
export type ModuleGroup = "principal" | "sistema"

export interface AppModule {
  /** Clave estable del módulo. */
  id: ModuleId
  /** Título visible (sidebar, dashboard y header de la ruta). */
  title: string
  /** Descripción corta (dashboard y página del módulo). */
  description: string
  /** Ruta absoluta del módulo, ej. "/usuarios". */
  path: string
  icon: LucideIcon
  group: ModuleGroup
  /** El módulo se muestra si el usuario tiene al menos uno. */
  anyPermission: readonly string[]
}

/**
 * Catálogo de módulos: el orden de este array define el orden en el
 * sidebar y en las tarjetas del dashboard.
 */
export const APP_MODULES: AppModule[] = [
  {
    id: "usuarios",
    title: "Usuarios",
    description: "Gestión de usuarios, roles y permisos del Ministerio.",
    path: "/usuarios",
    icon: UsersIcon,
    group: "principal",
    anyPermission: ["users:read"],
  },
  {
    id: "alojamientos",
    title: "Alojamientos",
    description: "ABM de alojamientos y sus estadísticas periódicas.",
    path: "/alojamientos",
    icon: HotelIcon,
    group: "principal",
    anyPermission: ["accommodations:read"],
  },
  {
    id: "reportes",
    title: "Reportes",
    description: "Indicadores, dashboards y exportaciones del sector.",
    path: "/reportes",
    icon: BarChart3Icon,
    group: "principal",
    anyPermission: ["accommodation-statistics:read"],
  },
  {
    id: "configuracion",
    title: "Configuración",
    description: "Parámetros generales de la plataforma.",
    path: "/configuracion",
    icon: SettingsIcon,
    group: "sistema",
    anyPermission: ["permissions:read"],
  },
  {
    id: "roles",
    title: "Roles y permisos",
    description: "Administración de roles y del catálogo de permisos.",
    path: "/roles",
    icon: ShieldCheckIcon,
    group: "sistema",
    anyPermission: ["roles:read", "roles:create", "roles:update", "roles:manage_permissions", "permissions:read", "permissions:create"],
  },
]

/** Comprueba un permiso devuelto por el perfil. */
export function hasPermission(user: User | null, permission: string): boolean {
  return user?.permissions.includes(permission) ?? false
}

export function hasAnyPermission(user: User | null, permissions: readonly string[]): boolean {
  return permissions.some((permission) => hasPermission(user, permission))
}

export function hasAllPermissions(user: User | null, permissions: readonly string[]): boolean {
  return permissions.every((permission) => hasPermission(user, permission))
}

/** IDs de módulos que habilitan los permisos efectivos del usuario. */
export function getPermissionModuleIds(user: User | null): ModuleId[] {
  return APP_MODULES.filter((module) => hasAnyPermission(user, module.anyPermission)).map(
    (module) => module.id
  )
}

/** Módulos visibles para el usuario, en el orden del catálogo. */
export function getVisibleModules(user: User | null): AppModule[] {
  const allowed = new Set<string>(getPermissionModuleIds(user))
  return APP_MODULES.filter((module) => allowed.has(module.id))
}

/** `true` si el usuario puede entrar al módulo indicado. */
export function hasModuleAccess(user: User | null, moduleId: ModuleId): boolean {
  const module = APP_MODULES.find((item) => item.id === moduleId)
  return module ? hasAnyPermission(user, module.anyPermission) : false
}
