import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Accommodation,
  AccommodationRepository,
  AccommodationType,
} from '../../domain';
import {
  OrganizationRepository,
  OrganizationType,
} from 'src/modules/organizations/domain';
import { OrganizationAccessService } from 'src/modules/organizations/applications';

export interface CreateAccommodationInput {
  currentUserRoleId: string;

  organizationId: string;
  type: AccommodationType;

  image?: string;
  address?: string;
  addressMap?: string;
  phoneOne?: string;
  phoneTwo?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
}

@Injectable()
export class CreateAccommodationUseCase {
  constructor(
    private readonly accommodationRepository: AccommodationRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async execute(input: CreateAccommodationInput) {
    const isSystemAdmin = await this.organizationAccessService.isSystemAdmin(
      input.currentUserRoleId,
    );

    if (!isSystemAdmin) {
      throw new ForbiddenException(
        'No tienes permisos para crear alojamientos',
      );
    }

    const organization = await this.organizationRepository.findById(
      input.organizationId,
    );
    if (!organization) throw new NotFoundException('La organización no existe');

    if (!organization.isActive)
      throw new ForbiddenException('La organización está desactivada');

    if (organization.type !== OrganizationType.ACCOMMODATION)
      throw new ConflictException('La organización no es de alojamientos');

    const accommodationExists =
      await this.accommodationRepository.findByOrganizationId(
        input.organizationId,
      );
    if (accommodationExists)
      throw new ConflictException(
        'La organización ya tiene un alojamiento asociado',
      );

    const inputAccommodation: Accommodation = {
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      isActive: true,
      type: input.type,
      image: input.image,
      address: input.address,
      addressMap: input.addressMap,
      phoneOne: input.phoneOne,
      phoneTwo: input.phoneTwo,
      email: input.email,
      website: input.website,
      instagram: input.instagram,
      facebook: input.facebook,

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.accommodationRepository.create(inputAccommodation);
  }
}
