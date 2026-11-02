jest.mock('../../../../modules/organizations/applications', () => ({
  OrganizationAccessService: class OrganizationAccessService {},
}));

import { ForbiddenException } from '@nestjs/common';
import { OrganizationMemberRole } from '../../../../modules/organizations/domain';
import { CreateAccommodationDailyStatisticUseCase } from './create-accommodation-daily-statistic.use-case';

describe('CreateAccommodationDailyStatisticUseCase', () => {
  const input = {
    currentUser: { id: 'operator-1', roleId: 'user-role' },
    accommodationId: 'accommodation-1',
    date: new Date('2026-10-28T00:00:00.000Z'),
    totalGuests: 2,
    ageRanges: [{ ageRange: 'AGE_18_30', quantity: 2 }],
    travelPurposes: [{ purpose: 'TOURISM', quantity: 2 }],
    origins: [{ type: 'PROVINCE', name: 'Formosa', quantity: 2 }],
  };

  function createUseCase(isSystemAdmin = false) {
    const accommodationStatisticRepository = {
      findByAccommodationAndDate: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation(async (statistic) => statistic),
    };
    const accommodationRepository = {
      findById: jest.fn().mockResolvedValue({
        id: input.accommodationId,
        organizationId: 'organization-1',
        isActive: true,
      }),
    };
    const organizationAccessService = {
      isSystemAdmin: jest.fn().mockResolvedValue(isSystemAdmin),
      requireRole: jest.fn().mockResolvedValue({ role: OrganizationMemberRole.OPERATOR }),
    };

    return {
      useCase: new CreateAccommodationDailyStatisticUseCase(
        accommodationStatisticRepository as never,
        accommodationRepository as never,
        organizationAccessService as never,
      ),
      accommodationStatisticRepository,
      organizationAccessService,
    };
  }

  it('requires operator or admin membership in the accommodation organization before creating', async () => {
    const { useCase, organizationAccessService } = createUseCase();

    await useCase.execute(input as never);

    expect(organizationAccessService.requireRole).toHaveBeenCalledWith(
      input.currentUser.id,
      'organization-1',
      [OrganizationMemberRole.ADMIN, OrganizationMemberRole.OPERATOR],
    );
  });

  it('does not create a record when the user is not an organization operator', async () => {
    const { useCase, organizationAccessService, accommodationStatisticRepository } = createUseCase();
    jest.mocked(organizationAccessService.requireRole).mockRejectedValue(
      new ForbiddenException('No tienes permisos suficientes dentro de esta organización'),
    );

    await expect(useCase.execute(input as never)).rejects.toThrow(ForbiddenException);
    expect(accommodationStatisticRepository.create).not.toHaveBeenCalled();
  });

  it('preserves the system administrator bypass', async () => {
    const { useCase, organizationAccessService, accommodationStatisticRepository } = createUseCase(true);

    await useCase.execute(input as never);

    expect(organizationAccessService.requireRole).not.toHaveBeenCalled();
    expect(accommodationStatisticRepository.create).toHaveBeenCalledTimes(1);
  });
});
