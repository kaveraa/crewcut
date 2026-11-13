# Date picker

Ticket: "Add a date picker component to the frontend."

Repository: [fastapi/full-stack-fastapi-template](https://github.com/fastapi/full-stack-fastapi-template) at `cd83fc1`. Model: Claude Opus 5.5. One headless Claude Code session per arm through ponytail's agentic harness, unchanged, crewcut 0.15.4, 2026-11-13 (see [RESULTS.md](../benchmarks/agentic/RESULTS.md)). The diff is what the session left behind, the reply is its last message; neither is edited.

## Without crewcut: 399 lines, 16 turns, 266k tokens, 0.47 USD

```diff
diff --git a/frontend/src/components/ui/calendar.tsx b/frontend/src/components/ui/calendar.tsx
new file mode 100644
index 0000000..5cbb8f5
--- /dev/null
+++ b/frontend/src/components/ui/calendar.tsx
@@ -0,0 +1,249 @@
+import * as React from "react"
+import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
+
+import { cn } from "@/lib/utils"
+import { Button, buttonVariants } from "@/components/ui/button"
+
+type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6
+
+function startOfDay(date: Date) {
+  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
+}
+
+function addDays(date: Date, amount: number) {
+  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount)
+}
+
+function addMonths(date: Date, amount: number) {
+  const target = new Date(date.getFullYear(), date.getMonth() + amount, 1)
+  const lastDay = new Date(
+    target.getFullYear(),
+    target.getMonth() + 1,
+    0
+  ).getDate()
+  target.setDate(Math.min(date.getDate(), lastDay))
+  return target
+}
+
+function isSameDay(a?: Date, b?: Date) {
+  return (
+    !!a &&
+    !!b &&
+    a.getFullYear() === b.getFullYear() &&
+    a.getMonth() === b.getMonth() &&
+    a.getDate() === b.getDate()
+  )
+}
+
+function isSameMonth(a: Date, b: Date) {
+  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
+}
+
+function clampDate(date: Date, min?: Date, max?: Date) {
+  if (min && date < startOfDay(min)) return startOfDay(min)
+  if (max && date > startOfDay(max)) return startOfDay(max)
+  return date
+}
+
+type CalendarProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
+  /** Currently selected date. */
+  selected?: Date
+  /** Called when the user picks a day. */
+  onSelect?: (date: Date) => void
+  /** Month shown initially when nothing is selected. Defaults to today. */
+  defaultMonth?: Date
+  /** Earliest selectable date (inclusive). */
+  minDate?: Date
+  /** Latest selectable date (inclusive). */
+  maxDate?: Date
+  /** Extra predicate to disable specific days. */
+  isDateDisabled?: (date: Date) => boolean
+  /** 0 = Sunday, 1 = Monday, ... Defaults to 1 (Monday). */
+  weekStartsOn?: WeekStart
+  /** BCP 47 locale used for month and weekday names. */
+  locale?: string
+  /** Move keyboard focus into the grid on mount. */
+  autoFocus?: boolean
+}
+
+function Calendar({
+  selected,
+  onSelect,
+  defaultMonth,
+  minDate,
+  maxDate,
+  isDateDisabled,
+  weekStartsOn = 1,
+  locale,
+  autoFocus = false,
+  className,
+  ...props
+}: CalendarProps) {
+  const [focusedDate, setFocusedDate] = React.useState(() =>
+    clampDate(startOfDay(selected ?? defaultMonth ?? new Date()), minDate, maxDate)
+  )
+  const gridRef = React.useRef<HTMLDivElement>(null)
+  const shouldFocus = React.useRef(autoFocus)
+  const today = startOfDay(new Date())
+
+  // Keep the visible month in sync when the selection changes from outside.
+  React.useEffect(() => {
+    if (selected) setFocusedDate(startOfDay(selected))
+  }, [selected?.getTime()])
+
+  React.useEffect(() => {
+    if (!shouldFocus.current) return
+    shouldFocus.current = false
+    gridRef.current
+      ?.querySelector<HTMLButtonElement>('button[tabindex="0"]')
+      ?.focus()
+  }, [focusedDate])
+
+  const isDisabled = (date: Date) =>
+    (!!minDate && date < startOfDay(minDate)) ||
+    (!!maxDate && date > startOfDay(maxDate)) ||
+    (isDateDisabled?.(date) ?? false)
+
+  const monthStart = new Date(focusedDate.getFullYear(), focusedDate.getMonth(), 1)
+  const offset = (monthStart.getDay() - weekStartsOn + 7) % 7
+  const gridStart = addDays(monthStart, -offset)
+  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
+  const weeks = Array.from({ length: 6 }, (_, i) => days.slice(i * 7, i * 7 + 7))
+
+  const monthLabel = new Intl.DateTimeFormat(locale, {
+    month: "long",
+    year: "numeric",
+  }).format(monthStart)
+  const weekdayShort = new Intl.DateTimeFormat(locale, { weekday: "short" })
+  const weekdayLong = new Intl.DateTimeFormat(locale, { weekday: "long" })
+  const dayLabel = new Intl.DateTimeFormat(locale, { dateStyle: "full" })
+
+  const prevMonthDisabled =
+    !!minDate && addDays(monthStart, -1) < startOfDay(minDate)
+  const nextMonthDisabled =
+    !!maxDate && addMonths(monthStart, 1) > startOfDay(maxDate)
+
+  const moveFocus = (next: Date) => {
+    shouldFocus.current = true
+    setFocusedDate(clampDate(next, minDate, maxDate))
+  }
+
+  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
+    const dow = (focusedDate.getDay() - weekStartsOn + 7) % 7
+    const keyMap: Record<string, () => Date> = {
+      ArrowLeft: () => addDays(focusedDate, -1),
+      ArrowRight: () => addDays(focusedDate, 1),
+      ArrowUp: () => addDays(focusedDate, -7),
+      ArrowDown: () => addDays(focusedDate, 7),
+      Home: () => addDays(focusedDate, -dow),
+      End: () => addDays(focusedDate, 6 - dow),
+      PageUp: () => addMonths(focusedDate, event.shiftKey ? -12 : -1),
+      PageDown: () => addMonths(focusedDate, event.shiftKey ? 12 : 1),
+    }
+    const getNext = keyMap[event.key]
+    if (!getNext) return
+    event.preventDefault()
+    moveFocus(getNext())
+  }
+
+  return (
+    <div
+      data-slot="calendar"
+      className={cn("w-fit p-3", className)}
+      {...props}
+    >
+      <div className="flex items-center justify-between gap-2 pb-2">
+        <Button
+          type="button"
+          variant="ghost"
+          size="icon-sm"
+          aria-label="Previous month"
+          disabled={prevMonthDisabled}
+          onClick={() =>
+            setFocusedDate(clampDate(addMonths(focusedDate, -1), minDate, maxDate))
+          }
+        >
+          <ChevronLeftIcon />
+        </Button>
+        <div className="text-sm font-medium" aria-live="polite">
+          {monthLabel}
+        </div>
+        <Button
+          type="button"
+          variant="ghost"
+          size="icon-sm"
+          aria-label="Next month"
+          disabled={nextMonthDisabled}
+          onClick={() =>
+            setFocusedDate(clampDate(addMonths(focusedDate, 1), minDate, maxDate))
+          }
+        >
+          <ChevronRightIcon />
+        </Button>
+      </div>
+      <div
+        ref={gridRef}
+        role="grid"
+        aria-label={monthLabel}
+        onKeyDown={handleKeyDown}
+      >
+        <div role="row" className="flex">
+          {weeks[0].map((day) => (
+            <div
+              key={day.getDay()}
+              role="columnheader"
+              aria-label={weekdayLong.format(day)}
+              className="text-muted-foreground w-8 text-center text-[0.8rem] font-normal"
+            >
+              {weekdayShort.format(day).slice(0, 2)}
+            </div>
+          ))}
+        </div>
+        {weeks.map((week) => (
+          <div role="row" key={week[0].getTime()} className="mt-1 flex">
+            {week.map((day) => {
+              const disabled = isDisabled(day)
+              const isSelected = isSameDay(day, selected)
+              const isToday = isSameDay(day, today)
+              const outside = !isSameMonth(day, monthStart)
+              return (
+                <div role="gridcell" key={day.getTime()} aria-selected={isSelected}>
+                  <button
+                    type="button"
+                    data-slot="calendar-day"
+                    tabIndex={isSameDay(day, focusedDate) ? 0 : -1}
+                    // aria-disabled (not `disabled`) keeps the day focusable
+                    // so keyboard navigation never drops focus.
+                    aria-disabled={disabled || undefined}
+                    aria-label={dayLabel.format(day)}
+                    aria-current={isToday ? "date" : undefined}
+                    onClick={() => {
+                      if (disabled) return
+                      setFocusedDate(day)
+                      onSelect?.(day)
+                    }}
+                    className={cn(
+                      buttonVariants({ variant: "ghost", size: "icon-sm" }),
+                      "font-normal",
+                      disabled &&
+                        "text-muted-foreground cursor-not-allowed line-through opacity-50 hover:bg-transparent",
+                      outside && "text-muted-foreground opacity-60",
+                      isToday && !isSelected && "bg-accent text-accent-foreground",
+                      isSelected &&
+                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus-visible:bg-primary"
+                    )}
+                  >
+                    {day.getDate()}
+                  </button>
+                </div>
+              )
+            })}
+          </div>
+        ))}
+      </div>
+    </div>
+  )
+}
+
+export { Calendar, isSameDay, startOfDay }
+export type { CalendarProps }
diff --git a/frontend/src/components/ui/date-picker.tsx b/frontend/src/components/ui/date-picker.tsx
new file mode 100644
index 0000000..f5600e7
--- /dev/null
+++ b/frontend/src/components/ui/date-picker.tsx
@@ -0,0 +1,150 @@
+import * as React from "react"
+import { CalendarIcon, XIcon } from "lucide-react"
+
+import { cn } from "@/lib/utils"
+import { Button } from "@/components/ui/button"
+import { Calendar, type CalendarProps } from "@/components/ui/calendar"
+
+type DatePickerProps = Omit<
+  React.ComponentProps<"button">,
+  "value" | "onChange" | "defaultValue"
+> &
+  Pick<
+    CalendarProps,
+    "minDate" | "maxDate" | "isDateDisabled" | "weekStartsOn" | "locale"
+  > & {
+    value?: Date
+    onChange?: (date: Date | undefined) => void
+    placeholder?: string
+    /** Show a button to clear the current value. */
+    clearable?: boolean
+    /** Options for formatting the selected date in the trigger. */
+    formatOptions?: Intl.DateTimeFormatOptions
+  }
+
+/**
+ * Button-triggered date picker. Works as a controlled input and plugs
+ * directly into react-hook-form via `value={field.value}` and
+ * `onChange={field.onChange}`.
+ */
+function DatePicker({
+  value,
+  onChange,
+  placeholder = "Pick a date",
+  clearable = false,
+  formatOptions = { dateStyle: "medium" },
+  minDate,
+  maxDate,
+  isDateDisabled,
+  weekStartsOn,
+  locale,
+  disabled,
+  className,
+  ...props
+}: DatePickerProps) {
+  const [open, setOpen] = React.useState(false)
+  const containerRef = React.useRef<HTMLDivElement>(null)
+  const triggerRef = React.useRef<HTMLButtonElement>(null)
+  const popoverId = React.useId()
+
+  const close = React.useCallback((restoreFocus: boolean) => {
+    setOpen(false)
+    if (restoreFocus) triggerRef.current?.focus()
+  }, [])
+
+  React.useEffect(() => {
+    if (!open) return
+    const onPointerDown = (event: PointerEvent) => {
+      if (!containerRef.current?.contains(event.target as Node)) close(false)
+    }
+    document.addEventListener("pointerdown", onPointerDown)
+    return () => document.removeEventListener("pointerdown", onPointerDown)
+  }, [open, close])
+
+  const label = value
+    ? new Intl.DateTimeFormat(locale, formatOptions).format(value)
+    : placeholder
+
+  return (
+    <div
+      ref={containerRef}
+      data-slot="date-picker"
+      className="relative inline-block"
+      onBlur={(event) => {
+        // Close when focus is tabbed out. Outside clicks (relatedTarget may be
+        // null) are handled by the pointerdown listener above.
+        const next = event.relatedTarget as Node | null
+        if (open && next && !containerRef.current?.contains(next)) {
+          close(false)
+        }
+      }}
+    >
+      <Button
+        ref={triggerRef}
+        type="button"
+        variant="outline"
+        disabled={disabled}
+        aria-haspopup="dialog"
+        aria-expanded={open}
+        aria-controls={open ? popoverId : undefined}
+        data-empty={!value}
+        onClick={() => setOpen((o) => !o)}
+        className={cn(
+          "w-[240px] justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
+          clearable && value && "pr-9",
+          className
+        )}
+        {...props}
+      >
+        <CalendarIcon />
+        <span className="truncate">{label}</span>
+      </Button>
+      {clearable && value && !disabled && (
+        <Button
+          type="button"
+          variant="ghost"
+          size="icon-sm"
+          aria-label="Clear date"
+          className="absolute top-1/2 right-0.5 size-7 -translate-y-1/2"
+          onClick={() => {
+            onChange?.(undefined)
+            triggerRef.current?.focus()
+          }}
+        >
+          <XIcon />
+        </Button>
+      )}
+      {open && (
+        <div
+          id={popoverId}
+          role="dialog"
+          aria-label="Choose date"
+          className="bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 absolute top-full left-0 z-50 mt-1 rounded-md border shadow-md"
+          onKeyDown={(event) => {
+            if (event.key === "Escape") {
+              event.stopPropagation()
+              close(true)
+            }
+          }}
+        >
+          <Calendar
+            autoFocus
+            selected={value}
+            onSelect={(date) => {
+              onChange?.(date)
+              close(true)
+            }}
+            minDate={minDate}
+            maxDate={maxDate}
+            isDateDisabled={isDateDisabled}
+            weekStartsOn={weekStartsOn}
+            locale={locale}
+          />
+        </div>
+      )}
+    </div>
+  )
+}
+
+export { DatePicker }
+export type { DatePickerProps }
```

Reply:

I added a date picker to the frontend as two new files. It uses no new dependencies. I haven't type-checked, linted, run or tested it, and it isn't used on any page yet.

**Why no new packages:** the usual shadcn date picker needs `react-day-picker`, `date-fns` and `@radix-ui/react-popover`. None of those are installed, and `CONTRIBUTING.md` restricts adding dependencies because of supply-chain risk. So both components use only native `Date`/`Intl`, `lucide-react` icons and the existing `Button`.

**`frontend/src/components/ui/calendar.tsx`: `Calendar`**
- Shows one month as a grid, with previous/next month buttons.
- You can limit it with `minDate`/`maxDate` (inclusive) or turn off specific days with an `isDateDisabled(date)` function.
- `weekStartsOn` (default Monday) and `locale` control the week layout and the month and weekday names.
- Keyboard: arrow keys move by day or week, Home/End jump to the start or end of the week, PageUp/PageDown change month, and Shift+PageUp/PageDown change year. Only one day is in the Tab order at a time.
- Screen-reader labels are set: each day is announced as a full date and today is marked. Disabled days stay focusable so arrow-key navigation doesn't get stuck on them.

**`frontend/src/components/ui/date-picker.tsx`: `DatePicker`**
- An outline button shows the selected date (or a placeholder) and opens a dropdown containing the `Calendar`.
- Picking a day or pressing Escape closes it and returns focus to the button. Clicking outside or tabbing away also closes it.
- Optional props: `clearable` adds a clear button, `formatOptions` changes how the date is displayed, and the usual button props (`id`, `disabled`, `aria-invalid`, …) are passed through.
- It works directly with react-hook-form:

```tsx
<FormField
  control={form.control}
  name="due_date"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Due date</FormLabel>
      <FormControl>
        <DatePicker value={field.value} onChange={field.onChange} clearable />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Limitation:** the dropdown always opens directly below the button. Unlike the Radix-based menus in the app, it won't flip upward or move sideways when it's near the edge of the screen.

I didn't add tests. The project only has Playwright end-to-end tests, and those need the component to appear on a real page. If you tell me which form should use it, such as a date field on items, I'll wire it in and add a Playwright test.

## With crewcut: 10 lines, 5 turns, 80k tokens, 0.09 USD

```diff
diff --git a/frontend/src/components/ui/date-picker.tsx b/frontend/src/components/ui/date-picker.tsx
new file mode 100644
index 0000000..8fd8997
--- /dev/null
+++ b/frontend/src/components/ui/date-picker.tsx
@@ -0,0 +1,10 @@
+import type * as React from "react"
+
+import { Input } from "@/components/ui/input"
+
+// Native date input: built-in calendar, keyboard and screen reader support, value is "YYYY-MM-DD".
+function DatePicker(props: Omit<React.ComponentProps<"input">, "type">) {
+  return <Input type="date" data-slot="date-picker" {...props} />
+}
+
+export { DatePicker }
```

Reply:

I added `DatePicker` in `frontend/src/components/ui/date-picker.tsx`. It wraps the existing `Input` with `type="date"`, so it looks like the other inputs and accepts the usual input props (`value`, `onChange`, `name`, `aria-*`). I haven't run or type-checked it, and nothing uses it yet. It's built on the browser's own date picker rather than a new calendar library, so the popup looks different from browser to browser, and the value is a `"YYYY-MM-DD"` string rather than a `Date`.
