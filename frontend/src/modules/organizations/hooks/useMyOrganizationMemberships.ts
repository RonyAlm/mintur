import { useQuery } from "@tanstack/react-query"
import { organizationsApi, type OrganizationMembership } from "../api/organizations.api"

const EMPTY_MEMBERSHIPS: OrganizationMembership[] = []

export function useMyOrganizationMemberships(userId: string | undefined) {
  const { data } = useQuery({
    queryKey: ["my-organization-memberships", userId],
    queryFn: () => organizationsApi.listMine(),
    enabled: Boolean(userId),
    retry: false,
  })

  return data ?? EMPTY_MEMBERSHIPS
}
