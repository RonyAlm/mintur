import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ActivateOrganizationUseCase,
  CreateOrganizationUseCase,
  DeactivateOrganizationUseCase,
  GetOrganizationByIdUseCase,
  ListOrganizationsUseCase,
  UpdateOrganizationUseCase,
} from '../../applications';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dtos';

@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly getOrganizationByIdUseCase: GetOrganizationByIdUseCase,
    private readonly listOrganizationsUseCase: ListOrganizationsUseCase,
    private readonly updateOrganizationUseCase: UpdateOrganizationUseCase,
    private readonly activateOrganizationUseCase: ActivateOrganizationUseCase,
    private readonly deactivateOrganizationUseCase: DeactivateOrganizationUseCase,
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
}
