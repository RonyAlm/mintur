import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ActivateOrganizationUseCase,
  CreateOrganizationMembershipUseCase,
  CreateOrganizationUseCase,
  DeactivateOrganizationUseCase,
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
  ) {}

  @Get()
  async findAll() {
    return this.listOrganizationsUseCase.execute();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.getOrganizationByIdUseCase.execute(id);
  }

  @Post()
  async createOrganization(@Body() dto: CreateOrganizationDto) {
    return this.createOrganizationUseCase.execute(dto);
  }

  @Patch(':id')
  async updateOrganization(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.updateOrganizationUseCase.execute(id, {
      ...dto,
    });
  }

  @Patch(':id/activate')
  async activateOrganization(@Param('id') id: string) {
    return this.activateOrganizationUseCase.execute(id);
  }

  @Patch(':id/deactivate')
  async deactivateOrganization(@Param('id') id: string) {
    return this.deactivateOrganizationUseCase.execute(id);
  }

  @Post(':organizationId/members')
  async createOrganizationMembership(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateOrganizationMembershipDto,
  ) {
    return this.createOrganizationMembershipUseCase.execute({
      ...dto,
      organizationId,
    });
  }

  @Get(':organizationId/members')
  async getOrganizationMemberships(
    @Param('organizationId') organizationId: string,
  ) {
    return this.getOrganizationMembershipsUseCase.execute(organizationId);
  }

  //TODO: despues cambiar al modulo de users
  @Get('/users/:userId/organizations')
  async getUserOrganizations(@Param('userId') userId: string) {
    return this.getUserOrganizationsUseCase.execute(userId);
  }

  @Patch(':organizationId/members/:userId')
  async updateOrganizationMembership(
    @Param('organizationId') organizationId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateOrganizationMembershipDto,
  ) {
    return this.updateOrganizationMembershipUseCase.execute({
      userId,
      organizationId,
      ...dto,
    });
  }

  @Delete(':organizationId/members/:userId')
  async deleteOrganizationMembership(
    @Param('organizationId') organizationId: string,
    @Param('userId') userId: string,
  ) {
    return this.removeOrganizationMembershipUseCase.execute(
      userId,
      organizationId,
    );
  }
}
