jest.mock('../../../../modules/organizations/applications', () => ({
  OrganizationAccessService: class OrganizationAccessService {},
}));

import { ForbiddenException } from '@nestjs/common';
import { ListAllAccommodationStatisticsUseCase } from './list-all-accommodation-statistics.use-case';

describe('ListAllAccommodationStatisticsUseCase', () => {
  const statistics = [
    {
      id: 'stat-1',
      accommodationId: 'accommodation-1',
      date: new Date('2026-10-01'),
      totalGuests: 3,
      ageRanges: [],
      travelPurposes: [],
      origins: [],
    },
    {
      id: 'stat-2',
      accommodationId: 'accommodation-2',
      date: new Date('2026-10-02'),
      totalGuests: 5,
      ageRanges: [],
      travelPurposes: [],
      origins: [],
    },
  ];

  it('returns all statistics when the user is a system admin', async () => {
    const repository = { findAll: jest.fn().mockResolvedValue(statistics) };
    const accessService = { isSystemAdmin: jest.fn().mockResolvedValue(true) };
    const useCase = new ListAllAccommodationStatisticsUseCase(
      repository as never,
      accessService as never,
    );

    const result = await useCase.execute({
      currentUser: { id: 'user-1', roleId: 'admin' },
      from: new Date('2026-10-01'),
      to: new Date('2026-10-31'),
    });

    expect(accessService.isSystemAdmin).toHaveBeenCalledWith('admin');
    expect(repository.findAll).toHaveBeenCalledWith(
      new Date('2026-10-01'),
      new Date('2026-10-31'),
    );
    expect(result).toEqual(statistics);
  });

  it('rejects users who are not system admins', async () => {
    const repository = { findAll: jest.fn() };
    const accessService = { isSystemAdmin: jest.fn().mockResolvedValue(false) };
    const useCase = new ListAllAccommodationStatisticsUseCase(
      repository as never,
      accessService as never,
    );

    await expect(
      useCase.execute({
        currentUser: { id: 'user-1', roleId: 'operator' },
        from: new Date('2026-10-01'),
        to: new Date('2026-10-31'),
      }),
    ).rejects.toThrow(ForbiddenException);

    expect(repository.findAll).not.toHaveBeenCalled();
  });

  it('rejects an inverted date range', async () => {
    const repository = { findAll: jest.fn() };
    const accessService = { isSystemAdmin: jest.fn().mockResolvedValue(true) };
    const useCase = new ListAllAccommodationStatisticsUseCase(
      repository as never,
      accessService as never,
    );

    await expect(
      useCase.execute({
        currentUser: { id: 'user-1', roleId: 'admin' },
        from: new Date('2026-10-31'),
        to: new Date('2026-10-01'),
      }),
    ).rejects.toThrow('La fecha de inicio es mayor que la de fin');

    expect(repository.findAll).not.toHaveBeenCalled();
  });
});
