import { useEffect, useState } from "react"
import { organizationsApi, type OrganizationMembership } from "../api/organizations.api"

export function useMyOrganizationMemberships(userId: string | undefined) {
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([])

  useEffect(() => {
    let active = true
    if (!userId) {
      setMemberships([])
      return () => { active = false }
    }

    organizationsApi.listMine()
      .then((nextMemberships) => { if (active) setMemberships(nextMemberships) })
      .catch(() => { if (active) setMemberships([]) })

    return () => { active = false }
  }, [userId])

  return memberships
}
