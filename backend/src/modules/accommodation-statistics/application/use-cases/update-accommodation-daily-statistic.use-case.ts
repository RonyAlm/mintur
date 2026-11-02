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

export interface UpdateAccommodationDailyStatisticInput {
  currentUser: { id: string; roleId: string };
  statisticId: string;

  totalGuests: number;
  ageRanges: AccommodationStatisticAgeRange[];
  travelPurposes: AccommodationStatisticTravelPurpose[];
  origins: AccommodationStatisticOrigin[];
}

@Injectable()
export class UpdateAccommodationDailyStatisticUseCase {
  constructor(
    private readonly accommodationStatisticRepository: AccommodationStatisticRepository,
    private readonly accommodationRepository: AccommodationRepository,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async execute(input: UpdateAccommodationDailyStatisticInput) {
    const statistic = await this.accommodationStatisticRepository.findById(
      input.statisticId,
    );

    if (!statistic) throw new NotFoundException('La estadística no existe');

    const accommodation = await this.accommodationRepository.findById(
      statistic.accommodationId,
    );
    if (!accommodation) throw new NotFoundException('El alojamiento no existe');

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

    if (!accommodation.isActive)
      throw new ConflictException('El alojamiento está desactivado');

    this.validateAgeRange(input.totalGuests, input.ageRanges);
    this.validateTravelPurposes(input.totalGuests, input.travelPurposes);
    this.validateOrigins(input.totalGuests, input.origins);

    return this.accommodationStatisticRepository.update({
      ...statistic,
      totalGuests: input.totalGuests,
      ageRanges: input.ageRanges,
      travelPurposes: input.travelPurposes,
      origins: input.origins,

      updatedAt: new Date(),
    });
  }

  private validateAgeRange(
    totalGuests: number,
    ageRanges: AccommodationStatisticAgeRange[],
  ) {
    if (totalGuests !== ageRanges.reduce((acc, cur) => acc + cur.quantity, 0))
      throw new ConflictException(
        'La cantidad de huéspedes no coincide con las edades',
      );
  }

  private validateTravelPurposes(
    totalGuests: number,
    travelPurposes: AccommodationStatisticTravelPurpose[],
  ) {
    if (
      totalGuests !== travelPurposes.reduce((acc, cur) => acc + cur.quantity, 0)
    )
      throw new ConflictException(
        'La cantidad de huéspedes no coincide con los fines de viaje',
      );
  }

  private validateOrigins(
    totalGuests: number,
    origins: AccommodationStatisticOrigin[],
  ) {
    if (totalGuests !== origins.reduce((acc, cur) => acc + cur.quantity, 0))
      throw new ConflictException(
        'La cantidad de huéspedes no coincide con los lugares de procedencia',
      );
  }
}
