jest.mock('../../../../modules/organizations/applications', () => ({
  OrganizationAccessService: class OrganizationAccessService {},
}));

import { GetAccommodationStatisticsSummaryUseCase } from './get-accommodation-statistics-summary.use-case';

describe('GetAccommodationStatisticsSummaryUseCase', () => {
  it('returns canonical ageRanges and keeps same-name origins with different types separate', async () => {
    const statistics = [
      {
        id: 'stat-1',
        totalGuests: 3,
        ageRanges: [{ ageRange: 'AGE_18_30', quantity: 3 }],
        travelPurposes: [],
        origins: [
          { type: 'PROVINCE', name: 'Buenos Aires', quantity: 2 },
          { type: 'COUNTRY', name: 'Buenos Aires', quantity: 1 },
        ],
      },
    ];
    const accommodationStatisticRepository = {
      findByAccommodationId: jest.fn().mockResolvedValue(statistics),
    };
    const accommodationRepository = {
      findById: jest.fn().mockResolvedValue({ organizationId: 'org-1' }),
    };
    const organizationAccessService = {
      isSystemAdmin: jest.fn().mockResolvedValue(true),
    };
    const useCase = new GetAccommodationStatisticsSummaryUseCase(
      accommodationStatisticRepository as never,
      accommodationRepository as never,
      organizationAccessService as never,
    );

    const result = await useCase.execute({
      currentUser: { id: 'user-1', roleId: 'admin' },
      accommodationId: 'accommodation-1',
      from: new Date('2026-10-01'),
      to: new Date('2026-10-31'),
    });

    expect(result.ageRanges).toEqual([{ statisticId: 'stat-1', ageRange: 'AGE_18_30', quantity: 3 }]);
    expect(result).not.toHaveProperty('ageRages');
    expect(result.origins).toEqual([
      { statisticId: 'stat-1', type: 'PROVINCE', name: 'Buenos Aires', quantity: 2 },
      { statisticId: 'stat-1', type: 'COUNTRY', name: 'Buenos Aires', quantity: 1 },
    ]);
  });
});
