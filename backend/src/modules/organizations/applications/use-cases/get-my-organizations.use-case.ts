import { Injectable } from '@nestjs/common';
import {
  OrganizationMembership,
  OrganizationMembershipRepository,
} from '../../domain';

@Injectable()
export class GetMyOrganizationsUseCase {
  constructor(
    private readonly membershipRepository: OrganizationMembershipRepository,
  ) {}

  async execute(userId: string): Promise<OrganizationMembership[]> {
    return await this.membershipRepository.findByUserId(userId);
  }
}
