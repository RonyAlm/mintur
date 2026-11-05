import { api } from "@/lib/axios"
import type { Accommodation } from "../types/accommodation.types"
import type { AccommodationDailyStatistic, AccommodationStatisticsSummary, CreateAccommodationDailyStatisticRequest, UpdateAccommodationDailyStatisticRequest } from "../types/accommodation-statistics.types"

export const accommodationStatisticsApi = {
  async listMemberAccommodations(): Promise<Accommodation[]> {
    const { data } = await api.get<Accommodation[]>("/accommodation-statistics/member/accommodations")
    return data
  },

  async createDailyStatistic(statistic: CreateAccommodationDailyStatisticRequest): Promise<AccommodationDailyStatistic> {
    const { data } = await api.post<AccommodationDailyStatistic>("/accommodation-statistics", statistic)
    return data
  },

  async updateDailyStatistic(statisticId: string, statistic: UpdateAccommodationDailyStatisticRequest): Promise<AccommodationDailyStatistic> {
    const { data } = await api.patch<AccommodationDailyStatistic>(`/accommodation-statistics/${statisticId}`, statistic)
    return data
  },

  async getDailyStatistic(statisticId: string): Promise<AccommodationDailyStatistic> {
    const { data } = await api.get<AccommodationDailyStatistic>(`/accommodation-statistics/${statisticId}`)
    return data
  },

  async listByAccommodation(accommodationId: string, from: string, to: string): Promise<AccommodationDailyStatistic[]> {
    const { data } = await api.get<AccommodationDailyStatistic[]>(`/accommodation-statistics/accommodation/${accommodationId}`, {
      params: { from, to },
    })
    return data
  },

  async getSummary(accommodationId: string, from: string, to: string): Promise<AccommodationStatisticsSummary> {
    const { data } = await api.get<AccommodationStatisticsSummary>(`/accommodation-statistics/accommodation/${accommodationId}/summary`, {
      params: { from, to },
    })
    return data
  },
}
