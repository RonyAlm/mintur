import * as React from "react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"
import { cn } from "@/lib/utils"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 sm:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn("absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1", defaultClassNames.nav),
        button_previous: cn("inline-flex size-8 items-center justify-center rounded-md border border-transparent bg-transparent text-sm hover:bg-accent hover:text-accent-foreground", defaultClassNames.button_previous),
        button_next: cn("inline-flex size-8 items-center justify-center rounded-md border border-transparent bg-transparent text-sm hover:bg-accent hover:text-accent-foreground", defaultClassNames.button_next),
        month_caption: cn("flex h-8 w-full items-center justify-center px-8", defaultClassNames.month_caption),
        caption_label: cn("text-sm font-medium capitalize", defaultClassNames.caption_label),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn("flex-1 rounded-md text-center text-xs font-normal text-muted-foreground", defaultClassNames.weekday),
        week: cn("mt-1 flex w-full", defaultClassNames.week),
        day: cn("group/day relative aspect-square h-9 w-9 p-0 text-center text-sm", defaultClassNames.day),
        day_button: cn("inline-flex size-9 items-center justify-center rounded-md p-0 font-normal hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-selected:bg-primary aria-selected:text-primary-foreground", defaultClassNames.day_button),
        range_start: cn("rounded-l-md bg-accent", defaultClassNames.range_start),
        range_middle: cn("rounded-none bg-accent text-accent-foreground", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
        today: cn("rounded-md bg-accent/50 text-accent-foreground", defaultClassNames.today),
        outside: cn("text-muted-foreground opacity-50", defaultClassNames.outside),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      {...props}
    />
  )
}

export { Calendar }
