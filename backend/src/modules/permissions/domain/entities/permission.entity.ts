export interface Permission {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
}
