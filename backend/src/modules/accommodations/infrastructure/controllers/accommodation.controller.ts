import { Body, Controller, Post } from '@nestjs/common';
import { CreateAccommodationUseCase } from '../../application/use-cases';
import { CreateAccommodationDto } from './dtos';
import { CurrentUser } from '../../../../modules/auth/infrastructure/decorators';
import { type AuthenticatedUser } from '../../../../modules/auth/applications/types';
import { Auth } from 'src/core/decorators';

@Controller('accommodations')
export class AccommodationController {
  constructor(
    private readonly createAccommodationUseCase: CreateAccommodationUseCase,
  ) {}

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
}
