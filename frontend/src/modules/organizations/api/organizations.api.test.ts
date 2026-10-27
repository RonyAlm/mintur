import { beforeEach, describe, expect, it, vi } from "vitest"
import { api } from "@/lib/axios"
import { organizationsApi } from "./organizations.api"

vi.mock("@/lib/axios", () => ({
  api: {
    get: vi.fn(),
  },
}))

describe("organizationsApi", () => {
  beforeEach(() => vi.clearAllMocks())

  it("loads the current user's organizations", async () => {
    const memberships = [{
      organizationId: "org-1",
      userId: "user-1",
      role: "OWNER",
      organization: { id: "org-1", name: "Hotel Central", type: "ACCOMMODATION", isActive: true },
    }]
    vi.mocked(api.get).mockResolvedValue({ data: memberships })

    await expect(organizationsApi.listMine()).resolves.toEqual(memberships)
    expect(api.get).toHaveBeenCalledWith("/organizations/me")
  })

  it("loads members for the selected organization", async () => {
    const members = [{
      organizationId: "org-1",
      userId: "user-2",
      role: "OPERATOR",
      user: { id: "user-2", username: "operator", email: "operator@example.com" },
    }]
    vi.mocked(api.get).mockResolvedValue({ data: members })

    await expect(organizationsApi.listMembers("org-1")).resolves.toEqual(members)
    expect(api.get).toHaveBeenCalledWith("/organizations/org-1/members")
  })
})
