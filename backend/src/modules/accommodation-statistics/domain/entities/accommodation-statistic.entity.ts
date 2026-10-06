export interface AccommodationDailyStatistic {
  id: string;
  accommodationId: string;
  date: Date;
  totalGuests: number;
  ageRanges: AccommodationStatisticAgeRange[];
  travelPurposes: AccommodationStatisticTravelPurpose[];
  origins: AccommodationStatisticOrigin[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AccommodationStatisticAgeRange {
  statisticId: string;
  ageRange: AccommodationAgeRange;
  quantity: number;
}

export interface AccommodationStatisticTravelPurpose {
  statisticId: string;
  purpose: AccommodationTravelPurpose;
  quantity: number;
}

export interface AccommodationStatisticOrigin {
  statisticId: string;
  type: AccommodationOriginType;
  name: string;
  quantity: number;
}

export const AccommodationAgeRange = {
  AGE_0_12: 'AGE_0_12',
  AGE_13_17: 'AGE_13_17',
  AGE_18_30: 'AGE_18_30',
  AGE_31_45: 'AGE_31_45',
  AGE_46_60: 'AGE_46_60',
  AGE_61_PLUS: 'AGE_61_PLUS',
} as const;

export type AccommodationAgeRange =
  (typeof AccommodationAgeRange)[keyof typeof AccommodationAgeRange];

export const AccommodationTravelPurpose = {
  TOURISM: 'TOURISM',
  WORK: 'WORK',
  BUSINESS: 'BUSINESS',
  VISIT_FAMILY: 'VISIT_FAMILY',
  STUDIES: 'STUDIES',
  HEALTH: 'HEALTH',
  EVENTS: 'EVENTS',
  OTHER: 'OTHER',
} as const;

export type AccommodationTravelPurpose =
  (typeof AccommodationTravelPurpose)[keyof typeof AccommodationTravelPurpose];

export const AccommodationOriginType = {
  PROVINCE: 'PROVINCE',
  COUNTRY: 'COUNTRY',
} as const;

export type AccommodationOriginType =
  (typeof AccommodationOriginType)[keyof typeof AccommodationOriginType];
