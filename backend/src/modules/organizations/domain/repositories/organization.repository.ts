import { Organization } from '../entities';

export abstract class OrganizationRepository {
  abstract findAll(): Promise<Organization[] | []>;
  abstract findById(id: string): Promise<Organization | null>;
  abstract findByName(name: string): Promise<Organization | null>;
  abstract create(organization: Organization): Promise<Organization>;
  abstract update(
    id: string,
    organization: Partial<Organization>,
  ): Promise<Organization>;
}
