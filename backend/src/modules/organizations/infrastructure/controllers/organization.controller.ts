import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ActivateOrganizationUseCase,
  CreateOrganizationMembershipUseCase,
  CreateOrganizationUseCase,
  DeactivateOrganizationUseCase,
  GetMyOrganizationsUseCase,
  GetOrganizationByIdUseCase,
  GetOrganizationMembershipsUseCase,
  GetUserOrganizationsUseCase,
  ListOrganizationsUseCase,
  RemoveOrganizationMembershipUseCase,
  UpdateOrganizationMembershipUseCase,
  UpdateOrganizationUseCase,
} from '../../applications';
import {
  CreateOrganizationDto,
  CreateOrganizationMembershipDto,
  UpdateOrganizationDto,
  UpdateOrganizationMembershipDto,
} from './dtos';
import { Auth } from '../../../../core/decorators';
import { CurrentUser } from '../../../../modules/auth/infrastructure/decorators';
import type { AuthenticatedUser } from '../../../../modules/auth/applications/types';
import { JwtAuthGuard } from '../../../../modules/auth/infrastructure/guards';

@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly getOrganizationByIdUseCase: GetOrganizationByIdUseCase,
    private readonly listOrganizationsUseCase: ListOrganizationsUseCase,
    private readonly updateOrganizationUseCase: UpdateOrganizationUseCase,
    private readonly activateOrganizationUseCase: ActivateOrganizationUseCase,
    private readonly deactivateOrganizationUseCase: DeactivateOrganizationUseCase,
    private readonly createOrganizationMembershipUseCase: CreateOrganizationMembershipUseCase,
    private readonly getOrganizationMembershipsUseCase: GetOrganizationMembershipsUseCase,
    private readonly getUserOrganizationsUseCase: GetUserOrganizationsUseCase,
    private readonly updateOrganizationMembershipUseCase: UpdateOrganizationMembershipUseCase,
    private readonly removeOrganizationMembershipUseCase: RemoveOrganizationMembershipUseCase,
    private readonly getMyOrganizationsUseCase: GetMyOrganizationsUseCase,
  ) {}

  @Get()
  @Auth('organizations:list')
  async findAll(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.listOrganizationsUseCase.execute(currentUser.roleId);
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  async getMyOrganizations(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.getMyOrganizationsUseCase.execute(currentUser.id);
  }

  @Get(':id')
  @Auth('organizations:read')
  async findById(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.getOrganizationByIdUseCase.execute({
      currentUser,
      organizationId: id,
    });
  }

  @Post()
  @Auth('organizations:create')
  async createOrganization(
    @Body() dto: CreateOrganizationDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.createOrganizationUseCase.execute({
      currentUserRoleId: currentUser.roleId,
      ...dto,
    });
  }

  @Patch(':id')
  @Auth('organizations:update')
  async updateOrganization(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.updateOrganizationUseCase.execute(id, {
      ...dto,
      currentUser,
    });
  }

  @Patch(':id/activate')
  @Auth('organizations:activate')
  async activateOrganization(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.activateOrganizationUseCase.execute(id, currentUser.roleId);
  }

  @Patch(':id/deactivate')
  @Auth('organizations:deactivate')
  async deactivateOrganization(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.deactivateOrganizationUseCase.execute(id, currentUser.roleId);
  }

  @Post(':organizationId/members')
  @Auth('organization_members:create')
  async createOrganizationMembership(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateOrganizationMembershipDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.createOrganizationMembershipUseCase.execute({
      ...dto,
      organizationId,
      currentUser,
    });
  }

  @Get(':organizationId/members')
  @Auth('organization_members:read')
  async getOrganizationMemberships(
    @Param('organizationId') organizationId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.getOrganizationMembershipsUseCase.execute({
      organizationId,
      currentUser,
    });
  }

  //TODO: despues cambiar al modulo de users
  @Get('/users/:userId/organizations')
  @Auth('organization_members:read')
  async getUserOrganizations(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.getUserOrganizationsUseCase.execute({
      currentUserRoleId: currentUser.roleId,
      userId,
    });
  }

  @Patch(':organizationId/members/:userId')
  @Auth('organization_members:update')
  async updateOrganizationMembership(
    @Param('organizationId') organizationId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateOrganizationMembershipDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.updateOrganizationMembershipUseCase.execute({
      currentUser,
      userId,
      organizationId,
      ...dto,
    });
  }

  @Delete(':organizationId/members/:userId')
  @Auth('organization_members:delete')
  async deleteOrganizationMembership(
    @Param('organizationId') organizationId: string,
    @Param('userId') userId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.removeOrganizationMembershipUseCase.execute(
      currentUser,
      userId,
      organizationId,
    );
  }
}
