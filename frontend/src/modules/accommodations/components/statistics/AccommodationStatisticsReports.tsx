import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AccommodationDailyStatistic, AccommodationStatisticsSummary } from "../../types/accommodation-statistics.types"
import { ageLabels, originTypeLabels, purposeLabels } from "../../constants/accommodation-statistics-labels"
import { CalendarDaysIcon, ChartArea, ChartBar, ChartPie, Globe2Icon, Users2Icon } from "lucide-react"

const chartConfig = {
  quantity: { label: "Huéspedes", color: "var(--primary)" },
}

const chartColors = ["#2563EB", "#06B6D4", "#10B981", "#F59E0B", "#F43F5E", "#8B5CF6", "#14B8A6", "#F97316"]

function SummaryCard({ title, value, description, icon }: { title: string; value: string | number; description: string, icon: string }) {
  let IconCard = Users2Icon
  if (icon) {
    if (icon === "users") {
      IconCard = Users2Icon
    } else if (icon === "calendar") {
      IconCard = CalendarDaysIcon
    } else if (icon === "globe") {
      IconCard = Globe2Icon
    }

  }

  return <Card>
    <CardHeader className="flex flex-row gap-4 items-center">
      <div className="p-3 rounded-full bg-green-200/20 dark:bg-green-200/10">
        <IconCard className="text-green-600 size-4" />
      </div>
      <CardTitle className="text-lg font-medium text-muted-foreground">{title}
      </CardTitle>
    </CardHeader>
    <CardContent className="pl-8">
      <div className="text-4xl font-semibold tracking-tight">{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
}

interface AccommodationStatisticsReportsProps {
  summary: AccommodationStatisticsSummary
  records: AccommodationDailyStatistic[]
}

export default function AccommodationStatisticsReports({ summary, records }: AccommodationStatisticsReportsProps) {
  const chartData = summary.ageRanges.map(({ ageRange, quantity }) => ({ name: ageLabels[ageRange] ?? ageRange, quantity }))
  const purposeChartData = summary.travelPurposes.map(({ purpose, quantity }) => ({ name: purposeLabels[purpose] ?? purpose, quantity }))
  const originChartData = summary.origins.map((origin) => ({
    name: `${origin.name} (${originTypeLabels[origin.type] ?? origin.type})`,
    quantity: origin.quantity,
  }))
  const guestTrendData = [...records]
    .sort((left, right) => left.date.slice(0, 10).localeCompare(right.date.slice(0, 10)))
    .map((record) => ({
      date: new Date(`${record.date.slice(0, 10)}T00:00:00`).toLocaleDateString("es-AR", { day: "2-digit", month: "short" }),
      guests: record.totalGuests,
    }))

  return <>
    <section className="grid gap-4 sm:grid-cols-3" aria-label="Resumen">
      <SummaryCard title="Huéspedes registrados" icon="users"
        value={summary.totalGuests.toLocaleString("es-AR")}
        description="Total para el período seleccionado" />
      <SummaryCard title="Registros diarios" icon="calendar"
        value={records.length.toLocaleString("es-AR")}
        description="Días con información cargada" />
      <SummaryCard title="Origen registrado" icon="globe"
        value={summary.origins.length.toLocaleString("es-AR")}
        description="Procedencias incluidas en el período" />
    </section>
    <Card>
      <CardHeader className="flex flex-row gap-4 items-center mb-4">
        <div className="p-3 rounded-full bg-green-200/20 dark:bg-green-200/10">
          <ChartArea className="text-green-600 size-4" />
        </div>
        <div>
          <CardTitle>Evolución diaria de huéspedes</CardTitle>
          <p className="text-sm text-muted-foreground">
            Huéspedes registrados por día en el período seleccionado.</p>
        </div>
      </CardHeader>
      <CardContent>
        {guestTrendData.length ?
          <ChartContainer
            config={{ guests: { label: "Huéspedes", color: "#15ee39" } }}
            className="h-72 w-full" role="img" aria-label="Huéspedes registrados por día">
            <AreaChart accessibilityLayer
              data={guestTrendData}
              margin={{ left: 4, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false}
                axisLine={false} tickMargin={8} />
              <YAxis allowDecimals={false} tickLine={false}
                axisLine={false} />
              <Tooltip content={<ChartTooltipContent nameKey="guests" />} />
              <Area type="monotone" dataKey="guests" stroke="#15ee39"
                strokeWidth={2} fill="#15ee39" fillOpacity={0.18}
                activeDot={{ r: 4 }} />
            </AreaChart>
          </ChartContainer>
          : <p className="py-12 text-center text-sm text-muted-foreground">Sin registros diarios para mostrar en este período.</p>}
      </CardContent>
    </Card>
    <section className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row gap-4 items-center mb-4">
          <div className="p-3 rounded-full bg-green-200/20 dark:bg-green-200/10">
            <ChartBar className="text-green-600 size-4" />
          </div>
          <CardTitle>Huéspedes por rango de edad</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length ?
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <BarChart accessibilityLayer data={chartData}
                margin={{ left: 4, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false}
                  axisLine={false} tickMargin={8} />
                <YAxis allowDecimals={false} tickLine={false}
                  axisLine={false} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="quantity"
                  radius={4}>{chartData.map((item, index) => <Cell key={item.name}
                    fill={chartColors[index % chartColors.length]} />)}
                </Bar>
              </BarChart>
            </ChartContainer>
            : <p className="py-12 text-center text-sm text-muted-foreground">Sin datos de edades para mostrar.</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row gap-4 items-center mb-4">
          <div className="p-3 rounded-full bg-green-200/20 dark:bg-green-200/10">
            <ChartPie className="text-green-600 size-4" />
          </div>
          <CardTitle>Huéspedes por motivo del viaje</CardTitle>
        </CardHeader>
        <CardContent>
          {purposeChartData.length ? <>
            <ChartContainer config={chartConfig} className="h-56 w-full"><PieChart><Pie data={purposeChartData} dataKey="quantity" nameKey="name" innerRadius={48} outerRadius={82} paddingAngle={2}>
              {purposeChartData.map((item, index) => <Cell key={item.name} fill={chartColors[index % chartColors.length]} />)}
            </Pie><Tooltip content={<ChartTooltipContent nameKey="name" />} /></PieChart></ChartContainer>
            <ul className="grid gap-x-4 gap-y-2 sm:grid-cols-2">{purposeChartData.map((item, index) => <li key={item.name} className="flex items-center justify-between gap-3 text-sm"><span className="flex min-w-0 items-center gap-2"><span aria-hidden="true" className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: chartColors[index % chartColors.length] }} /><span className="truncate">{item.name}</span></span><span className="font-medium tabular-nums">{item.quantity.toLocaleString("es-AR")}</span></li>)}</ul>
          </> : <p className="py-12 text-center text-sm text-muted-foreground">Sin datos de motivos para mostrar.</p>}
        </CardContent>
      </Card>
    </section>
    <Card>
      <CardHeader className="flex flex-row gap-4 items-center mb-4">
        <div className="p-3 rounded-full bg-green-200/20 dark:bg-green-200/10">
          <ChartBar className="text-green-600 size-4" />
        </div>
        <CardTitle>Procedencia de los huéspedes</CardTitle>
      </CardHeader>
      <CardContent className="px-8 mb-6">
        {originChartData.length > 0 &&
          <section aria-label="Gráfico de huéspedes por procedencia"
            className="mb-6">
            <h3 className="mb-4 text-sm">Huéspedes por procedencia</h3>
            <ChartContainer config={chartConfig}
              className="h-72 w-full">
              <BarChart accessibilityLayer layout="vertical"
                data={originChartData} margin={{ left: 8, right: 16 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" allowDecimals={false}
                  tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name"
                  width={140} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="quantity"
                  radius={4}>{originChartData.map((item, index) =>
                    <Cell key={item.name} fill={chartColors[index % chartColors.length]} />)}
                </Bar></BarChart></ChartContainer>
          </section>}
        {summary.origins.length ?
        <Table aria-label="Procedencia de los huéspedes"  className="border border-green-100 dark:border-green-900/40 mt-4">
          <TableHeader className="bg-green-100 dark:bg-green-900/40">
            <TableRow>
              <TableHead>Procedencia</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Huéspedes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.origins.map((origin, index) =>
              <TableRow key={`${origin.type}-${origin.name}-${index}`}>
                <TableCell className="font-medium">{origin.name}</TableCell>
                <TableCell>
                  {originTypeLabels[origin.type] ?? origin.type}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {origin.quantity.toLocaleString("es-AR")}
                </TableCell>
              </TableRow>)}
          </TableBody>
        </Table>
          : <p className="py-8 text-center text-sm text-muted-foreground">Sin datos de procedencia para mostrar.</p>}
      </CardContent>
    </Card>
  </>
}
