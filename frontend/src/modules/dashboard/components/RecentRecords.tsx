import { Link } from "react-router"
import { ArrowRightIcon, CalendarClock, UsersIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AccommodationDailyStatistic } from "@/modules/accommodations/types/accommodation-statistics.types"

interface RecentRecordsProps {
  records: AccommodationDailyStatistic[]
  /** Ruta a la que enlaza "Ver todos". */
  recordsPath: string
  /** Cantidad máxima de registros a mostrar. */
  limit?: number
}

function formatRecordDate(dateKey: string) {
  return new Date(`${dateKey.slice(0, 10)}T00:00:00`).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
  })
}

export default function RecentRecords({ records, recordsPath, limit = 5 }: RecentRecordsProps) {
  const recent = [...records]
    .sort((left, right) => right.date.slice(0, 10).localeCompare(left.date.slice(0, 10)))
    .slice(0, limit)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <div className=" bg-green-300/20 dark:bg-green-300/10 p-3 rounded-full">
            <CalendarClock className="size-4 text-green-600" aria-hidden="true" />
          </div>
          <CardTitle>Últimos registros</CardTitle>
        </div>
        <Link
          to={recordsPath}
          title="Ver todos"
          className="hover:text-green-600 hover:scale-105 transition-all flex items-center gap-1"
        >
          
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Link>
      </CardHeader>
      <CardContent className="px-6">
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sin cargas registradas en el período.
          </p>
        ) : (
          <ul className="divide-y divide-border/70">
            {recent.map((record) => (
              <li key={record.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="flex items-center gap-2 text-sm">
                  <UsersIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                  {formatRecordDate(record.date)}
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {record.totalGuests.toLocaleString("es-AR")} huéspedes
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link
          to={recordsPath}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Ver todos los registros
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  )
}
