import { useMemo } from "react"
import { Link } from "react-router"
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"
import { ArrowRightIcon, CalendarDaysIcon } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import type { AccommodationDailyStatistic } from "../../types/accommodation-statistics.types"
import { useWeeklyStatistics } from "../../hooks/useWeeklyStatistics"

const chartConfig = {
  guests: { label: "Huéspedes", color: "#15ee39" },
}

interface AccommodationWeeklyStatisticsCardProps {
  accommodationId: string
  /** Ruta a la que navega el botón "Ver más detalles". */
  detailsPath: string
}

export default function AccommodationWeeklyStatisticsCard({
  accommodationId,
  detailsPath,
}: AccommodationWeeklyStatisticsCardProps) {
  const { data, weeks, isLoading, isError, refetch } = useWeeklyStatistics(accommodationId)

  const currentWeekRecords = useMemo<AccommodationDailyStatistic[]>(
    () => data?.pages[0] ?? [],
    [data?.pages],
  )

  const recordsByDate = useMemo(() => {
    const map = new Map<string, AccommodationDailyStatistic>()
    for (const record of currentWeekRecords) map.set(record.date.slice(0, 10), record)
    return map
  }, [currentWeekRecords])

  const currentWeek = weeks[0]

  const chartData = useMemo(
    () => (currentWeek?.days ?? []).map((day) => ({
      day: day.weekdayLabel.toLocaleUpperCase("es-AR"),
      guests: recordsByDate.get(day.dateKey)?.totalGuests ?? 0,
    })),
    [currentWeek, recordsByDate],
  )

  const loadedDaysCount = currentWeek?.days.filter((day) => day.status === "completed").length ?? 0
  const totalDays = currentWeek?.days.length ?? 7
  const totalGuests = currentWeekRecords.reduce((sum, record) => sum + record.totalGuests, 0)

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="bg-green-300/20 p-3 rounded-full dark:bg-green-300/10">
          <CalendarDaysIcon className="text-green-600 size-4" />
        </div>
        <div>
          <CardTitle>Estadísticas</CardTitle>
          <p className="text-sm text-muted-foreground">
            Semana actual{currentWeek ? ` · ${currentWeek.rangeLabel}` : ""}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {isLoading ? (
          <div className="space-y-4" role="status" aria-label="Cargando estadísticas de la semana">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : isError && currentWeekRecords.length === 0 ? (
          <div role="alert" className="flex flex-col items-start gap-3 py-8">
            <p className="text-sm text-destructive">No se pudieron cargar las estadísticas de la semana.</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>Reintentar</Button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="px-2">
                <p className="text-sm text-muted-foreground">
                  <strong className="">Total: </strong>
                  <span className="text-muted-foreground text-lg">{totalGuests.toLocaleString("es-AR")}</span>
                </p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-950 dark:text-green-300">
                {loadedDaysCount} de {totalDays} días cargados
              </span>
            </div>

            {currentWeekRecords.length > 0 ? (
              <ChartContainer
                config={chartConfig}
                className="h-40 w-full"
                role="img"
                aria-label="Huéspedes registrados por día en la semana actual"
              >
                <BarChart accessibilityLayer data={chartData} margin={{ left: 0, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis allowDecimals={false} width={28} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltipContent nameKey="guests" />} />
                  <Bar dataKey="guests" fill="#15ee3981" radius={4} />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Sin cargas registradas esta semana.
              </p>
            )}
          </>
        )}

        <div className="mt-auto flex justify-end">
          <Link to={detailsPath} className={buttonVariants({ variant: "outline" })}>
            Ver más detalles
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
