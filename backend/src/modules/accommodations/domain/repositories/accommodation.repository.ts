import { Accommodation } from '../entities';

export abstract class AccommodationRepository {
  abstract create(accommodation: Accommodation): Promise<Accommodation>;
  abstract findAll(): Promise<Accommodation[]>;
  abstract findById(id: string): Promise<Accommodation | null>;
  abstract findByOrganizationId(
    organizationId: string,
  ): Promise<Accommodation | null>;
  abstract findByOrganizationIds(
    organizationIds: string[],
  ): Promise<Accommodation[]>;
  abstract update(
    id: string,
    accommodation: Partial<Accommodation>,
  ): Promise<Accommodation>;
  abstract delete(id: string): Promise<void>;
}
