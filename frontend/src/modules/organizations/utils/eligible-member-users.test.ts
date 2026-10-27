import { describe, expect, it } from "vitest"
import type { ManagedRole } from "@/modules/roles/api/roles.api"
import type { ManagedUser } from "@/modules/users/api/users.api"
import { getEligibleMemberUsers } from "./eligible-member-users"

const user = (id: string, roleId: string): ManagedUser => ({
  id,
  username: `user-${id}`,
  firstName: "Test",
  lastName: "User",
  email: `${id}@example.com`,
  roleId,
  isActive: true,
  mustChangePassword: false,
})

const role = (id: string, isSystemRole: boolean): ManagedRole => ({
  id,
  name: id,
  description: null,
  isSystemRole,
})

describe("getEligibleMemberUsers", () => {
  it("excludes system-role users and users already in the organization", () => {
    expect(getEligibleMemberUsers(
      [user("ordinary", "ordinary-role"), user("system", "system-role"), user("already-member", "ordinary-role")],
      [role("ordinary-role", false), role("system-role", true)],
      new Set(["already-member"]),
    )).toEqual([user("ordinary", "ordinary-role")])
  })

  it("fails closed when a user's role is absent from the role catalog", () => {
    expect(getEligibleMemberUsers(
      [user("unknown-role", "missing-role")],
      [],
      new Set(),
    )).toEqual([])
  })
})
