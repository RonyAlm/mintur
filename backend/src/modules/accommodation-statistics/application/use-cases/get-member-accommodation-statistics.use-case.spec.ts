import { OrganizationMemberRole } from '../../../../modules/organizations/domain';
import { GetMemberAccommodationStatisticsUseCase } from './get-member-accommodation-statistics.use-case';

describe('GetMemberAccommodationStatisticsUseCase', () => {
  it('returns accommodations from every organization where the user is a member', async () => {
    const memberships = [
      { organizationId: 'operator-org', role: OrganizationMemberRole.OPERATOR },
      { organizationId: 'admin-org', role: OrganizationMemberRole.ADMIN },
      { organizationId: 'owner-org', role: OrganizationMemberRole.OWNER },
    ];
    const operatorAccommodations = [{ id: 'accommodation-1', organizationId: 'operator-org' }];
    const membershipRepository = {
      findByUserId: jest.fn().mockResolvedValue(memberships),
    };
    const accommodationRepository = {
      findByOrganizationIds: jest.fn().mockResolvedValue(operatorAccommodations),
    };
    const useCase = new GetMemberAccommodationStatisticsUseCase(
      membershipRepository as never,
      accommodationRepository as never,
    );

    await expect(useCase.execute({ userId: 'user-1' })).resolves.toEqual(operatorAccommodations);
    expect(accommodationRepository.findByOrganizationIds).toHaveBeenCalledWith([
      'operator-org',
      'admin-org',
      'owner-org',
    ]);
  });

  it('returns an empty list without querying accommodations when the user has no memberships', async () => {
    const membershipRepository = {
      findByUserId: jest.fn().mockResolvedValue([]),
    };
    const accommodationRepository = {
      findByOrganizationIds: jest.fn(),
    };
    const useCase = new GetMemberAccommodationStatisticsUseCase(
      membershipRepository as never,
      accommodationRepository as never,
    );

    await expect(useCase.execute({ userId: 'user-1' })).resolves.toEqual([]);
    expect(accommodationRepository.findByOrganizationIds).not.toHaveBeenCalled();
  });
});
