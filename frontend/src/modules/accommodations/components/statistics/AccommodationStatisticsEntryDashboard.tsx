import { Link } from "react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AccommodationDailyStatistic } from "../../types/accommodation-statistics.types"
import WeeklyCalendar from "./WeeklyCalendar"
import { ArrowRight, CalendarCheckIcon, ChartLine, Clock10Icon } from "lucide-react"
import { Progress,  ProgressLabel, ProgressValue } from "@/components/ui/progress"

interface AccommodationStatisticsEntryDashboardProps {
  accommodationId: string
  latestMonthlyRecord?: AccommodationDailyStatistic
  monthRecordsCount: number
  daysInMonth: number
  monthProgress: number
  onCreateForDate?: (dateKey: string) => void
  onViewRecord?: (recordId: string) => void
}

export default function AccommodationStatisticsEntryDashboard({
  accommodationId,
  latestMonthlyRecord,
  monthRecordsCount,
  daysInMonth,
  monthProgress,
  onCreateForDate,
  onViewRecord,
}: AccommodationStatisticsEntryDashboardProps) {
  return <>
    <Card className="flex flex-col gap-2">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className=" bg-green-300/20 dark:bg-green-300/10 p-3 rounded-full">
           <CalendarCheckIcon className="text-green-600 size-4" />
        </div>
        <CardTitle className="text-lg">Estado de carga</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <WeeklyCalendar
          accommodationId={accommodationId}
          onCreateForDate={onCreateForDate}
          onViewRecord={onViewRecord}
        />
      </CardContent>
    </Card>
    <section className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className=" bg-green-300/20 dark:bg-green-300/10 p-3 rounded-full">
             <Clock10Icon className="text-green-600 size-4" />
          </div>
          <CardTitle className="text-lg">Última carga</CardTitle>
        </CardHeader>
      <CardContent className="px-8">
        {latestMonthlyRecord ? <>
         <p className="font-semibold">
          {new Date(`${latestMonthlyRecord.date.slice(0, 10)}T00:00:00`).toLocaleDateString("es-AR", { dateStyle: "long" })}</p>
          <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">Completada</span>
          <div className="mt-3 flex justify-end">
            <Link 
               to={`/estadisticas/mis-registros?accommodationId=${encodeURIComponent(accommodationId)}`}
               className="text-sm font-medium text-primary hover:underline">
                Ver registro
                <ArrowRight className="size-4 ml-2 inline-block" /> 
            </Link>
               </div></> : <p className="text-sm text-muted-foreground">Sin cargas registradas este mes.</p>}
      </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className=" bg-green-300/20 dark:bg-green-300/10 p-3 rounded-full">
             <ChartLine className="text-green-600 size-4" />
          </div>
          <CardTitle>
            Registros del mes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* <p className="font-semibold">{monthRecordsCount} de {daysInMonth} días</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-green-600 transition-all"
               style={{ width: `${monthProgress}%` }} />
               </div>
               <span 
                  className="text-xs tabular-nums text-muted-foreground">
                    {monthProgress}%
               </span>
          </div> */}
          <Progress className="mt-3" value={monthProgress}>
            <ProgressLabel >{monthRecordsCount} de {daysInMonth} días</ProgressLabel>
            <ProgressValue />
          </Progress>
        </CardContent>
      </Card>
    </section>
  </>
}
