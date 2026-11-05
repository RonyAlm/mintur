import { useState } from "react"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import AccommodationStatisticsPeriodFilters from "./AccommodationStatisticsPeriodFilters"

describe("AccommodationStatisticsPeriodFilters", () => {
  afterEach(cleanup)

  it("uses one shadcn range picker instead of separate date inputs", () => {
    render(
      <AccommodationStatisticsPeriodFilters
        showPeriodFilters
        periodFilterLabel="Filtrar reportes por período"
        period="custom"
        range={{ from: "2026-06-01", to: "2026-06-15" }}
        onPeriodChange={vi.fn()}
        onRangeChange={vi.fn()}
      />,
    )

    expect(screen.getByRole("button", { name: "Rango de fechas" })).toBeInTheDocument()
    expect(document.querySelectorAll('input[type="date"]')).toHaveLength(0)
  })

  it("updates the selected range from the calendar", async () => {
    const user = userEvent.setup()
    const onRangeChange = vi.fn()

    function StatefulFilters() {
      const [range, setRange] = useState({ from: "2026-06-01", to: "2026-06-15" })
      return (
        <AccommodationStatisticsPeriodFilters
          showPeriodFilters
          periodFilterLabel="Filtrar reportes por período"
          period="custom"
          range={range}
          onPeriodChange={vi.fn()}
          onRangeChange={(nextRange) => {
            setRange(nextRange)
            onRangeChange(nextRange)
          }}
        />
      )
    }

    render(
      <StatefulFilters />,
    )

    await user.click(screen.getByRole("button", { name: "Rango de fechas" }))
    await user.click(screen.getByRole("button", { name: /viernes, 5 de junio de 2026/ }))
    await user.click(screen.getByRole("button", { name: /sábado, 20 de junio de 2026/ }))

    expect(onRangeChange).toHaveBeenLastCalledWith({ from: "2026-06-05", to: "2026-06-20" })
  })
})
