import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  OrganizationMemberRole,
  OrganizationMembership,
  OrganizationMembershipRepository,
} from '../../domain';
import { GetRoleByIdUseCase } from '../../../../modules/roles/application';

@Injectable()
export class OrganizationAccessService {
  constructor(
    private readonly organizationMembershipRepository: OrganizationMembershipRepository,
    private readonly getRoleByIdUseCase: GetRoleByIdUseCase,
  ) {}

  async getMembership(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationMembership> {
    const membership =
      await this.organizationMembershipRepository.findByUserAndOrganization(
        userId,
        organizationId,
      );
    if (!membership)
      throw new ConflictException('El usuario no pertenece a la organización');
    return membership;
  }

  async isSystemAdmin(roleId: string): Promise<boolean> {
    const role = await this.getRoleByIdUseCase.execute(roleId);

    if (!role) return false;

    return role.isSystemRole; // TODO: Revisar y modificar con isSystemRole
  }

  async requireOrganizationAdmin(
    roleId: string,
    userId: string,
    organizationId: string,
  ) {
    const isSystemAdmin = await this.isSystemAdmin(roleId);
    console.log('isSystemAdmin ', isSystemAdmin);
    if (isSystemAdmin) return null;

    return this.requireRole(userId, organizationId, [
      OrganizationMemberRole.ADMIN,
      OrganizationMemberRole.OWNER,
    ]);
  }

  async requireRole(
    userId: string,
    organizationId: string,
    allowedRoles: OrganizationMemberRole[],
  ) {
    const membership = await this.getMembership(userId, organizationId);
    if (!allowedRoles.includes(membership.role))
      throw new ForbiddenException(
        'No tienes permisos suficientes dentro de esta organización',
      );
    return membership;
  }
}
