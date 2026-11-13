jest.mock('../../../../modules/organizations/applications', () => ({
  OrganizationAccessService: class OrganizationAccessService {},
}));

import { GetAllAccommodationsStatisticsSummaryUseCase } from './get-all-accommodations-statistics-summary.use-case';

describe('GetAllAccommodationsStatisticsSummaryUseCase', () => {
  it('keeps the origin name and aggregates by type and name', async () => {
    const statistics = [
      {
        id: 'stat-1',
        accommodationId: 'accommodation-1',
        totalGuests: 3,
        ageRanges: [],
        travelPurposes: [],
        origins: [
          { type: 'PROVINCE', name: 'Formosa', quantity: 2 },
          { type: 'COUNTRY', name: 'Brasil', quantity: 1 },
        ],
      },
      {
        id: 'stat-2',
        accommodationId: 'accommodation-2',
        totalGuests: 2,
        ageRanges: [],
        travelPurposes: [],
        origins: [{ type: 'PROVINCE', name: 'Formosa', quantity: 2 }],
      },
    ];
    const accommodationStatisticRepository = {
      findAll: jest.fn().mockResolvedValue(statistics),
    };
    const organizationAccessService = {
      isSystemAdmin: jest.fn().mockResolvedValue(true),
    };
    const useCase = new GetAllAccommodationsStatisticsSummaryUseCase(
      accommodationStatisticRepository as never,
      organizationAccessService as never,
    );

    const result = await useCase.execute({
      currentUser: { id: 'user-1', roleId: 'admin' },
      from: new Date('2026-10-01'),
      to: new Date('2026-10-31'),
    });

    expect(result.origins).toEqual([
      { type: 'PROVINCE', name: 'Formosa', quantity: 4 },
      { type: 'COUNTRY', name: 'Brasil', quantity: 1 },
    ]);
  });
});
