export interface Role {
  id: string;
  name: string;
  description?: string | null;
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}
