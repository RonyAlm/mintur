import { describe, expect, it } from "vitest"

import { accommodationFormSchema } from "./accommodation.schema"

const validValues = {
  organizationName: "Hospedaje Central",
  organizationDescription: "",
  type: "HOTEL",
  capacity: "",
  totalRooms: "",
  totalBeds: "",
  locality: "",
  image: "",
  address: "",
  addressMap: "",
  phoneOne: "",
  phoneTwo: "",
  email: "",
  website: "",
  instagram: "",
  facebook: "",
}

describe("accommodationFormSchema", () => {
  it("accepts empty optional fields and valid optional values", () => {
    const result = accommodationFormSchema.safeParse({
      ...validValues,
      capacity: "12",
      email: "host@example.com",
      website: "https://example.com",
    })

    expect(result.success).toBe(true)
  })

  it.each([
    ["email", "not-an-email"],
    ["website", "not-a-url"],
    ["addressMap", "not-a-url"],
    ["image", "not-a-url"],
    ["capacity", "-1"],
    ["totalRooms", "invalid"],
    ["totalBeds", "-2"],
  ] as const)("rejects invalid %s", (field, value) => {
    const result = accommodationFormSchema.safeParse({
      ...validValues,
      [field]: value,
    })

    expect(result.success).toBe(false)
  })
})
