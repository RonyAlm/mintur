jest.mock('../../../../modules/organizations/applications', () => ({
  OrganizationAccessService: class OrganizationAccessService {},
}));

import { ForbiddenException } from '@nestjs/common';
import { OrganizationMemberRole } from '../../../../modules/organizations/domain';
import { UpdateAccommodationDailyStatisticUseCase } from './update-accommodation-daily-statistic.use-case';

describe('UpdateAccommodationDailyStatisticUseCase', () => {
  const input = {
    currentUser: { id: 'operator-1', roleId: 'user-role' },
    statisticId: 'stat-1',
    totalGuests: 1,
    ageRanges: [{ statisticId: 'stat-1', ageRange: 'AGE_18_30', quantity: 1 }],
    travelPurposes: [{ statisticId: 'stat-1', purpose: 'TOURISM', quantity: 1 }],
    origins: [{ statisticId: 'stat-1', type: 'PROVINCE', name: 'Formosa', quantity: 1 }],
  };

  function createUseCase(isSystemAdmin = false) {
    const statisticRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'stat-1', accommodationId: 'accommodation-1' }),
      update: jest.fn().mockImplementation(async (statistic) => statistic),
    };
    const accommodationRepository = {
      findById: jest.fn().mockResolvedValue({ organizationId: 'organization-1', isActive: true }),
    };
    const organizationAccessService = {
      isSystemAdmin: jest.fn().mockResolvedValue(isSystemAdmin),
      requireRole: jest.fn().mockResolvedValue({ role: OrganizationMemberRole.OPERATOR }),
    };

    return {
      useCase: new UpdateAccommodationDailyStatisticUseCase(
        statisticRepository as never,
        accommodationRepository as never,
        organizationAccessService as never,
      ),
      statisticRepository,
      organizationAccessService,
    };
  }

  it('requires operator or admin membership for the accommodation organization before updating', async () => {
    const { useCase, organizationAccessService } = createUseCase();

    await useCase.execute(input as never);

    expect(organizationAccessService.requireRole).toHaveBeenCalledWith(
      input.currentUser.id,
      'organization-1',
      [OrganizationMemberRole.ADMIN, OrganizationMemberRole.OPERATOR],
    );
  });

  it('does not update when the organization role check rejects the user', async () => {
    const { useCase, organizationAccessService, statisticRepository } = createUseCase();
    jest.mocked(organizationAccessService.requireRole).mockRejectedValue(new ForbiddenException());

    await expect(useCase.execute(input as never)).rejects.toThrow(ForbiddenException);
    expect(statisticRepository.update).not.toHaveBeenCalled();
  });

  it('preserves the system administrator bypass', async () => {
    const { useCase, organizationAccessService, statisticRepository } = createUseCase(true);

    await useCase.execute(input as never);

    expect(organizationAccessService.requireRole).not.toHaveBeenCalled();
    expect(statisticRepository.update).toHaveBeenCalledTimes(1);
  });
});
