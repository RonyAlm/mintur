import { api } from "@/lib/axios"

export type OrganizationMemberRole = "OWNER" | "ADMIN" | "OPERATOR"

export interface OrganizationSummary {
  id: string
  name: string
  type: string
  description?: string
  isActive: boolean
}

export interface OrganizationMembership {
  organizationId: string
  userId: string
  role: OrganizationMemberRole
  organization: OrganizationSummary
}

export interface OrganizationMember {
  organizationId: string
  userId: string
  role: OrganizationMemberRole
  user: {
    id: string
    email: string
    username: string
  }
}

export const organizationsApi = {
  async listMine(): Promise<OrganizationMembership[]> {
    const { data } = await api.get<OrganizationMembership[]>("/organizations/me")
    return data
  },

  async listMembers(organizationId: string): Promise<OrganizationMember[]> {
    const { data } = await api.get<OrganizationMember[]>(
      `/organizations/${organizationId}/members`,
    )
    return data
  },

  async addMember(
    organizationId: string,
    input: { userId: string; role: OrganizationMemberRole },
  ): Promise<OrganizationMember> {
    const { data } = await api.post<OrganizationMember>(
      `/organizations/${organizationId}/members`,
      input,
    )
    return data
  },

  async removeMember(organizationId: string, userId: string): Promise<void> {
    await api.delete(`/organizations/${organizationId}/members/${userId}`)
  },
}
