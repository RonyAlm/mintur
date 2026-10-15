export const KNOWN_PERMISSION_MODULES: Record<string, string> = {
  users: "Usuarios",
  accommodations: "Alojamientos",
  "accommodation-statistics": "Estadísticas de alojamientos",
  organizations: "Organizaciones",
  organization_members: "Miembros de organizaciones",
  roles: "Roles",
  permissions: "Permisos",
}

export const PERMISSION_ACTIONS: Record<string, string> = {
  read: "Leer",
  list: "Listar",
  create: "Crear",
  update: "Editar",
  delete: "Eliminar",
  activate: "Activar",
  deactivate: "Desactivar",
  reset_password: "Restablecer contraseña",
  manage_permissions: "Gestionar permisos",
  statistics: "Estadística",
}

export const humanizePermissionPart = (value: string) => value
  .split(/[_-]/g)
  .map((word) => word.charAt(0).toLocaleUpperCase() + word.slice(1))
  .join(" ")

export const splitPermissionName = (name: string) => {
  const separator = name.lastIndexOf(":")
  return separator > 0 && separator < name.length - 1
    ? { module: name.slice(0, separator), action: name.slice(separator + 1) }
    : null
}
