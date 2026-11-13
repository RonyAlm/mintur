import type { StatisticsDateRange, StatisticsPeriod } from "../components/statistics/AccommodationStatisticsPeriodFilters"

export function toDateInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export function getWeekRange(today: Date): StatisticsDateRange {
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  from.setDate(from.getDate() - ((from.getDay() + 6) % 7))
  const to = new Date(from)
  to.setDate(to.getDate() + 6)
  return { from: toDateInputValue(from), to: toDateInputValue(to) }
}

export function getMonthRange(today: Date): StatisticsDateRange {
  return {
    from: toDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1)),
    to: toDateInputValue(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
  }
}

export function getYearRange(today: Date): StatisticsDateRange {
  return {
    from: toDateInputValue(new Date(today.getFullYear(), 0, 1)),
    to: toDateInputValue(new Date(today.getFullYear(), 11, 31)),
  }
}

export function getPeriodRange(period: StatisticsPeriod, today = new Date()): StatisticsDateRange {
  if (period === "month") return getMonthRange(today)
  if (period === "year") return getYearRange(today)
  return getWeekRange(today)
}
