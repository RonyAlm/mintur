import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AccommodationStatisticAgeRange,
  AccommodationStatisticOrigin,
  AccommodationStatisticRepository,
  AccommodationStatisticTravelPurpose,
} from '../../domain';
import { OrganizationAccessService } from '../../../../modules/organizations/applications';
import { OrganizationMemberRole } from '../../../../modules/organizations/domain';
import { AccommodationRepository } from '../../../../modules/accommodations/domain';

export interface CreateAccommodationDailyStatisticInput {
  currentUser: { id: string; roleId: string };

  accommodationId: string;
  date: Date;
  totalGuests: number;
  ageRanges: AccommodationStatisticAgeRange[];
  travelPurposes: AccommodationStatisticTravelPurpose[];
  origins: AccommodationStatisticOrigin[];
}

@Injectable()
export class CreateAccommodationDailyStatisticUseCase {
  constructor(
    private readonly accommodationStatisticRepository: AccommodationStatisticRepository,
    private readonly accommodationRepository: AccommodationRepository,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async execute(input: CreateAccommodationDailyStatisticInput) {
    const accommodation = await this.accommodationRepository.findById(
      input.accommodationId,
    );

    if (!accommodation) throw new NotFoundException('El alojamiento no existe');

    if (!accommodation.isActive)
      throw new ConflictException('El alojamiento está desactivado');

    const isAdminSystem = await this.organizationAccessService.isSystemAdmin(
      input.currentUser.roleId,
    );
    if (!isAdminSystem) {
      await this.organizationAccessService.requireRole(
        input.currentUser.id,
        accommodation.organizationId,
        [OrganizationMemberRole.ADMIN, OrganizationMemberRole.OPERATOR],
      );
    }

    const existingStatistic =
      await this.accommodationStatisticRepository.findByAccommodationAndDate(
        input.accommodationId,
        input.date,
      );

    if (existingStatistic)
      throw new ConflictException('Ya existe una estadística para ese día');

    this.validateAgeRange(input.totalGuests, input.ageRanges);
    this.validateTravelPurposes(input.totalGuests, input.travelPurposes);
    this.validateOrigins(input.totalGuests, input.origins);

    const inputStatistic = {
      id: crypto.randomUUID(),
      accommodationId: input.accommodationId,
      date: input.date,
      totalGuests: input.totalGuests,
      ageRanges: input.ageRanges,
      travelPurposes: input.travelPurposes,
      origins: input.origins,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.accommodationStatisticRepository.create(inputStatistic);
  }

  private validateAgeRange(
    totalGuests: number,
    ageRanges: AccommodationStatisticAgeRange[],
  ) {
    if (
      totalGuests !== ageRanges.reduce((acc, range) => acc + range.quantity, 0)
    ) {
      throw new ConflictException(
        'La suma de los rangos de edad debe ser igual al total de huéspedes',
      );
    }
  }

  private validateTravelPurposes(
    totalGuests: number,
    travelPurposes: AccommodationStatisticTravelPurpose[],
  ) {
    if (
      totalGuests !==
      travelPurposes.reduce((acc, purpose) => acc + purpose.quantity, 0)
    ) {
      throw new ConflictException(
        'La suma del total del motivo de viaje debe ser igual al total de huéspedes',
      );
    }
  }

  private validateOrigins(
    totalGuests: number,
    origins: AccommodationStatisticOrigin[],
  ) {
    if (
      totalGuests !== origins.reduce((acc, origin) => acc + origin.quantity, 0)
    ) {
      throw new ConflictException(
        'La suma de los lugares de procedencia debe ser igual al total de huéspedes',
      );
    }
  }
}
