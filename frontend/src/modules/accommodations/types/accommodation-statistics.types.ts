export type AccommodationAgeRange =
  | "AGE_0_12"
  | "AGE_13_17"
  | "AGE_18_30"
  | "AGE_31_45"
  | "AGE_46_60"
  | "AGE_61_PLUS"

export type AccommodationTravelPurpose =
  | "TOURISM"
  | "WORK"
  | "BUSINESS"
  | "VISIT_FAMILY"
  | "STUDIES"
  | "HEALTH"
  | "EVENTS"
  | "OTHER"

export type AccommodationOriginType = "PROVINCE" | "COUNTRY"

export interface CreateAccommodationDailyStatisticRequest {
  accommodationId: string
  date: string
  totalGuests: number
  ageRanges: { ageRange: AccommodationAgeRange; quantity: number }[]
  travelPurposes: { purpose: AccommodationTravelPurpose; quantity: number }[]
  origins: { type: AccommodationOriginType; name: string; quantity: number }[]
}

export type UpdateAccommodationDailyStatisticRequest = Pick<
  CreateAccommodationDailyStatisticRequest,
  "totalGuests" | "ageRanges" | "travelPurposes" | "origins"
>

export interface AccommodationDailyStatistic {
  id: string
  accommodationId: string
  date: string
  totalGuests: number
  ageRanges: { statisticId: string; ageRange: AccommodationAgeRange; quantity: number }[]
  travelPurposes: { statisticId: string; purpose: AccommodationTravelPurpose; quantity: number }[]
  origins: { statisticId: string; type: AccommodationOriginType; name: string; quantity: number }[]
}

export interface AccommodationStatisticsSummary {
  from: string
  to: string
  totalGuests: number
  ageRanges: { ageRange: AccommodationAgeRange; quantity: number }[]
  travelPurposes: { purpose: AccommodationTravelPurpose; quantity: number }[]
  origins: { type: AccommodationOriginType; name: string; quantity: number }[]
}
