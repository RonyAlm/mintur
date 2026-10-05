import { Injectable } from '@nestjs/common';
import { Accommodation, AccommodationRepository } from '../../domain';
import { OrganizationAccessService } from '../../../../modules/organizations/applications';
import { OrganizationMembershipRepository } from 'src/modules/organizations/domain';

export interface ListAccommodationsInput {
  currentUserId: string;
  currentUserRoleId: string;
}

@Injectable()
export class ListAccommodationsUseCase {
  constructor(
    private readonly accommodationRepository: AccommodationRepository,
    private readonly organizationAccessService: OrganizationAccessService,
    private readonly membershipRepository: OrganizationMembershipRepository,
  ) {}

  async execute(input: ListAccommodationsInput): Promise<Accommodation[]> {
    const isSystemAdmin = await this.organizationAccessService.isSystemAdmin(
      input.currentUserRoleId,
    );
    if (isSystemAdmin) {
      return await this.accommodationRepository.findAll();
    }

    const memberships = await this.membershipRepository.findByUserId(
      input.currentUserId,
    );

    if (memberships.length === 0) return [];

    const organizationsIds = memberships.map(
      (membership) => membership.organizationsIds,
    ) as string[];

    const accommodations =
      await this.accommodationRepository.findByOrganizationIds(
        organizationsIds,
      );

    return accommodations;
  }
}
