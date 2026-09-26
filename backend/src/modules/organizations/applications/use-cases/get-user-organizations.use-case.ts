import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationMembershipRepository } from '../../domain';
import { GetUserByIdUseCase } from '../../../../modules/users/applications';

@Injectable()
export class GetUserOrganizationsUseCase {
  constructor(
    private readonly membershipRepository: OrganizationMembershipRepository,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
  ) {}

  async execute(userId: string) {
    const user = await this.getUserByIdUseCase.execute(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return this.membershipRepository.findByUserId(userId);
  }
}
