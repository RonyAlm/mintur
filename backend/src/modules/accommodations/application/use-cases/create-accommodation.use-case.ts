import { ForbiddenException, Injectable } from '@nestjs/common';
import { AccommodationRepository, AccommodationType } from '../../domain';
import { OrganizationAccessService } from '../../../../modules/organizations/applications';

export interface CreateAccommodationInput {
  currentUserRoleId: string;

  organization: {
    name: string;
    description?: string;
  };

  type: AccommodationType;

  capacity?: number;
  totalRooms?: number;
  totalBeds?: number;
  locality?: string;
  image?: string;
  address?: string;
  addressMap?: string;
  phoneOne?: string;
  phoneTwo?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
}

@Injectable()
export class CreateAccommodationUseCase {
  constructor(
    private readonly accommodationRepository: AccommodationRepository,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async execute(input: CreateAccommodationInput) {
    const isSystemAdmin = await this.organizationAccessService.isSystemAdmin(
      input.currentUserRoleId,
    );

    if (!isSystemAdmin) {
      throw new ForbiddenException(
        'No tienes permisos para crear alojamientos',
      );
    }

    return this.accommodationRepository.createWithOrganization({
      organization: {
        name: input.organization.name.trim(),
        description: input.organization.description?.trim(),
      },
      accommodation: {
        isActive: true,
        type: input.type,
        capacity: input.capacity,
        totalRooms: input.totalRooms,
        totalBeds: input.totalBeds,
        locality: input.locality,
        image: input.image,
        address: input.address,
        addressMap: input.addressMap,
        phoneOne: input.phoneOne,
        phoneTwo: input.phoneTwo,
        email: input.email,
        website: input.website,
        instagram: input.instagram,
        facebook: input.facebook,
      },
    });
  }
}
