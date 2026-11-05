import { describe, expect, it } from "vitest"
import type { User } from "@/models/user.model"
import { canManageStatistics, getVisibleModules } from "./modules"

const operatorUser = {
  id: "operator-1",
  email: "operator@example.com",
  username: "operator",
  firstName: "Operator",
  lastName: "User",
  role: { id: "role-1", name: "Operator", description: null },
  permissions: ["accommodation-statistics:read"],
  mustChangePassword: false,
} satisfies User

describe("visible modules", () => {
  it("does not show the operator statistics module without operator membership", () => {
    expect(getVisibleModules(operatorUser).some((module) => module.id === "reportes")).toBe(false)
  })

  it("shows the daily statistics module to operators with the read permission", () => {
    expect(getVisibleModules(operatorUser, true).find((module) => module.id === "reportes")?.title)
      .toBe("Estadísticas")
  })
})

describe("statistics membership", () => {
  it("grants access to organization operators", () => {
    expect(canManageStatistics([{ role: "OPERATOR" }])).toBe(true)
  })

  it("grants access to organization admins", () => {
    expect(canManageStatistics([{ role: "ADMIN" }])).toBe(true)
  })

  it("does not grant access to owners or to users without memberships", () => {
    expect(canManageStatistics([{ role: "OWNER" }])).toBe(false)
    expect(canManageStatistics([])).toBe(false)
  })
})
