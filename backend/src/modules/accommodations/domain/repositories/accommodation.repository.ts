import { Accommodation, AccommodationWithOrganization } from '../entities';

export abstract class AccommodationRepository {
  abstract create(accommodation: Accommodation): Promise<Accommodation>;
  abstract findAll(): Promise<AccommodationWithOrganization[]>;
  abstract findById(id: string): Promise<Accommodation | null>;
  abstract findByOrganizationId(
    organizationId: string,
  ): Promise<Accommodation | null>;
  abstract findByOrganizationIds(
    organizationIds: string[],
  ): Promise<AccommodationWithOrganization[]>;
  abstract update(
    id: string,
    accommodation: Partial<Accommodation>,
  ): Promise<Accommodation>;
  abstract delete(id: string): Promise<void>;
  abstract createWithOrganization(input: {
    organization: {
      name: string;
      description?: string;
    };
    accommodation: Omit<
      Accommodation,
      'id' | 'organizationId' | 'createdAt' | 'updatedAt'
    >;
  }): Promise<AccommodationWithOrganization>;
  abstract updateWithOrganization(
    id: string,
    input: {
      accommodation: Partial<
        Omit<Accommodation, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>
      >;
      organization?: {
        name?: string;
        description?: string | null;
      };
    },
  ): Promise<AccommodationWithOrganization>;
}
