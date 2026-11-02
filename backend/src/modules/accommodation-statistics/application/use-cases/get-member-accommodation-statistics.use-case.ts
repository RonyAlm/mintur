import { Injectable } from '@nestjs/common';
import { AccommodationRepository } from '../../../../modules/accommodations/domain';
import {
  OrganizationMembershipRepository,
  type OrganizationMembershipWithOrganization,
} from '../../../../modules/organizations/domain';

export interface GetMemberAccommodationStatisticsInput {
  userId: string;
}

@Injectable()
export class GetMemberAccommodationStatisticsUseCase {
  constructor(
    private readonly membershipRepository: OrganizationMembershipRepository,
    private readonly accommodationRepository: AccommodationRepository,
  ) {}

  async execute(input: GetMemberAccommodationStatisticsInput) {
    const memberships: OrganizationMembershipWithOrganization[] =
      await this.membershipRepository.findByUserId(input.userId);

    const organizationIds = memberships.map(
      (membership) => membership.organizationId,
    );

    if (organizationIds.length === 0) return [];

    const result =
      await this.accommodationRepository.findByOrganizationIds(organizationIds);

    if (!result) return [];

    return result;
  }
}
