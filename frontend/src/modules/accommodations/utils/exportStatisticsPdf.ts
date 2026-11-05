import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import type {
  AccommodationDailyStatistic,
  AccommodationStatisticsSummary,
} from "../types/accommodation-statistics.types"
import { ageLabels, originTypeLabels, purposeLabels } from "../constants/accommodation-statistics-labels"

interface ExportStatisticsPdfRange {
  from: string
  to: string
}

interface ExportStatisticsPdfOptions {
  range: ExportStatisticsPdfRange
  title?: string
  fileName?: string
}

type Rgb = [number, number, number]

interface ChartDatum {
  label: string
  value: number
  color: Rgb
}

type PdfDoc = jsPDF & { lastAutoTable?: { finalY: number } }

const PAGE_MARGIN = 14
const GREEN_HEADER: Rgb = [22, 163, 74]
const GREEN_TEXT: Rgb = [22, 101, 52]

const chartColors: Rgb[] = [
  [37, 99, 235], [6, 182, 212], [16, 185, 129], [245, 158, 11],
  [244, 63, 94], [139, 92, 246], [20, 184, 166], [249, 115, 22],
]

function colorFor(index: number): Rgb {
  return chartColors[index % chartColors.length]
}

function lighten([r, g, b]: Rgb, factor: number): Rgb {
  return [
    Math.round(r + (255 - r) * factor),
    Math.round(g + (255 - g) * factor),
    Math.round(b + (255 - b) * factor),
  ]
}

function formatDate(value: string) {
  if (!value) return "—"
  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function toNumber(value: number) {
  return value.toLocaleString("es-AR")
}

function drawVerticalBarChart(
  doc: jsPDF,
  data: ChartDatum[],
  options: { x: number; y: number; width: number; height: number },
) {
  if (data.length === 0) return
  const { x, y, width, height } = options
  const padLeft = 8
  const padBottom = 24
  const padTop = 10
  const plotWidth = width - padLeft - 8
  const plotHeight = height - padTop - padBottom
  const maxValue = Math.max(1, ...data.map((d) => d.value))
  const baseline = y + padTop + plotHeight
  const leftX = x + padLeft
  const rightX = x + width - 8

  doc.setDrawColor(200)
  doc.setLineWidth(0.3)
  doc.moveTo(leftX, baseline)
  doc.lineTo(rightX, baseline)
  doc.stroke()

  const slot = plotWidth / data.length
  const barWidth = Math.min(22, slot * 0.6)

  data.forEach((d, index) => {
    const centerX = leftX + slot * index + slot / 2
    const barHeight = (d.value / maxValue) * plotHeight
    const barX = centerX - barWidth / 2
    const barY = baseline - barHeight

    doc.setFillColor(d.color[0], d.color[1], d.color[2])
    doc.rect(barX, barY, barWidth, barHeight, "F")

    doc.setFontSize(8)
    doc.setTextColor(60)
    doc.text(String(d.value), centerX, barY - 2, { align: "center" })

    doc.setFontSize(6)
    doc.setTextColor(110)
    doc.text(d.label, centerX, baseline + 6, { align: "right", angle: 45 })
  })
}

function drawHorizontalBarChart(
  doc: jsPDF,
  data: ChartDatum[],
  options: { x: number; y: number; width: number; height: number },
) {
  if (data.length === 0) return
  const { x, y, width, height } = options
  const labelWidth = 52
  const valueWidth = 20
  const plotX = x + labelWidth
  const plotWidth = width - labelWidth - valueWidth
  const maxValue = Math.max(1, ...data.map((d) => d.value))
  const rowHeight = Math.min(14, height / data.length)

  data.forEach((d, index) => {
    const rowY = y + index * rowHeight
    const barLength = (d.value / maxValue) * plotWidth

    doc.setFontSize(7)
    doc.setTextColor(60)
    doc.text(d.label, plotX - 3, rowY + rowHeight / 2 + 2, {
      align: "right",
      maxWidth: labelWidth - 6,
    })

    doc.setFillColor(d.color[0], d.color[1], d.color[2])
    doc.rect(plotX, rowY + 2, barLength, rowHeight - 6, "F")

    doc.setFontSize(7)
    doc.setTextColor(60)
    doc.text(String(d.value), plotX + barLength + 2, rowY + rowHeight / 2 + 2, { align: "left" })
  })
}

function drawPieChart(
  doc: jsPDF,
  data: ChartDatum[],
  options: { cx: number; cy: number; radius: number },
) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total <= 0) return
  const { cx, cy, radius } = options
  let start = -Math.PI / 2

  data.forEach((d) => {
    const sweep = (d.value / total) * Math.PI * 2
    doc.setFillColor(d.color[0], d.color[1], d.color[2])
    doc.moveTo(cx, cy)
    const steps = Math.max(4, Math.ceil(sweep / (Math.PI / 32)))
    for (let i = 0; i <= steps; i++) {
      const angle = start + (sweep * i) / steps
      doc.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle))
    }
    doc.close()
    doc.fill()
    start += sweep
  })
}

function drawLegend(
  doc: jsPDF,
  data: ChartDatum[],
  x: number,
  y: number,
) {
  let legendY = y
  doc.setFontSize(7)
  data.forEach((d) => {
    doc.setFillColor(d.color[0], d.color[1], d.color[2])
    doc.rect(x, legendY - 2.5, 3.5, 3.5, "F")
    doc.setTextColor(60)
    doc.text(`${d.label} · ${toNumber(d.value)}`, x + 6, legendY)
    legendY += 5.5
  })
}

function drawLineChart(
  doc: jsPDF,
  data: { label: string; value: number }[],
  options: { x: number; y: number; width: number; height: number; color: Rgb },
) {
  if (data.length === 0) return
  const { x, y, width, height, color } = options
  const padLeft = 26
  const padRight = 8
  const padTop = 10
  const padBottom = 16
  const plotWidth = width - padLeft - padRight
  const plotHeight = height - padTop - padBottom
  const maxValue = Math.max(1, ...data.map((d) => d.value))
  const baselineY = y + padTop + plotHeight
  const leftX = x + padLeft
  const rightX = x + width - padRight

  const pointFor = (index: number) => {
    const px = data.length === 1
      ? leftX + plotWidth / 2
      : leftX + (plotWidth / (data.length - 1)) * index
    const py = baselineY - (data[index].value / maxValue) * plotHeight
    return { px, py }
  }

  doc.setFontSize(7)
  doc.setTextColor(110)
  doc.setDrawColor(225)
  doc.setLineWidth(0.15)
  const tickCount = 4
  for (let i = 0; i <= tickCount; i++) {
    const value = Math.round((maxValue / tickCount) * i)
    const ty = baselineY - (plotHeight / tickCount) * i
    doc.text(String(value), leftX - 3, ty + 2, { align: "right" })
    doc.moveTo(leftX, ty)
    doc.lineTo(rightX, ty)
    doc.stroke()
  }

  // Area fill under the line.
  const areaFill = lighten(color, 0.82)
  doc.setFillColor(areaFill[0], areaFill[1], areaFill[2])
  doc.moveTo(pointFor(0).px, baselineY)
  for (let i = 0; i < data.length; i++) doc.lineTo(pointFor(i).px, pointFor(i).py)
  doc.lineTo(pointFor(data.length - 1).px, baselineY)
  doc.close()
  doc.fill()

  // Line.
  doc.setDrawColor(color[0], color[1], color[2])
  doc.setLineWidth(0.6)
  doc.moveTo(pointFor(0).px, pointFor(0).py)
  for (let i = 1; i < data.length; i++) doc.lineTo(pointFor(i).px, pointFor(i).py)
  doc.stroke()

  // Dots.
  doc.setFillColor(color[0], color[1], color[2])
  const dotRadius = data.length > 40 ? 0 : 0.9
  for (let i = 0; i < data.length; i++) {
    doc.circle(pointFor(i).px, pointFor(i).py, dotRadius, "F")
  }

  // X-axis labels, downsampled so they stay readable.
  const labelCount = Math.min(data.length, 8)
  doc.setFontSize(6)
  doc.setTextColor(110)
  for (let i = 0; i < labelCount; i++) {
    const index = labelCount === 1
      ? Math.floor((data.length - 1) / 2)
      : Math.round((i / (labelCount - 1)) * (data.length - 1))
    doc.text(data[index].label, pointFor(index).px, baselineY + 5, { align: "center" })
  }
}

export function exportAccommodationStatisticsToPdf(
  summary: AccommodationStatisticsSummary,
  records: AccommodationDailyStatistic[],
  options: ExportStatisticsPdfOptions,
) {
  const { range, title = "Reporte de estadísticas", fileName } = options
  const doc = new jsPDF() as PdfDoc
  const marginX = PAGE_MARGIN
  const contentWidth = 210 - PAGE_MARGIN * 2
  let cursorY = 20

  function ensureSpace(neededHeight: number) {
    const pageHeight = doc.internal.pageSize.getHeight()
    if (cursorY + neededHeight > pageHeight - PAGE_MARGIN) {
      doc.addPage()
      cursorY = 20
    }
  }

  function addSectionTitle(sectionTitle: string) {
    ensureSpace(18)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(GREEN_TEXT[0], GREEN_TEXT[1], GREEN_TEXT[2])
    doc.text(sectionTitle, marginX, cursorY)
    cursorY += 7
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
  }

  function drawTable(head: string[], body: (string | number)[][]) {
    if (body.length === 0) return
    ensureSpace(25)
    autoTable(doc, {
      startY: cursorY,
      head: [head],
      body,
      theme: "grid",
      headStyles: { fillColor: GREEN_HEADER, textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 2.5 },
    })
    cursorY = (doc.lastAutoTable?.finalY ?? cursorY) + 10
  }

  function drawEmptyNote() {
    doc.setFontSize(9)
    doc.setTextColor(130)
    doc.text("Sin datos para mostrar en este período.", marginX, cursorY + 4)
    cursorY += 10
    doc.setTextColor(0, 0, 0)
  }

  // ── Encabezado ────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.setTextColor(GREEN_TEXT[0], GREEN_TEXT[1], GREEN_TEXT[2])
  doc.text(title, marginX, cursorY)
  cursorY += 8

  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.setTextColor(60, 60, 60)
  doc.text(`Período: ${formatDate(range.from)} – ${formatDate(range.to)}`, marginX, cursorY)
  cursorY += 6

  doc.setFontSize(10)
  doc.text(
    `Huéspedes registrados: ${toNumber(summary.totalGuests)}   ·   Registros diarios: ${records.length}   ·   Origenes registrados: ${summary.origins.length}`,
    marginX,
    cursorY,
  )
  cursorY += 12

  // ── Evolución diaria de huéspedes ────────────────────────────────────────
  const guestTrendData = [...records]
    .sort((left, right) => left.date.slice(0, 10).localeCompare(right.date.slice(0, 10)))
    .map((record) => ({
      label: formatDate(record.date),
      value: record.totalGuests,
    }))

  addSectionTitle("Evolución diaria de huéspedes")
  if (guestTrendData.length) {
    ensureSpace(60)
    drawLineChart(doc, guestTrendData, {
      x: marginX,
      y: cursorY,
      width: contentWidth,
      height: 50,
      color: [21, 238, 57],
    })
    cursorY += 55
    drawTable(
      ["Fecha", "Huéspedes"],
      guestTrendData.map((d) => [d.label, toNumber(d.value)]),
    )
  } else {
    drawEmptyNote()
  }

  // ── Huéspedes por rango de edad ──────────────────────────────────────────
  const ageData = summary.ageRanges.map(({ ageRange, quantity }, index) => ({
    label: ageLabels[ageRange] ?? ageRange,
    value: quantity,
    color: colorFor(index),
  }))

  addSectionTitle("Huéspedes por rango de edad")
  if (ageData.length) {
    ensureSpace(60)
    drawVerticalBarChart(doc, ageData, {
      x: marginX,
      y: cursorY,
      width: contentWidth,
      height: 48,
    })
    cursorY += 52
    drawTable(
      ["Rango de edad", "Huéspedes"],
      ageData.map((d) => [d.label, toNumber(d.value)]),
    )
  } else {
    drawEmptyNote()
  }

  // ── Huéspedes por motivo del viaje ───────────────────────────────────────
  const purposeData = summary.travelPurposes.map(({ purpose, quantity }, index) => ({
    label: purposeLabels[purpose] ?? purpose,
    value: quantity,
    color: colorFor(index),
  }))

  addSectionTitle("Huéspedes por motivo del viaje")
  if (purposeData.length) {
    ensureSpace(60)
    const pieRadius = 28
    const pieCx = marginX + pieRadius
    const pieCy = cursorY + pieRadius
    drawPieChart(doc, purposeData, { cx: pieCx, cy: pieCy, radius: pieRadius })
    drawLegend(doc, purposeData, marginX + pieRadius * 2 + 14, cursorY + 6)
    cursorY += pieRadius * 2 + 8
    drawTable(
      ["Motivo", "Huéspedes"],
      purposeData.map((d) => [d.label, toNumber(d.value)]),
    )
  } else {
    drawEmptyNote()
  }

  // ── Procedencia de los huéspedes ─────────────────────────────────────────
  const originData = summary.origins.map((origin, index) => ({
    label: `${origin.name} (${originTypeLabels[origin.type] ?? origin.type})`,
    value: origin.quantity,
    color: colorFor(index),
  }))

  addSectionTitle("Procedencia de los huéspedes")
  if (originData.length) {
    const chartHeight = Math.max(28, originData.length * 14)
    ensureSpace(chartHeight + 20)
    drawHorizontalBarChart(doc, originData, {
      x: marginX,
      y: cursorY,
      width: contentWidth,
      height: chartHeight,
    })
    cursorY += chartHeight + 8
    drawTable(
      ["Procedencia", "Tipo", "Huéspedes"],
      summary.origins.map((origin) => [
        origin.name,
        originTypeLabels[origin.type] ?? origin.type,
        toNumber(origin.quantity),
      ]),
    )
  } else {
    drawEmptyNote()
  }

  const safeFileName = (fileName ?? title)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()

  doc.save(`${safeFileName || "reporte-estadisticas"}.pdf`)
}
