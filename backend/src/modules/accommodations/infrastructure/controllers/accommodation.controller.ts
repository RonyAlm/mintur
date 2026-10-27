import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ActivateAccommodationUseCase,
  CreateAccommodationUseCase,
  DeactivateAccommodationUseCase,
  GetAccommodationByIdUseCase,
  GetAccommodationByOrganizationIdUseCase,
  ListAccommodationsUseCase,
  UpdateAccommodationUseCase,
} from '../../application';
import { CreateAccommodationDto, UpdateAccommodationDto } from './dtos';
import { CurrentUser } from '../../../../modules/auth/infrastructure/decorators';
import { type AuthenticatedUser } from '../../../../modules/auth/applications/types';
import { Auth } from '../../../../core/decorators';

@Controller('accommodations')
export class AccommodationController {
  constructor(
    private readonly createAccommodationUseCase: CreateAccommodationUseCase,
    private readonly getAccommodationByIdUseCase: GetAccommodationByIdUseCase,
    private readonly listAccommodationsUseCase: ListAccommodationsUseCase,
    private readonly updateAccommodationUseCase: UpdateAccommodationUseCase,
    private readonly activateAccommodationUseCase: ActivateAccommodationUseCase,
    private readonly deactivateAccommodationUseCase: DeactivateAccommodationUseCase,
    private readonly getAccommodationByOrganizationIdUseCase: GetAccommodationByOrganizationIdUseCase,
  ) {}

  @Get()
  @Auth('accommodations:read')
  async listAccommodations(@CurrentUser() currentUser: AuthenticatedUser) {
    return this.listAccommodationsUseCase.execute({
      currentUserRoleId: currentUser.roleId,
      currentUserId: currentUser.id,
    });
  }

  @Get('organization/:organizationId')
  @Auth('organizations:read')
  async getAccommodationByOrganizationId(
    @Param('organizationId') organizationId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.getAccommodationByOrganizationIdUseCase.execute({
      currentUser,
      organizationId,
    });
  }

  @Get(':id')
  @Auth('accommodations:read')
  async getAccommodationById(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.getAccommodationByIdUseCase.execute({
      currentUser,
      accommodationId: id,
    });
  }

  @Post()
  @Auth('accommodations:create')
  async createAccommodation(
    @Body() dto: CreateAccommodationDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.createAccommodationUseCase.execute({
      ...dto,
      currentUserRoleId: currentUser.roleId,
    });
  }

  @Patch(':id')
  @Auth('accommodations:update')
  async updateAccommodation(
    @Param('id') id: string,
    @Body() dto: UpdateAccommodationDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.updateAccommodationUseCase.execute({
      currentUser,
      accommodationId: id,
      ...dto,
    });
  }

  @Patch(':id/activate')
  @Auth('accommodations:activate')
  async activateAccommodation(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.activateAccommodationUseCase.execute({
      currentUser,
      accommodationId: id,
    });
  }

  @Patch(':id/deactivate')
  @Auth('accommodations:deactivate')
  async deactivateAccommodation(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.deactivateAccommodationUseCase.execute({
      currentUser,
      accommodationId: id,
    });
  }
}
