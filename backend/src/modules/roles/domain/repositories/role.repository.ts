import { Role } from '../entities';

export abstract class RoleRepository {
  abstract findByName(name: string): Promise<Role | null>;
  abstract findById(id: string): Promise<Role | null>;
  abstract findAll(): Promise<Role[]>;
  abstract save(role: Role): Promise<Role>;
  abstract update(id: string, role: Partial<Role>): Promise<Role | null>;
}
