import { Injectable, NotFoundException } from '@nestjs/common';
import { AccommodationRepository, AccommodationType } from '../../domain';
import { OrganizationAccessService } from '../../../../modules/organizations/applications';

export interface UpdateAccommodationInput {
  currentUser: { id: string; roleId: string };

  accommodationId: string;
  organizationId?: string;
  type?: AccommodationType;
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
export class UpdateAccommodationUseCase {
  constructor(
    private readonly accommodationRepository: AccommodationRepository,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async execute(input: UpdateAccommodationInput) {
    const existingAccommodation = await this.accommodationRepository.findById(
      input.accommodationId,
    );

    if (!existingAccommodation) {
      throw new NotFoundException('El alojamiento no existe');
    }
    const isAdminSystem = await this.organizationAccessService.isSystemAdmin(
      input.currentUser.roleId,
    );

    if (!isAdminSystem) {
      await this.organizationAccessService.requireOrganizationAdmin(
        input.currentUser.roleId,
        input.currentUser.id,
        existingAccommodation.organizationId,
      );
    }

    const updatedAccommodation = {
      ...existingAccommodation,
      organizationId: existingAccommodation.organizationId,
      type: input.type || existingAccommodation.type,
      image: input.image || existingAccommodation.image,
      address: input.address || existingAccommodation.address,
      addressMap: input.addressMap || existingAccommodation.addressMap,
      phoneOne: input.phoneOne || existingAccommodation.phoneOne,
      phoneTwo: input.phoneTwo || existingAccommodation.phoneTwo,
      email: input.email || existingAccommodation.email,
      website: input.website || existingAccommodation.website,
      instagram: input.instagram || existingAccommodation.instagram,
      facebook: input.facebook || existingAccommodation.facebook,
      updatedAt: new Date(),
    };

    Object.assign(existingAccommodation, updatedAccommodation);

    return this.accommodationRepository.update(
      input.accommodationId,
      updatedAccommodation,
    );
  }
}
