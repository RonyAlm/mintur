import { describe, expect, it } from "vitest"

import { AccommodationType } from "../types/accommodation.types"
import {
  accommodationToFormValues,
  formValuesToAccommodationInput,
} from "./accommodation-form-mappers"

const values = {
  organizationName: "  Hotel Central  ",
  organizationDescription: "  Descanso  ",
  type: AccommodationType.HOTEL,
  capacity: "20",
  totalRooms: "8",
  totalBeds: "16",
  locality: " Formosa ",
  image: " https://example.com/image.png ",
  address: " Calle 1 ",
  addressMap: " ",
  phoneOne: " 3704000000 ",
  phoneTwo: "",
  email: "",
  website: "",
  instagram: " @hotel ",
  facebook: "",
}

describe("accommodation form mappers", () => {
  it("converts form strings to the API input shape", () => {
    expect(formValuesToAccommodationInput(values)).toEqual({
      organization: { name: "Hotel Central", description: "Descanso" },
      type: AccommodationType.HOTEL,
      capacity: 20,
      totalRooms: 8,
      totalBeds: 16,
      locality: "Formosa",
      image: "https://example.com/image.png",
      address: "Calle 1",
      addressMap: undefined,
      phoneOne: "3704000000",
      phoneTwo: undefined,
      email: undefined,
      website: undefined,
      instagram: "@hotel",
      facebook: undefined,
    })
  })

  it("maps absent and invalid optional numbers to undefined", () => {
    expect(formValuesToAccommodationInput({ ...values, capacity: "", totalRooms: "-1" })).toMatchObject({
      capacity: undefined,
      totalRooms: undefined,
    })
  })

  it("maps an accommodation to edit form defaults, preserving empty nullable fields", () => {
    expect(accommodationToFormValues({
      id: "a1", organizationId: "o1", type: AccommodationType.HOSTEL, isActive: true,
      capacity: null, totalRooms: 4, totalBeds: 8, image: null, locality: null,
      address: null, addressMap: null, phoneOne: null, phoneTwo: null, email: null,
      website: null, instagram: null, facebook: null, createdAt: "now", updatedAt: "now",
      organization: { id: "o1", name: "Hostel", description: null },
    })).toEqual({
      organizationName: "Hostel", organizationDescription: "", type: AccommodationType.HOSTEL,
      capacity: "", totalRooms: "4", totalBeds: "8", locality: "", image: "", address: "",
      addressMap: "", phoneOne: "", phoneTwo: "", email: "", website: "", instagram: "", facebook: "",
    })
  })
})
